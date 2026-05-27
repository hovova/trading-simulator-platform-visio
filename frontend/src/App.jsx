import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";

function formatMoney(value) {
  if (value === undefined || value === null) return "$0.00";

  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatPercent(value) {
  if (value === undefined || value === null) return "0%";
  return `${value}%`;
}

function getPnLClass(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "";
}

function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const [tradeSymbol, setTradeSymbol] = useState("AAPL");
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function fetchPortfolio() {
    try {
      const response = await axios.get(`${API_BASE_URL}/portfolio`);
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setMessage({
        type: "error",
        text: "Could not load portfolio. Check that the backend is running.",
      });
    }
  }

  async function fetchQuote() {
    try {
      setLoading(true);
      setMessage(null);

      const response = await axios.get(`${API_BASE_URL}/quote/${symbol}`);

      if (response.data.error) {
        setMessage({
          type: "error",
          text: response.data.error,
        });
        return;
      }

      setQuote(response.data);
    } catch (error) {
      console.error("Error fetching quote:", error);
      setMessage({
        type: "error",
        text: "Could not fetch quote. Check ticker or backend server.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function placeTrade(type) {
    try {
      setTradeLoading(true);
      setMessage(null);

      const endpoint = type === "BUY" ? "/buy" : "/sell";

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        symbol: tradeSymbol,
        quantity: Number(tradeQuantity),
      });

      if (response.data.error) {
        setMessage({
          type: "error",
          text: response.data.error,
        });
        return;
      }

      setMessage({
        type: "success",
        text: response.data.message,
      });

      await fetchPortfolio();
    } catch (error) {
      console.error("Error placing trade:", error);
      setMessage({
        type: "error",
        text: "Trade failed. Check backend server and try again.",
      });
    } finally {
      setTradeLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-card">
          <p className="eyebrow">Visio Trading</p>
          <h1>Trading Simulator Platform</h1>
          <p className="subtitle">
            A paper trading dashboard for simulated stock positions, portfolio
            value, trade history and unrealised performance.
          </p>
        </div>
      </header>

      <main className="dashboard">
        {message && (
          <div className={`alert ${message.type}`}>
            {message.text}
          </div>
        )}

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Portfolio Summary</h2>
              <p className="muted">Live valuation based on current market prices.</p>
            </div>

            <button className="secondary-button" onClick={fetchPortfolio}>
              Refresh
            </button>
          </div>

          {portfolio ? (
            <div className="summary-grid">
              <div className="metric">
                <p className="label">Cash</p>
                <p className="value">{formatMoney(portfolio.cash)}</p>
              </div>

              <div className="metric">
                <p className="label">Portfolio Value</p>
                <p className="value">
                  {formatMoney(portfolio.summary?.total_portfolio_value)}
                </p>
              </div>

              <div className="metric">
                <p className="label">Unrealised P&L</p>
                <p className={`value ${getPnLClass(portfolio.summary?.total_unrealised_pnl)}`}>
                  {formatMoney(portfolio.summary?.total_unrealised_pnl)}
                </p>
              </div>

              <div className="metric">
                <p className="label">Return</p>
                <p className={`value ${getPnLClass(portfolio.summary?.total_unrealised_pnl)}`}>
                  {formatPercent(portfolio.summary?.total_unrealised_return_percent)}
                </p>
              </div>
            </div>
          ) : (
            <p className="empty-state">Loading portfolio...</p>
          )}
        </section>

        <section className="grid-two">
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Stock Quote</h2>
                <p className="muted">Search a ticker to retrieve latest quote data.</p>
              </div>
            </div>

            <div className="quote-form">
              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                placeholder="Enter ticker, e.g. AAPL"
              />

              <button onClick={fetchQuote}>
                {loading ? "Loading..." : "Get Quote"}
              </button>
            </div>

            {quote && (
              <div className="quote-box">
                <div className="quote-item">
                  <strong>Symbol</strong>
                  <span>{quote.symbol}</span>
                </div>

                <div className="quote-item">
                  <strong>Current</strong>
                  <span>{formatMoney(quote.current_price)}</span>
                </div>

                <div className="quote-item">
                  <strong>Open</strong>
                  <span>{formatMoney(quote.open_price)}</span>
                </div>

                <div className="quote-item">
                  <strong>High</strong>
                  <span>{formatMoney(quote.high_price)}</span>
                </div>

                <div className="quote-item">
                  <strong>Low</strong>
                  <span>{formatMoney(quote.low_price)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2>Trade Simulator</h2>
                <p className="muted">Place simulated buy and sell orders.</p>
              </div>
            </div>

            <div className="trade-form">
              <div>
                <label>Ticker</label>
                <input
                  value={tradeSymbol}
                  onChange={(event) => setTradeSymbol(event.target.value.toUpperCase())}
                  placeholder="AAPL"
                />
              </div>

              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={tradeQuantity}
                  onChange={(event) => setTradeQuantity(event.target.value)}
                />
              </div>

              <div className="trade-buttons">
                <button
                  className="buy-button"
                  onClick={() => placeTrade("BUY")}
                  disabled={tradeLoading}
                >
                  {tradeLoading ? "Processing..." : "Buy"}
                </button>

                <button
                  className="sell-button"
                  onClick={() => placeTrade("SELL")}
                  disabled={tradeLoading}
                >
                  {tradeLoading ? "Processing..." : "Sell"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Holdings</h2>
              <p className="muted">Current open simulated positions.</p>
            </div>
          </div>

          {portfolio && Object.keys(portfolio.holdings || {}).length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Market Value</th>
                    <th>P&L</th>
                    <th>Return</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(portfolio.holdings).map(([ticker, holding]) => (
                    <tr key={ticker}>
                      <td>{ticker}</td>
                      <td>{holding.quantity}</td>
                      <td>{formatMoney(holding.average_price)}</td>
                      <td>{formatMoney(holding.current_price)}</td>
                      <td>{formatMoney(holding.market_value)}</td>
                      <td className={getPnLClass(holding.unrealised_pnl)}>
                        {formatMoney(holding.unrealised_pnl)}
                      </td>
                      <td className={getPnLClass(holding.unrealised_pnl)}>
                        {formatPercent(holding.unrealised_return_percent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No holdings yet.</p>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h2>Recent Trades</h2>
              <p className="muted">Latest simulated orders stored in SQLite.</p>
            </div>
          </div>

          {portfolio && portfolio.trades?.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {portfolio.trades.slice(0, 8).map((trade, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`trade-badge ${trade.type.toLowerCase()}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td>{trade.symbol}</td>
                      <td>{trade.quantity}</td>
                      <td>{formatMoney(trade.price)}</td>
                      <td>{formatMoney(trade.total)}</td>
                      <td>{new Date(trade.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No trades yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;