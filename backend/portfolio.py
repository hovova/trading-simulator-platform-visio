from datetime import datetime

portfolio = {
    "cash": 100000.00,
    "holdings": {},
    "trades": []
}


def get_portfolio():
    return portfolio


def buy_stock(symbol: str, quantity: int, price: float):
    symbol = symbol.upper()
    total_cost = quantity * price

    if quantity <= 0:
        return {"error": "Quantity must be greater than 0"}

    if portfolio["cash"] < total_cost:
        return {"error": "Not enough cash to complete this trade"}

    portfolio["cash"] -= total_cost

    if symbol not in portfolio["holdings"]:
        portfolio["holdings"][symbol] = {
            "quantity": 0,
            "average_price": 0
        }

    current_quantity = portfolio["holdings"][symbol]["quantity"]
    current_average_price = portfolio["holdings"][symbol]["average_price"]

    new_quantity = current_quantity + quantity
    new_average_price = (
        (current_quantity * current_average_price) + total_cost
    ) / new_quantity

    portfolio["holdings"][symbol]["quantity"] = new_quantity
    portfolio["holdings"][symbol]["average_price"] = round(new_average_price, 2)

    trade = {
        "type": "BUY",
        "symbol": symbol,
        "quantity": quantity,
        "price": price,
        "total": round(total_cost, 2),
        "timestamp": datetime.now().isoformat()
    }

    portfolio["trades"].append(trade)

    return {
        "message": "Buy order completed",
        "trade": trade,
        "portfolio": portfolio
    }


def sell_stock(symbol: str, quantity: int, price: float):
    symbol = symbol.upper()

    if quantity <= 0:
        return {"error": "Quantity must be greater than 0"}

    if symbol not in portfolio["holdings"]:
        return {"error": "You do not own this stock"}

    if portfolio["holdings"][symbol]["quantity"] < quantity:
        return {"error": "Not enough shares to sell"}

    total_sale = quantity * price

    portfolio["cash"] += total_sale
    portfolio["holdings"][symbol]["quantity"] -= quantity

    if portfolio["holdings"][symbol]["quantity"] == 0:
        del portfolio["holdings"][symbol]

    trade = {
        "type": "SELL",
        "symbol": symbol,
        "quantity": quantity,
        "price": price,
        "total": round(total_sale, 2),
        "timestamp": datetime.now().isoformat()
    }

    portfolio["trades"].append(trade)

    return {
        "message": "Sell order completed",
        "trade": trade,
        "portfolio": portfolio
    }


def get_trades():
    return portfolio["trades"]