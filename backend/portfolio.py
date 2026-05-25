from datetime import datetime

from database import get_connection


def get_portfolio():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT cash FROM account WHERE id = 1")
    account = cursor.fetchone()

    cursor.execute("SELECT symbol, quantity, average_price FROM holdings")
    holdings_rows = cursor.fetchall()

    cursor.execute("""
        SELECT trade_type, symbol, quantity, price, total, timestamp
        FROM trades
        ORDER BY id DESC
    """)
    trade_rows = cursor.fetchall()

    connection.close()

    holdings = {}

    for row in holdings_rows:
        holdings[row["symbol"]] = {
            "quantity": row["quantity"],
            "average_price": row["average_price"]
        }

    trades = []

    for row in trade_rows:
        trades.append({
            "type": row["trade_type"],
            "symbol": row["symbol"],
            "quantity": row["quantity"],
            "price": row["price"],
            "total": row["total"],
            "timestamp": row["timestamp"]
        })

    return {
        "cash": account["cash"],
        "holdings": holdings,
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
        INSERT INTO trades (trade_type, symbol, quantity, price, total, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("BUY", symbol, quantity, price, total_cost, timestamp))

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

    total_sale = round(quantity * price, 2)
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
        INSERT INTO trades (trade_type, symbol, quantity, price, total, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, ("SELL", symbol, quantity, price, total_sale, timestamp))

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
            "timestamp": timestamp
        },
        "portfolio": get_portfolio()
    }


def get_trades():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT trade_type, symbol, quantity, price, total, timestamp
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
            "timestamp": row["timestamp"]
        })

    return trades