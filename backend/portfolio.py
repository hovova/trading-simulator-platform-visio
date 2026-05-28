from datetime import datetime

from database import get_connection
from market_data import fetch_price


def get_portfolio():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    if account is None:
        cursor.execute(
            "INSERT INTO account (id, cash) VALUES (1, ?)",
            (100000.00,)
        )
        connection.commit()

        cursor.execute("SELECT cash FROM account WHERE id = 1")
        account = cursor.fetchone()

    cursor.execute("SELECT symbol, quantity, average_price FROM holdings")
    holdings_rows = cursor.fetchall()

    cursor.execute("""
        SELECT trade_type, symbol, quantity, price, total, timestamp, realised_pnl
        FROM trades
        ORDER BY id DESC
    """)
    trade_rows = cursor.fetchall()

    cursor.execute("""
        SELECT SUM(realised_pnl) AS total_realised_pnl
        FROM trades
    """)
    realised_pnl_row = cursor.fetchone()

    connection.close()

    cash = round(account["cash"], 2)
    holdings = {}

    total_market_value = 0
    total_cost_basis = 0

    for row in holdings_rows:
        symbol = row["symbol"]
        quantity = row["quantity"]
        average_price = row["average_price"]

        current_price = fetch_price(symbol)

        if current_price is None:
            current_price = average_price

        market_value = round(quantity * current_price, 2)
        cost_basis = round(quantity * average_price, 2)
        unrealised_pnl = round(market_value - cost_basis, 2)

        if cost_basis > 0:
            unrealised_return_percent = round((unrealised_pnl / cost_basis) * 100, 2)
        else:
            unrealised_return_percent = 0

        total_market_value += market_value
        total_cost_basis += cost_basis

        holdings[symbol] = {
            "quantity": quantity,
            "average_price": average_price,
            "current_price": current_price,
            "market_value": market_value,
            "cost_basis": cost_basis,
            "unrealised_pnl": unrealised_pnl,
            "unrealised_return_percent": unrealised_return_percent
        }

    total_portfolio_value = round(cash + total_market_value, 2)
    total_unrealised_pnl = round(total_market_value - total_cost_basis, 2)
    total_realised_pnl = round(realised_pnl_row["total_realised_pnl"] or 0, 2)
    total_pnl = round(total_realised_pnl + total_unrealised_pnl, 2)

    if total_cost_basis > 0:
        total_unrealised_return_percent = round(
            (total_unrealised_pnl / total_cost_basis) * 100,
            2
        )
    else:
        total_unrealised_return_percent = 0

    trades = []

    for row in trade_rows:
        trades.append({
            "type": row["trade_type"],
            "symbol": row["symbol"],
            "quantity": row["quantity"],
            "price": row["price"],
            "total": row["total"],
            "realised_pnl": row["realised_pnl"],
            "timestamp": row["timestamp"]
        })

    return {
        "cash": cash,
        "holdings": holdings,
        "summary": {
            "total_market_value": round(total_market_value, 2),
            "total_cost_basis": round(total_cost_basis, 2),
            "total_portfolio_value": total_portfolio_value,
            "total_unrealised_pnl": total_unrealised_pnl,
            "total_unrealised_return_percent": total_unrealised_return_percent,
            "total_realised_pnl": total_realised_pnl,
            "total_pnl": total_pnl
        },
        "trades": trades
    }


def buy_stock(symbol: str, quantity: int, price: float):
    symbol = symbol.upper()
    total_cost = round(quantity * price, 2)

    if quantity <= 0:
        return {"error": "Quantity must be greater than 0"}

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    if account["cash"] < total_cost:
        connection.close()
        return {"error": "Not enough cash to complete this trade"}

    cursor.execute(
        "SELECT quantity, average_price FROM holdings WHERE symbol = ?",
        (symbol,)
    )
    holding = cursor.fetchone()

    if holding is None:
        new_quantity = quantity
        new_average_price = price

        cursor.execute("""
            INSERT INTO holdings (symbol, quantity, average_price)
            VALUES (?, ?, ?)
        """, (symbol, new_quantity, round(new_average_price, 2)))

    else:
        current_quantity = holding["quantity"]
        current_average_price = holding["average_price"]

        new_quantity = current_quantity + quantity
        new_average_price = (
            (current_quantity * current_average_price) + total_cost
        ) / new_quantity

        cursor.execute("""
            UPDATE holdings
            SET quantity = ?, average_price = ?
            WHERE symbol = ?
        """, (new_quantity, round(new_average_price, 2), symbol))

    new_cash = round(account["cash"] - total_cost, 2)

    cursor.execute(
        "UPDATE account SET cash = ? WHERE id = 1",
        (new_cash,)
    )

    timestamp = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO trades (
            trade_type, symbol, quantity, price, total, timestamp, realised_pnl
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("BUY", symbol, quantity, price, total_cost, timestamp, 0))

    connection.commit()
    connection.close()

    return {
        "message": "Buy order completed",
        "trade": {
            "type": "BUY",
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "total": total_cost,
            "realised_pnl": 0,
            "timestamp": timestamp
        },
        "portfolio": get_portfolio()
    }


def sell_stock(symbol: str, quantity: int, price: float):
    symbol = symbol.upper()

    if quantity <= 0:
        return {"error": "Quantity must be greater than 0"}

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        "SELECT quantity, average_price FROM holdings WHERE symbol = ?",
        (symbol,)
    )
    holding = cursor.fetchone()

    if holding is None:
        connection.close()
        return {"error": "You do not own this stock"}

    if holding["quantity"] < quantity:
        connection.close()
        return {"error": "Not enough shares to sell"}

    average_price = holding["average_price"]
    total_sale = round(quantity * price, 2)
    realised_pnl = round((price - average_price) * quantity, 2)

    remaining_quantity = holding["quantity"] - quantity

    if remaining_quantity == 0:
        cursor.execute(
            "DELETE FROM holdings WHERE symbol = ?",
            (symbol,)
        )
    else:
        cursor.execute("""
            UPDATE holdings
            SET quantity = ?
            WHERE symbol = ?
        """, (remaining_quantity, symbol))

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    new_cash = round(account["cash"] + total_sale, 2)

    cursor.execute(
        "UPDATE account SET cash = ? WHERE id = 1",
        (new_cash,)
    )

    timestamp = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO trades (
            trade_type, symbol, quantity, price, total, timestamp, realised_pnl
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, ("SELL", symbol, quantity, price, total_sale, timestamp, realised_pnl))

    connection.commit()
    connection.close()

    return {
        "message": "Sell order completed",
        "trade": {
            "type": "SELL",
            "symbol": symbol,
            "quantity": quantity,
            "price": price,
            "total": total_sale,
            "realised_pnl": realised_pnl,
            "timestamp": timestamp
        },
        "portfolio": get_portfolio()
    }


def get_trades():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT trade_type, symbol, quantity, price, total, timestamp, realised_pnl
        FROM trades
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()
    connection.close()

    trades = []

    for row in rows:
        trades.append({
            "type": row["trade_type"],
            "symbol": row["symbol"],
            "quantity": row["quantity"],
            "price": row["price"],
            "total": row["total"],
            "realised_pnl": row["realised_pnl"],
            "timestamp": row["timestamp"]
        })

    return trades


def reset_portfolio():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM trades")
    cursor.execute("DELETE FROM holdings")
    cursor.execute("UPDATE account SET cash = ? WHERE id = 1", (100000.00,))

    connection.commit()
    connection.close()

    return {
        "message": "Portfolio reset successfully",
        "portfolio": get_portfolio()
    }