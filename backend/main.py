from fastapi import FastAPI, HTTPException, Query   
from fastapi.middleware.cors import CORSMiddleware

from database import initialise_database
from market_data import (
    fetch_quote,
    fetch_price,
    search_symbols,
    fetch_market_news,
    fetch_stock_candles,
    fetch_company_profile,
    fetch_company_metrics,
)
from models import TradeRequest
from portfolio import get_portfolio, buy_stock, sell_stock, get_trades, reset_portfolio

app = FastAPI(
    title="Trading Simulator Platform API",
    description="A paper trading simulator backend using market price data.",
    version="0.2.0"
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


def handle_service_response(response):
    if isinstance(response, dict) and "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])

    return response


@app.get("/", tags=["Health"])
def home():
    return {
        "message": "Trading Simulator Platform API is running",
        "version": "0.2.0"
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "trading-simulator-api"
    }


@app.get("/quote/{symbol}", tags=["Market Data"])
def get_quote(symbol: str):
    response = fetch_quote(symbol)

    if isinstance(response, dict) and "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])

    return response

@app.get("/search/{query}", tags=["Market Data"])
def search(query: str):
    response = search_symbols(query)

    if isinstance(response, dict) and "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])

    return response

@app.get("/news", tags=["Market Data"])
def market_news(category: str = "general"):
    response = fetch_market_news(category)

    if isinstance(response, dict) and "error" in response:
        raise HTTPException(status_code=400, detail=response["error"])

    return response


@app.get("/portfolio", tags=["Portfolio"])
def portfolio():
    return get_portfolio()


@app.post("/buy", tags=["Trading"])
def buy(request: TradeRequest):
    symbol = request.symbol.upper().strip()
    price = fetch_price(symbol)

    if price is None or price == 0:
        raise HTTPException(
            status_code=400,
            detail="Could not fetch valid stock price"
        )

    response = buy_stock(symbol, request.quantity, price)
    return handle_service_response(response)


@app.post("/sell", tags=["Trading"])
def sell(request: TradeRequest):
    symbol = request.symbol.upper().strip()
    price = fetch_price(symbol)

    if price is None or price == 0:
        raise HTTPException(
            status_code=400,
            detail="Could not fetch valid stock price"
        )

    response = sell_stock(symbol, request.quantity, price)
    return handle_service_response(response)


@app.get("/trades", tags=["Trading"])
def trades():
    return get_trades()


@app.post("/reset", tags=["Portfolio"])
def reset():
    return reset_portfolio()

@app.get("/candles/{symbol}", tags=["Market Data"])
def candles(symbol: str, chart_range: str = Query("1mo", alias="range")):
    response = fetch_stock_candles(symbol, chart_range)

    if isinstance(response, dict) and "error" in response:
        raise HTTPException(status_code=400, detail=response)

    return response

@app.get("/company/{symbol}", tags=["Market Data"])
def company(symbol: str):
    profile = fetch_company_profile(symbol)
    metrics = fetch_company_metrics(symbol)

    if isinstance(profile, dict) and "error" in profile:
        raise HTTPException(status_code=400, detail=profile)

    if isinstance(metrics, dict) and "error" in metrics:
        metrics = {}

    return {
        "symbol": symbol.upper(),
        "profile": profile,
        "metrics": metrics
    }