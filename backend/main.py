import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

from portfolio import get_portfolio, buy_stock, sell_stock, get_trades

load_dotenv()

app = FastAPI()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")


class TradeRequest(BaseModel):
    symbol: str
    quantity: int


@app.get("/")
def home():
    return {"message": "Trading Simulator Platform API is running"}


def fetch_price(symbol: str):
    if not FINNHUB_API_KEY:
        return None

    url = "https://finnhub.io/api/v1/quote"
    params = {
        "symbol": symbol.upper(),
        "token": FINNHUB_API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return None

    data = response.json()
    return data.get("c")


@app.get("/quote/{symbol}")
def get_quote(symbol: str):
    if not FINNHUB_API_KEY:
        return {
            "error": "Finnhub API key is missing. Check backend/.env."
        }

    url = "https://finnhub.io/api/v1/quote"
    params = {
        "symbol": symbol.upper(),
        "token": FINNHUB_API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {
            "error": "Could not fetch stock price",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()

    return {
        "symbol": symbol.upper(),
        "current_price": data.get("c"),
        "high_price": data.get("h"),
        "low_price": data.get("l"),
        "open_price": data.get("o"),
        "previous_close": data.get("pc")
    }


@app.get("/portfolio")
def portfolio():
    return get_portfolio()


@app.post("/buy")
def buy(request: TradeRequest):
    price = fetch_price(request.symbol)

    if price is None or price == 0:
        return {"error": "Could not fetch valid stock price"}

    return buy_stock(request.symbol, request.quantity, price)


@app.post("/sell")
def sell(request: TradeRequest):
    price = fetch_price(request.symbol)

    if price is None or price == 0:
        return {"error": "Could not fetch valid stock price"}

    return sell_stock(request.symbol, request.quantity, price)


@app.get("/trades")
def trades():
    return get_trades()