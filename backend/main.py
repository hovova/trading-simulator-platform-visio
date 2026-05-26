from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import initialise_database
from market_data import fetch_quote, fetch_price
from models import TradeRequest
from portfolio import get_portfolio, buy_stock, sell_stock, get_trades

app = FastAPI(
    title="Trading Simulator Platform API",
    description="A paper trading simulator backend using market price data.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    initialise_database()


@app.get("/")
def home():
    return {"message": "Trading Simulator Platform API is running"}


@app.get("/quote/{symbol}")
def get_quote(symbol: str):
    return fetch_quote(symbol)


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