import os
import time
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

def search_symbols(query: str):
    if not FINNHUB_API_KEY:
        return {
            "error": "Finnhub API key is missing. Check backend/.env."
        }

    url = "https://finnhub.io/api/v1/search"

    params = {
        "q": query,
        "token": FINNHUB_API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {
            "error": "Could not search symbols",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()
    results = data.get("result", [])

    cleaned_results = []

    for item in results[:10]:
        cleaned_results.append({
            "symbol": item.get("symbol"),
            "description": item.get("description"),
            "type": item.get("type"),
            "display_symbol": item.get("displaySymbol")
        })

    return {
        "query": query,
        "count": len(cleaned_results),
        "results": cleaned_results
    }

def fetch_market_news(category: str = "general"):
    if not FINNHUB_API_KEY:
        return {
            "error": "Finnhub API key is missing. Check backend/.env."
        }

    url = "https://finnhub.io/api/v1/news"

    params = {
        "category": category,
        "token": FINNHUB_API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {
            "error": "Could not fetch market news",
            "status_code": response.status_code,
            "details": response.text
        }

    data = response.json()

    cleaned_news = []

    for item in data[:12]:
        cleaned_news.append({
            "id": item.get("id"),
            "headline": item.get("headline"),
            "summary": item.get("summary"),
            "source": item.get("source"),
            "url": item.get("url"),
            "image": item.get("image"),
            "datetime": item.get("datetime"),
            "category": item.get("category")
        })

    return {
        "category": category,
        "count": len(cleaned_news),
        "news": cleaned_news
    }


def fetch_stock_candles(symbol: str, chart_range: str = "1mo"):
    allowed_ranges = {
        "1d": {
            "yahoo_range": "1d",
            "interval": "5m",
            "label": "1D"
        },
        "1w": {
            "yahoo_range": "5d",
            "interval": "1h",
            "label": "1W"
        },
        "1mo": {
            "yahoo_range": "1mo",
            "interval": "1d",
            "label": "1M"
        },
        "3mo": {
            "yahoo_range": "3mo",
            "interval": "1d",
            "label": "3M"
        },
        "ytd": {
            "yahoo_range": "ytd",
            "interval": "1d",
            "label": "YTD"
        },
        "1y": {
            "yahoo_range": "1y",
            "interval": "1wk",
            "label": "1Y"
        },
        "max": {
            "yahoo_range": "max",
            "interval": "1mo",
            "label": "MAX"
        },
    }

    selected_range = allowed_ranges.get(chart_range, allowed_ranges["1mo"])

    yahoo_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol.upper()}"

    yahoo_params = {
        "range": selected_range["yahoo_range"],
        "interval": selected_range["interval"],
    }

    yahoo_headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }

    yahoo_response = requests.get(
        yahoo_url,
        params=yahoo_params,
        headers=yahoo_headers
    )

    if yahoo_response.status_code != 200:
        return {
            "error": "Could not fetch stock candles",
            "yahoo_status_code": yahoo_response.status_code,
            "details": yahoo_response.text
        }

    yahoo_data = yahoo_response.json()

    chart = yahoo_data.get("chart", {})
    result_list = chart.get("result")
    yahoo_error = chart.get("error")

    if not result_list:
        return {
            "error": "No candle data available for this symbol",
            "details": yahoo_error or yahoo_data
        }

    result = result_list[0]
    timestamps = result.get("timestamp", [])
    quote_data = result.get("indicators", {}).get("quote", [{}])[0]

    open_prices = quote_data.get("open", [])
    high_prices = quote_data.get("high", [])
    low_prices = quote_data.get("low", [])
    close_prices = quote_data.get("close", [])
    volumes = quote_data.get("volume", [])

    candles = []

    for index, timestamp in enumerate(timestamps):
        close_price = close_prices[index]

        if close_price is None:
            continue

        candles.append({
            "date": timestamp,
            "open": open_prices[index],
            "high": high_prices[index],
            "low": low_prices[index],
            "close": close_price,
            "volume": volumes[index]
        })

    if len(candles) == 0:
        return {
            "error": "No usable candle prices returned for this symbol"
        }

    return {
        "symbol": symbol.upper(),
        "source": "Yahoo Finance",
        "range": chart_range,
        "range_label": selected_range["label"],
        "interval": selected_range["interval"],
        "count": len(candles),
        "candles": candles
    }