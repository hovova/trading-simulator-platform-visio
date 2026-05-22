import os
import requests
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")


@app.get("/")
def home():
    return {"message": "Trading Simulator Platform API is running"}


@app.get("/quote/{symbol}")
def get_quote(symbol: str):
    if not FINNHUB_API_KEY:
        return {
            "error": "Finnhub API key is missing. Check that backend/.env exists and contains FINNHUB_API_KEY."
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