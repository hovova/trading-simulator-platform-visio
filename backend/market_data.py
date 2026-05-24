import os
import requests
from dotenv import load_dotenv

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")


def fetch_quote(symbol: str):
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


def fetch_price(symbol: str):
    quote = fetch_quote(symbol)

    if "error" in quote:
        return None

    return quote.get("current_price")