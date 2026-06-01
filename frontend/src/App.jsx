import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  CandlestickChart,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  Star,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const CHART_COLORS = ["#38bdf8", "#22c55e", "#f97316", "#a855f7", "#eab308", "#ef4444"];

const NAV_ITEMS = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Markets",
    icon: Search,
  },
  {
    name: "Watchlist",
    icon: Star,
  },
  {
    name: "Trade",
    icon: CandlestickChart,
  },
  {
    name: "Positions",
    icon: Briefcase,
  },
  {
    name: "Orders",
    icon: ClipboardList,
  },
  {
    name: "Analytics",
    icon: BarChart3,
  },
  {
    name: "Education",
    icon: BookOpen,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

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

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item.msg || "Validation error")
      .join(", ");
  }

  return fallback;
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
  const [tradeFilter, setTradeFilter] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const filteredTrades =
    portfolio?.trades?.filter((trade) =>
      trade.symbol.toLowerCase().includes(tradeFilter.toLowerCase())
    ) || [];

  const holdingsArray = portfolio
  ? Object.entries(portfolio.holdings || {}).map(([symbol, holding]) => ({
      symbol,
      ...holding,
    }))
  : [];

const allocationData = holdingsArray.map((holding) => ({
  name: holding.symbol,
  value: holding.market_value,
}));

const cashVsInvestedData = portfolio
  ? [
      {
        name: "Cash",
        value: portfolio.cash || 0,
      },
      {
        name: "Invested",
        value: portfolio.summary?.total_market_value || 0,
      },
    ]
  : [];

const buyTrades = portfolio?.trades?.filter((trade) => trade.type === "BUY").length || 0;
const sellTrades = portfolio?.trades?.filter((trade) => trade.type === "SELL").length || 0;

const tradeBreakdownData = [
  {
    name: "BUY",
    count: buyTrades,
  },
  {
    name: "SELL",
    count: sellTrades,
  },
];

const bestHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((best, current) =>
        current.unrealised_pnl > best.unrealised_pnl ? current : best
      )
    : null;

const worstHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((worst, current) =>
        current.unrealised_pnl < worst.unrealised_pnl ? current : worst
      )
    : null;

const totalTrades = portfolio?.trades?.length || 0;
const totalHoldings = holdingsArray.length;

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
        text:
          error.response?.data?.detail ||
          "Could not fetch quote. Check ticker or backend server.",
      });
    } finally {
      setLoading(false);
    }
  }

      async function placeTrade(type) {
        if (Number(tradeQuantity) <= 0) {
          setMessage({
            type: "error",
            text: "Quantity must be greater than 0.",
          });
          return;
        }

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
        text:
          error.response?.data?.detail ||
          "Trade failed. Check backend server and try again.",
      });
    } finally {
      setTradeLoading(false);
    }
  }

  async function searchStocks() {
  if (!searchQuery.trim()) {
    setMessage({
      type: "error",
      text: "Enter a company name or ticker to search.",
    });
    return;
  }

  try {
    setSearchLoading(true);
    setMessage(null);

    const response = await axios.get(
      `${API_BASE_URL}/search/${searchQuery.trim()}`
    );

    setSearchResults(response.data.results || []);
  } catch (error) {
    console.error("Error searching stocks:", error);
    setMessage({
      type: "error",
      text: getErrorMessage(
        error,
        "Could not search stocks. Check backend server."
      ),
    });
  } finally {
    setSearchLoading(false);
  }
}

async function selectStockResult(result) {
  const selectedSymbol = result.symbol;

  setSymbol(selectedSymbol);
  setTradeSymbol(selectedSymbol);
  setActivePage("Trade");

  try {
    setLoading(true);
    setMessage(null);

    const response = await axios.get(`${API_BASE_URL}/quote/${selectedSymbol}`);
    setQuote(response.data);
  } catch (error) {
    console.error("Error fetching selected quote:", error);
    setMessage({
      type: "error",
      text: getErrorMessage(
        error,
        "Could not fetch quote for selected stock."
      ),
    });
  } finally {
    setLoading(false);
  }
}


  async function resetPortfolio() {
    const confirmed = window.confirm(
      "Are you sure you want to reset the portfolio? This will delete holdings and trade history."
    );

    if (!confirmed) return;

    try {
      setMessage(null);

      const response = await axios.post(`${API_BASE_URL}/reset`);

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
      console.error("Error resetting portfolio:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Could not reset portfolio. Check backend server.",
      });
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

return (
  <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">V</div>
        <div>
          <h2>Visio</h2>
          <p>Trading Simulator</p>
        </div>
      </div>

            <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Paper Trading Mode</p>
        <strong>Live Market Data</strong>
      </div>
    </aside>

    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Visio Trading</p>
          <h1>{activePage}</h1>
        </div>

        <div className="account-strip">
          <div>
            <span>Practice Funds</span>
            <strong>{formatMoney(100000)}</strong>
          </div>

          <div>
            <span>Cash</span>
            <strong>{formatMoney(portfolio?.cash)}</strong>
          </div>

          <div>
            <span>Portfolio Value</span>
            <strong>{formatMoney(portfolio?.summary?.total_portfolio_value)}</strong>
          </div>

          <div>
            <span>Total P&L</span>
            <strong className={getPnLClass(portfolio?.summary?.total_pnl)}>
              {formatMoney(portfolio?.summary?.total_pnl)}
            </strong>
          </div>
        </div>
      </header>

      <header className="hero">
        <div className="hero-card">
          <p className="eyebrow">Visio Trading</p>
          <h1>Trading Simulator Platform</h1>
          <p className="subtitle">
            A paper trading dashboard for simulated stock positions, portfolio
            value, trade history and realised/unrealised performance.
          </p>
        </div>
      </header>

          <main className="dashboard">
      {message && <div className={`alert ${message.type}`}>{message.text}</div>}

      {activePage === "Dashboard" && (
        <>
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Portfolio Summary</h2>
                <p className="muted">Live valuation based on current market prices.</p>
              </div>

              <div className="header-actions">
                <button className="secondary-button" onClick={fetchPortfolio}>
                  Refresh
                </button>

                <button className="danger-button" onClick={resetPortfolio}>
                  Reset
                </button>
              </div>
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
                  <p className="label">Realised P&L</p>
                  <p className={`value ${getPnLClass(portfolio.summary?.total_realised_pnl)}`}>
                    {formatMoney(portfolio.summary?.total_realised_pnl)}
                  </p>
                </div>

                <div className="metric">
                  <p className="label">Total P&L</p>
                  <p className={`value ${getPnLClass(portfolio.summary?.total_pnl)}`}>
                    {formatMoney(portfolio.summary?.total_pnl)}
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

          <section className="card">
            <div className="card-header">
              <div>
                <h2>Performance Snapshot</h2>
                <p className="muted">Quick portfolio statistics generated from your simulated trades.</p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="metric">
                <p className="label">Total Holdings</p>
                <p className="value">{totalHoldings}</p>
              </div>

              <div className="metric">
                <p className="label">Total Trades</p>
                <p className="value">{totalTrades}</p>
              </div>

              <div className="metric">
                <p className="label">Best Holding</p>
                <p className={`value ${getPnLClass(bestHolding?.unrealised_pnl)}`}>
                  {bestHolding ? `${bestHolding.symbol} ${formatMoney(bestHolding.unrealised_pnl)}` : "N/A"}
                </p>
              </div>

              <div className="metric">
                <p className="label">Worst Holding</p>
                <p className={`value ${getPnLClass(worstHolding?.unrealised_pnl)}`}>
                  {worstHolding ? `${worstHolding.symbol} ${formatMoney(worstHolding.unrealised_pnl)}` : "N/A"}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {activePage === "Analytics" && (
        <>
          <section className="card">
            <div className="card-header">
              <div>
                <h2>Portfolio Analytics</h2>
                <p className="muted">
                  Visual breakdown of holdings, cash allocation and trading activity.
                </p>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-title-row">
                  <h3>Holdings Allocation</h3>
                  <span className="chart-chip">By market value</span>
                </div>

                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={4}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell
                            key={`allocation-${entry.name}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatMoney(value), name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-state">No holdings to chart yet.</p>
                )}
              </div>

              <div className="analytics-card">
                <div className="analytics-title-row">
                  <h3>Cash vs Invested</h3>
                  <span className="chart-chip">Capital split</span>
                </div>

                {portfolio ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={cashVsInvestedData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={4}
                      >
                        <Cell fill="#38bdf8" />
                        <Cell fill="#22c55e" />
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatMoney(value), name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="empty-state">Loading chart...</p>
                )}
              </div>

              <div className="analytics-card">
                <div className="analytics-title-row">
                  <h3>Trade Breakdown</h3>
                  <span className="chart-chip">Order count</span>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tradeBreakdownData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {tradeBreakdownData.map((entry) => (
                        <Cell
                          key={`trade-${entry.name}`}
                          fill={entry.name === "BUY" ? "#22c55e" : "#f97316"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </>
      )}

      {activePage === "Trade" && (
        <section className="grid-two">
          <div className="card">
            <div className="card-header">
              <div>
                <h2>Stock Quote</h2>
                  <p className="muted">
                    Use a ticker directly, or search by company name from the Markets page.
                  </p>
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
      )}

      {activePage === "Positions" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Positions</h2>
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
      )}

      {activePage === "Orders" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Orders / Trade Log</h2>
              <p className="muted">Latest simulated orders stored in SQLite.</p>
            </div>

            <input
              className="filter-input"
              value={tradeFilter}
              onChange={(event) => setTradeFilter(event.target.value.toUpperCase())}
              placeholder="Filter by ticker"
            />
          </div>

          {portfolio && filteredTrades.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Realised P&L</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTrades.slice(0, 12).map((trade, index) => (
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
                      <td className={getPnLClass(trade.realised_pnl)}>
                        {formatMoney(trade.realised_pnl)}
                      </td>
                      <td>{new Date(trade.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No matching trades.</p>
          )}
        </section>
      )}

        {activePage === "Markets" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Markets</h2>
          <p className="muted">
            Search stocks by company name or ticker, then quote or trade them.
          </p>
        </div>
      </div>

      <div className="market-search">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search company or ticker, e.g. Apple, Microsoft, TSLA"
        />

        <button onClick={searchStocks}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {searchResults.length > 0 ? (
        <div className="table-wrapper market-results">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {searchResults.map((result, index) => (
                <tr key={`${result.symbol}-${index}`}>
                  <td>{result.symbol}</td>
                  <td>{result.description || "N/A"}</td>
                  <td>{result.type || "N/A"}</td>
                  <td>
                    <button
                      className="secondary-button compact-button"
                      onClick={() => selectStockResult(result)}
                    >
                      Quote / Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-state">
          Search for a company name like Apple, Microsoft, Tesla or Nvidia.
        </p>
      )}
    </section>
  )}

      {activePage === "Watchlist" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Watchlist</h2>
              <p className="muted">Track favourite tickers and prices.</p>
            </div>
          </div>

          <p className="empty-state">
            Watchlist in development.
          </p>
        </section>
      )}

      {activePage === "Education" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Education</h2>
              <p className="muted">Explain the trading simulator logic and finance metrics.</p>
            </div>
          </div>

          <div className="education-grid">
            <div className="metric">
              <p className="label">Unrealised P&L</p>
              <p className="muted">
                Profit or loss on positions you still hold.
              </p>
            </div>

            <div className="metric">
              <p className="label">Realised P&L</p>
              <p className="muted">
                Profit or loss from positions you have already sold.
              </p>
            </div>

            <div className="metric">
              <p className="label">Paper Trading</p>
              <p className="muted">
                Simulated trading using market prices but without real money.
              </p>
            </div>
          </div>
        </section>
      )}

      {activePage === "Settings" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Settings</h2>
              <p className="muted">Portfolio controls and local development tools.</p>
            </div>
          </div>

          <div className="settings-actions">
            <button className="secondary-button" onClick={fetchPortfolio}>
              Refresh Portfolio
            </button>

            <button className="danger-button" onClick={resetPortfolio}>
              Reset Portfolio
            </button>
          </div>
        </section>
      )}
    </main>
    </div>
  </div>
);
}
export default App;