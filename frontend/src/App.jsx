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
  Line,
  LineChart,
  CartesianGrid,
} from "recharts";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  CandlestickChart,
  ClipboardList,
  Cookie,
  FileText,
  Globe2,
  HelpCircle,
  Info,
  LayoutDashboard,
  Newspaper,
  Search,
  Settings,
  Star,
  Trophy,
} from "lucide-react";

import "./App.css";

const API_BASE_URL = "http://127.0.0.1:8000";
const CHART_COLORS = ["#38bdf8", "#22c55e", "#f97316", "#a855f7", "#eab308", "#ef4444"];
const CHART_RANGES = [
  {
    label: "1D",
    value: "1d",
  },
  {
    label: "1W",
    value: "1w",
  },
  {
    label: "1M",
    value: "1mo",
  },
  {
    label: "3M",
    value: "3mo",
  },
  {
    label: "YTD",
    value: "ytd",
  },
  {
    label: "1Y",
    value: "1y",
  },
  {
    label: "MAX",
    value: "max",
  },
];

const EDUCATION_TERMS = [
  {
    category: "Trading Basics",
    terms: [
      {
        title: "Paper Trading",
        description:
          "Simulated trading using market data without risking real money.",
      },
      {
        title: "Market Order",
        description:
          "An order to buy or sell immediately at the best available current market price.",
      },
      {
        title: "Limit Order",
        description:
          "An order to buy or sell only at a specified price or better.",
      },
      {
        title: "Bid",
        description:
          "The highest price a buyer is currently willing to pay for a security.",
      },
      {
        title: "Ask",
        description:
          "The lowest price a seller is currently willing to accept for a security.",
      },
      {
        title: "Spread",
        description:
          "The difference between the bid price and the ask price.",
      },
      {
        title: "Ticker",
        description:
          "A short symbol used to identify a listed security, such as AAPL or MSFT.",
      },
    ],
  },
  {
    category: "Portfolio Metrics",
    terms: [
      {
        title: "Portfolio Value",
        description:
          "The total value of cash plus the current market value of all holdings.",
      },
      {
        title: "Cash Balance",
        description:
          "The amount of uninvested money available for new trades.",
      },
      {
        title: "Cost Basis",
        description:
          "The average purchase price used to calculate profit or loss on a position.",
      },
      {
        title: "Unrealised P&L",
        description:
          "Profit or loss on positions that are still open and have not been sold.",
      },
      {
        title: "Realised P&L",
        description:
          "Profit or loss from positions that have already been closed or partially sold.",
      },
      {
        title: "Return / RoR",
        description:
          "The percentage gain or loss relative to the amount invested.",
      },
      {
        title: "Allocation",
        description:
          "How portfolio value is distributed across cash and different holdings.",
      },
      {
        title: "Exposure",
        description:
          "The amount of portfolio value affected by a position, asset or sector.",
      },
    ],
  },
  {
    category: "Valuation Metrics",
    terms: [
      {
        title: "Market Cap",
        description:
          "The total market value of a company’s equity, calculated as share price times shares outstanding.",
      },
      {
        title: "P/E Ratio",
        description:
          "Price-to-earnings ratio. It compares a company’s share price to earnings per share.",
      },
      {
        title: "EPS",
        description:
          "Earnings per share. A company’s profit divided by the number of shares outstanding.",
      },
      {
        title: "Dividend Yield",
        description:
          "Annual dividend income as a percentage of the current share price.",
      },
      {
        title: "Enterprise Value",
        description:
          "A broader company valuation measure that includes equity value, debt and cash.",
      },
      {
        title: "Revenue Growth",
        description:
          "The rate at which a company’s sales increase over time.",
      },
      {
        title: "Profit Margin",
        description:
          "The percentage of revenue kept as profit after costs.",
      },
    ],
  },
  {
    category: "Risk & Liquidity",
    terms: [
      {
        title: "Beta",
        description:
          "A measure of how sensitive a stock is to movements in the broader market.",
      },
      {
        title: "Volatility",
        description:
          "How much and how quickly a security’s price moves over time.",
      },
      {
        title: "Liquidity",
        description:
          "How easily a security can be bought or sold without strongly affecting its price.",
      },
      {
        title: "Volume",
        description:
          "The number of shares traded during a specific period.",
      },
      {
        title: "Average Volume",
        description:
          "The average number of shares traded per day over a chosen period.",
      },
      {
        title: "Drawdown",
        description:
          "The decline from a portfolio or asset’s peak value to its later low point.",
      },
      {
        title: "Diversification",
        description:
          "Spreading investments across assets to reduce concentration risk.",
      },
    ],
  },
  {
    category: "Market Data",
    terms: [
      {
        title: "52-Week High",
        description:
          "The highest price a stock reached during the last 52 weeks.",
      },
      {
        title: "52-Week Low",
        description:
          "The lowest price a stock reached during the last 52 weeks.",
      },
      {
        title: "YTD Return",
        description:
          "Year-to-date return. The performance from the start of the year to today.",
      },
      {
        title: "Open Price",
        description:
          "The first traded price of the security during the current trading session.",
      },
      {
        title: "High Price",
        description:
          "The highest traded price during the selected trading period.",
      },
      {
        title: "Low Price",
        description:
          "The lowest traded price during the selected trading period.",
      },
      {
        title: "Previous Close",
        description:
          "The last traded price from the previous trading session.",
      },
    ],
  },
];


const DEMO_LEADERBOARD = [
  {
    rank: 1,
    trader: "Momentum Max",
    style: "Momentum",
    portfolioValue: 116420,
    returnPercent: 16.42,
    totalPnl: 16420,
    bestHolding: "NVDA",
  },
  {
    rank: 2,
    trader: "Value Hunter",
    style: "Value",
    portfolioValue: 109870,
    returnPercent: 9.87,
    totalPnl: 9870,
    bestHolding: "MSFT",
  },
  {
    rank: 3,
    trader: "Dividend Pilot",
    style: "Income",
    portfolioValue: 106320,
    returnPercent: 6.32,
    totalPnl: 6320,
    bestHolding: "KO",
  },
  {
    rank: 4,
    trader: "Risk Manager",
    style: "Balanced",
    portfolioValue: 103980,
    returnPercent: 3.98,
    totalPnl: 3980,
    bestHolding: "AAPL",
  },
];

const ECONOMIC_CALENDAR_EVENTS = [
  {
    date: "2026-06-10",
    time: "13:30",
    country: "US",
    event: "Consumer Price Index",
    impact: "High",
    actual: "—",
    forecast: "2.9%",
    previous: "3.1%",
  },
  {
    date: "2026-06-12",
    time: "13:30",
    country: "US",
    event: "Initial Jobless Claims",
    impact: "Medium",
    actual: "—",
    forecast: "220K",
    previous: "218K",
  },
  {
    date: "2026-06-18",
    time: "19:00",
    country: "US",
    event: "Federal Reserve Rate Decision",
    impact: "High",
    actual: "—",
    forecast: "4.50%",
    previous: "4.50%",
  },
  {
    date: "2026-06-19",
    time: "12:00",
    country: "UK",
    event: "Bank of England Rate Decision",
    impact: "High",
    actual: "—",
    forecast: "4.25%",
    previous: "4.25%",
  },
  {
    date: "2026-06-20",
    time: "07:00",
    country: "UK",
    event: "Retail Sales",
    impact: "Medium",
    actual: "—",
    forecast: "0.3%",
    previous: "-0.2%",
  },
  {
    date: "2026-06-24",
    time: "09:00",
    country: "EU",
    event: "Euro Area PMI",
    impact: "Medium",
    actual: "—",
    forecast: "51.2",
    previous: "50.8",
  },
];

const NAV_SECTIONS = [
  {
    title: "Trade",
    items: [
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
        name: "Portfolio",
        icon: Briefcase,
      },
      {
        name: "Orders",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Research",
    items: [
      {
        name: "News",
        icon: Newspaper,
      },
      {
        name: "Analytics",
        icon: BarChart3,
      },
      {
        name: "Calendar",
        icon: Globe2,
      },
      {
        name: "Leaderboard",
        icon: Trophy,
      },
    ],
  },
  {
    title: "Learn",
    items: [
      {
        name: "Education",
        icon: BookOpen,
      },
      {
        name: "About",
        icon: Info,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        name: "Settings",
        icon: Settings,
      },
      {
        name: "Help",
        icon: HelpCircle,
      },
      {
        name: "Legal",
        icon: FileText,
      },
      {
        name: "Cookie Settings",
        icon: Cookie,
      },
    ],
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

function formatLargeNumber(value) {
  if (value === undefined || value === null || value === "") return "N/A";

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}T`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}B`;
  }

  return value.toLocaleString("en-US");
}

function formatMetric(value, suffix = "") {
  if (value === undefined || value === null || value === "") return "N/A";

  if (typeof value === "number") {
    return `${value.toFixed(2)}${suffix}`;
  }

  return `${value}${suffix}`;
}

function getPnLClass(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "";
}

function getImpactClass(impact) {
  if (impact === "High") return "impact-high";
  if (impact === "Medium") return "impact-medium";
  return "impact-low";
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

function InfoTooltip({ text }) {
  return (
    <span className="info-tooltip" tabIndex="0">
      ⓘ
      <span className="tooltip-content">{text}</span>
    </span>
  );
}

function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [symbol, setSymbol] = useState("AAPL");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceChartData, setPriceChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartRange, setChartRange] = useState("1mo");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyLogos, setCompanyLogos] = useState({});

  const [tradeSymbol, setTradeSymbol] = useState("AAPL");
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [tradeSide, setTradeSide] = useState("BUY");
  const [tradeLoading, setTradeLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [tradeFilter, setTradeFilter] = useState("");
  const [tradeNotes, setTradeNotes] = useState(() => {
    const savedNotes = localStorage.getItem("visio-trade-notes");

    if (savedNotes) {
      return JSON.parse(savedNotes);
    }

    return {};
  });
  const [activePage, setActivePage] = useState("Dashboard");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const [watchlist, setWatchlist] = useState(() => {
    const savedWatchlist = localStorage.getItem("visio-watchlist");

    if (savedWatchlist) {
      return JSON.parse(savedWatchlist);
    }

    return [];
  });
  const [watchlistQuotes, setWatchlistQuotes] = useState({});
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [marketNews, setMarketNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsIndex, setNewsIndex] = useState(0);

  const [showHero, setShowHero] = useState(() => {
  const savedValue = localStorage.getItem("visio-show-hero");
    return savedValue ? JSON.parse(savedValue) : true;
  });

  const [compactMode, setCompactMode] = useState(() => {
    const savedValue = localStorage.getItem("visio-compact-mode");
    return savedValue ? JSON.parse(savedValue) : false;
  });

  const [newsCarouselSpeed, setNewsCarouselSpeed] = useState(() => {
    const savedValue = localStorage.getItem("visio-news-speed");
    return savedValue ? Number(savedValue) : 6000;
  });


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

const mostOwnedHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((largest, current) =>
        current.quantity > largest.quantity ? current : largest
      )
    : null;

const largestHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((largest, current) =>
        current.market_value > largest.market_value ? current : largest
      )
    : null;

const bestReturnHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((best, current) =>
        current.unrealised_return_percent > best.unrealised_return_percent
          ? current
          : best
      )
    : null;

const worstReturnHolding =
  holdingsArray.length > 0
    ? holdingsArray.reduce((worst, current) =>
        current.unrealised_return_percent < worst.unrealised_return_percent
          ? current
          : worst
      )
    : null;

const portfolioValue = portfolio?.summary?.total_portfolio_value || 0;
const cashAllocationPercent =
  portfolioValue > 0 ? ((portfolio?.cash || 0) / portfolioValue) * 100 : 0;

const investedAllocationPercent =
  portfolioValue > 0
    ? ((portfolio?.summary?.total_market_value || 0) / portfolioValue) * 100
    : 0;

const leaderboardRows = portfolio
  ? [
      ...DEMO_LEADERBOARD,
      {
        rank: "—",
        trader: "Your Account",
        style: "Paper Trading",
        portfolioValue: portfolio.summary?.total_portfolio_value || 0,
        returnPercent: portfolio.summary?.total_unrealised_return_percent || 0,
        totalPnl: portfolio.summary?.total_pnl || 0,
        bestHolding: bestHolding?.symbol || "N/A",
        isUser: true,
      },
    ].sort((a, b) => b.returnPercent - a.returnPercent)
  : DEMO_LEADERBOARD;

const totalTrades = portfolio?.trades?.length || 0;
const totalHoldings = holdingsArray.length;

const selectedHolding = portfolio?.holdings?.[tradeSymbol.toUpperCase()];
const estimatedPrice =
  quote?.symbol === tradeSymbol.toUpperCase()
    ? quote.current_price
    : selectedHolding?.current_price || selectedHolding?.average_price || 0;

const estimatedQuantity = Number(tradeQuantity) || 0;
const estimatedOrderValue = estimatedPrice * estimatedQuantity;
const hasEnoughCash = portfolio
  ? portfolio.cash >= estimatedOrderValue
  : true;

const ownedQuantity = selectedHolding?.quantity || 0;
const hasEnoughShares = ownedQuantity >= estimatedQuantity;

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
      await fetchPriceChart(response.data.symbol);
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

      async function fetchPriceChart(tickerSymbol, selectedRange = chartRange) {
  if (!tickerSymbol) return;

  try {
    setChartLoading(true);
    setPriceChartData([]);

    const response = await axios.get(
      `${API_BASE_URL}/candles/${tickerSymbol.toUpperCase()}?range=${selectedRange}&t=${Date.now()}`
    );

    const formattedData = (response.data.candles || []).map((item, index) => {
      const dateObject = new Date(item.date * 1000);

      return {
        xIndex: index,
        timestamp: item.date * 1000,
        label:
          selectedRange === "1d"
            ? dateObject.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : selectedRange === "1w"
              ? dateObject.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              : selectedRange === "1y" || selectedRange === "max"
                ? dateObject.toLocaleDateString("en-GB", {
                    month: "short",
                    year: "2-digit",
                  })
                : dateObject.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  }),
        close: item.close,
      };
    });

    setPriceChartData(formattedData);
  } catch (error) {
    console.error("Error fetching price chart:", error);
    setPriceChartData([]);
  } finally {
    setChartLoading(false);
  }
}

  function changeChartRange(selectedRange) {
  setChartRange(selectedRange);

  const tickerToLoad = quote?.symbol || symbol;

  if (tickerToLoad) {
    fetchPriceChart(tickerToLoad, selectedRange);
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

  function submitTradeTicket() {
    placeTrade(tradeSide);
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

    const results = response.data.results || [];

    setSearchResults(results);

    results.slice(0, 8).forEach((result) => {
      fetchCompanyLogo(result.symbol);
    });
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

async function fetchSearchSuggestions(query) {
  if (!query.trim() || query.trim().length < 2) {
    setSearchSuggestions([]);
    return;
  }

  try {
    setSuggestionsLoading(true);

    const response = await axios.get(`${API_BASE_URL}/search/${query.trim()}`);
    const results = response.data.results || [];

    setSearchSuggestions(results.slice(0, 6));

    results.slice(0, 6).forEach((result) => {
      fetchCompanyLogo(result.symbol);
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    setSearchSuggestions([]);
  } finally {
    setSuggestionsLoading(false);
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
    await fetchPriceChart(response.data.symbol);
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

async function fetchCompanyDetails(tickerSymbol) {
  if (!tickerSymbol) return;

  try {
    setCompanyLoading(true);
    setMessage(null);

    const response = await axios.get(
      `${API_BASE_URL}/company/${tickerSymbol.toUpperCase()}`
    );

    setSelectedCompany(response.data);
    setCompanyLogos((currentLogos) => ({
      ...currentLogos,
      [response.data.symbol]: response.data.profile?.logo || "",
    }));
    setActivePage("Company");
  } catch (error) {
    console.error("Error fetching company details:", error);
    setMessage({
      type: "error",
      text: getErrorMessage(error, "Could not fetch company details."),
    });
  } finally {
    setCompanyLoading(false);
  }
}

async function fetchCompanyLogo(tickerSymbol) {
  if (!tickerSymbol || companyLogos[tickerSymbol]) return;

  try {
    const response = await axios.get(
      `${API_BASE_URL}/company/${tickerSymbol.toUpperCase()}`
    );

    setCompanyLogos((currentLogos) => ({
      ...currentLogos,
      [response.data.symbol]: response.data.profile?.logo || "",
    }));
  } catch (error) {
    console.error("Error fetching company logo:", error);
  }
}


  async function fetchWatchlistQuotes() {
  if (watchlist.length === 0) {
    setWatchlistQuotes({});
    return;
  }

  try {
    setWatchlistLoading(true);

    const quoteResponses = await Promise.all(
      watchlist.map((item) =>
        axios
          .get(`${API_BASE_URL}/quote/${item.symbol}`)
          .then((response) => ({
            symbol: item.symbol,
            quote: response.data,
          }))
          .catch(() => ({
            symbol: item.symbol,
            quote: null,
          }))
      )
    );

    const quotesBySymbol = {};

    quoteResponses.forEach((item) => {
      quotesBySymbol[item.symbol] = item.quote;
    });

    setWatchlistQuotes(quotesBySymbol);
  } catch (error) {
    console.error("Error fetching watchlist quotes:", error);
    setMessage({
      type: "error",
      text: "Could not refresh watchlist prices.",
    });
  } finally {
    setWatchlistLoading(false);
  }
}

  async function fetchMarketNews() {
  try {
    setNewsLoading(true);
    setMessage(null);

    const response = await axios.get(`${API_BASE_URL}/news?category=general`);

    setMarketNews(response.data.news || []);
    setNewsIndex(0);
  } catch (error) {
    console.error("Error fetching market news:", error);
    setMessage({
      type: "error",
      text: getErrorMessage(
        error,
        "Could not fetch market news. Check backend server."
      ),
    });
  } finally {
    setNewsLoading(false);
  }
}

async function loadDemoPortfolio() {
  const confirmed = window.confirm(
    "Load demo portfolio? This will reset your current portfolio, then create sample trades and watchlist items."
  );

  if (!confirmed) return;

  try {
    setMessage(null);
    setTradeLoading(true);

    await axios.post(`${API_BASE_URL}/reset`);

    const demoTrades = [
      { symbol: "AAPL", quantity: 8 },
      { symbol: "MSFT", quantity: 5 },
      { symbol: "NVDA", quantity: 3 },
      { symbol: "KO", quantity: 12 },
    ];

    for (const trade of demoTrades) {
      await axios.post(`${API_BASE_URL}/buy`, trade);
    }

    const demoWatchlist = [
      {
        symbol: "AAPL",
        description: "APPLE INC",
        type: "Common Stock",
      },
      {
        symbol: "MSFT",
        description: "MICROSOFT CORP",
        type: "Common Stock",
      },
      {
        symbol: "NVDA",
        description: "NVIDIA CORP",
        type: "Common Stock",
      },
      {
        symbol: "TSLA",
        description: "TESLA INC",
        type: "Common Stock",
      },
      {
        symbol: "KO",
        description: "COCA-COLA CO",
        type: "Common Stock",
      },
    ];

    setWatchlist(demoWatchlist);

    demoWatchlist.forEach((item) => {
      fetchCompanyLogo(item.symbol);
    });

    await fetchPortfolio();
    await fetchWatchlistQuotes();

    setMessage({
      type: "success",
      text: "Demo portfolio loaded successfully.",
    });

    setActivePage("Dashboard");
  } catch (error) {
    console.error("Error loading demo portfolio:", error);
    setMessage({
      type: "error",
      text: getErrorMessage(
        error,
        "Could not load demo portfolio. Check backend and API limits."
      ),
    });
  } finally {
    setTradeLoading(false);
  }
}

function resetLocalBrowserData() {
  const confirmed = window.confirm(
    "Clear local browser data? This removes watchlist, journal notes and UI preferences stored in localStorage."
  );

  if (!confirmed) return;

  localStorage.removeItem("visio-watchlist");
  localStorage.removeItem("visio-trade-notes");
  localStorage.removeItem("visio-show-hero");
  localStorage.removeItem("visio-compact-mode");
  localStorage.removeItem("visio-news-speed");

  setWatchlist([]);
  setTradeNotes({});
  setShowHero(true);
  setCompactMode(false);
  setNewsCarouselSpeed(6000);

  setMessage({
    type: "success",
    text: "Local browser data cleared.",
  });
}

function goToNextNews() {
  if (marketNews.length === 0) return;

  setNewsIndex((currentIndex) =>
    currentIndex === marketNews.length - 1 ? 0 : currentIndex + 1
  );
}

function goToPreviousNews() {
  if (marketNews.length === 0) return;

  setNewsIndex((currentIndex) =>
    currentIndex === 0 ? marketNews.length - 1 : currentIndex - 1
  );
}

function formatNewsDate(timestamp) {
  if (!timestamp) return "Unknown date";

  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

  useEffect(() => {
    fetchPortfolio();
    fetchMarketNews();
  }, []);

  useEffect(() => {
  localStorage.setItem("visio-watchlist", JSON.stringify(watchlist));
}, [watchlist]);

useEffect(() => {
  localStorage.setItem("visio-trade-notes", JSON.stringify(tradeNotes));
}, [tradeNotes]);

useEffect(() => {
  const debounce = setTimeout(() => {
    fetchSearchSuggestions(searchQuery);
  }, 400);

  return () => clearTimeout(debounce);
}, [searchQuery]);

useEffect(() => {
  const interval = setInterval(() => {
    fetchMarketNews();
  }, 600000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  watchlist.forEach((item) => {
    fetchCompanyLogo(item.symbol);
  });
}, [watchlist]);

useEffect(() => {
  holdingsArray.forEach((holding) => {
    fetchCompanyLogo(holding.symbol);
  });
}, [portfolio]);

useEffect(() => {
  if (marketNews.length <= 1) return;

  const carouselInterval = setInterval(() => {
    setNewsIndex((currentIndex) =>
      currentIndex === marketNews.length - 1 ? 0 : currentIndex + 1
    );
  }, newsCarouselSpeed);

  return () => clearInterval(carouselInterval);
}, [marketNews.length, newsCarouselSpeed]);

useEffect(() => {
  fetchWatchlistQuotes();
}, [watchlist]);

useEffect(() => {
  const interval = setInterval(() => {
    fetchWatchlistQuotes();
  }, 60000);

  return () => clearInterval(interval);
}, [watchlist]);

useEffect(() => {
  localStorage.setItem("visio-show-hero", JSON.stringify(showHero));
}, [showHero]);

useEffect(() => {
  localStorage.setItem("visio-compact-mode", JSON.stringify(compactMode));
}, [compactMode]);

useEffect(() => {
  localStorage.setItem("visio-news-speed", String(newsCarouselSpeed));
}, [newsCarouselSpeed]);

function addToWatchlist(result) {
  const symbol = result.symbol;

  const alreadyExists = watchlist.some((item) => item.symbol === symbol);

  if (alreadyExists) {
    setMessage({
      type: "error",
      text: `${symbol} is already in your watchlist.`,
    });
    return;
  }

  setWatchlist((currentWatchlist) => [
    ...currentWatchlist,
    {
      symbol: result.symbol,
      description: result.description || "N/A",
      type: result.type || "N/A",
    },
  ]);

  setMessage({
    type: "success",
    text: `${symbol} added to watchlist.`,
  });
}

function removeFromWatchlist(symbol) {
  setWatchlist((currentWatchlist) =>
    currentWatchlist.filter((item) => item.symbol !== symbol)
  );

  setMessage({
    type: "success",
    text: `${symbol} removed from watchlist.`,
  });
}

function getTradeKey(trade, index) {
  return `${trade.timestamp}-${trade.symbol}-${trade.type}-${index}`;
}

function updateTradeNote(tradeKey, note) {
  setTradeNotes((currentNotes) => ({
    ...currentNotes,
    [tradeKey]: note,
  }));
}

function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) {
    setMessage({
      type: "error",
      text: "No data available to export.",
    });
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function exportTradeHistoryCsv() {
  const rows =
    portfolio?.trades?.map((trade, index) => {
      const tradeKey = getTradeKey(trade, index);

      return {
        type: trade.type,
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        total: trade.total,
        realised_pnl: trade.realised_pnl,
        timestamp: trade.timestamp,
        journal_note: tradeNotes[tradeKey] || "",
      };
    }) || [];

  downloadCsv("visio-trade-journal.csv", rows);
}

function exportPortfolioCsv() {
  const rows = Object.entries(portfolio?.holdings || {}).map(
    ([symbol, holding]) => ({
      symbol,
      quantity: holding.quantity,
      average_price: holding.average_price,
      current_price: holding.current_price,
      market_value: holding.market_value,
      unrealised_pnl: holding.unrealised_pnl,
      unrealised_return_percent: holding.unrealised_return_percent,
    })
  );

  downloadCsv("visio-portfolio-summary.csv", rows);
}

function getDailyChange(quoteData) {
  if (!quoteData?.current_price || !quoteData?.previous_close) return 0;

  return quoteData.current_price - quoteData.previous_close;
}

function getDailyChangePercent(quoteData) {
  if (!quoteData?.current_price || !quoteData?.previous_close) return 0;

  return ((quoteData.current_price - quoteData.previous_close) / quoteData.previous_close) * 100;
}

return (
  <div className={`app-shell ${compactMode ? "compact-mode" : ""}`}>
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">V</div>
        <div>
          <h2>Visio</h2>
          <p>Trading Simulator</p>
        </div>
      </div>

                  <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div className="nav-section" key={section.title}>
            <p className="nav-section-title">{section.title}</p>

            {section.items.map((item) => {
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
          </div>
        ))}
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

            {showHero && (
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
      )}

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
                  <p className="label">
                    Portfolio Value{" "}
                    <InfoTooltip text="Cash plus the current market value of all open simulated positions." />
                  </p>
                  <p className="value">
                    {formatMoney(portfolio.summary?.total_portfolio_value)}
                  </p>
                </div>

                <div className="metric">
                  <p className="label">
                    Unrealised P&L{" "}
                    <InfoTooltip text="Profit or loss on positions you still hold." />
                  </p>
                  <p className={`value ${getPnLClass(portfolio.summary?.total_unrealised_pnl)}`}>
                    {formatMoney(portfolio.summary?.total_unrealised_pnl)}
                  </p>
                </div>

                <div className="metric">
                  <p className="label">
                    Realised P&L{" "}
                    <InfoTooltip text="Profit or loss from trades that have already been closed." />
                  </p>
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
                  <p className="label">
                    Return{" "}
                    <InfoTooltip text="Percentage return based on the simulated portfolio's unrealised performance." />
                  </p>
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

              <div className="metric">
                <p className="label">Most Owned</p>
                <p className="value">
                  {mostOwnedHolding
                    ? `${mostOwnedHolding.symbol} × ${mostOwnedHolding.quantity}`
                    : "N/A"}
                </p>
              </div>

              <div className="metric">
                <p className="label">Largest Holding</p>
                <p className="value">
                  {largestHolding
                    ? `${largestHolding.symbol} ${formatMoney(largestHolding.market_value)}`
                    : "N/A"}
                </p>
              </div>

              <div className="metric">
                <p className="label">Best Return %</p>
                <p className={`value ${getPnLClass(bestReturnHolding?.unrealised_return_percent)}`}>
                  {bestReturnHolding
                    ? `${bestReturnHolding.symbol} ${formatPercent(bestReturnHolding.unrealised_return_percent)}`
                    : "N/A"}
                </p>
              </div>

              <div className="metric">
                <p className="label">Worst Return %</p>
                <p className={`value ${getPnLClass(worstReturnHolding?.unrealised_return_percent)}`}>
                  {worstReturnHolding
                    ? `${worstReturnHolding.symbol} ${formatPercent(worstReturnHolding.unrealised_return_percent)}`
                    : "N/A"}
                </p>
              </div>

              <div className="metric">
                <p className="label">Cash Allocation</p>
                <p className="value">{cashAllocationPercent.toFixed(1)}%</p>
              </div>

              <div className="metric">
                <p className="label">Invested Allocation</p>
                <p className="value">{investedAllocationPercent.toFixed(1)}%</p>
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

      {activePage === "News" && (
  <section className="card">
    <div className="card-header">
      <div>
        <h2>Market News</h2>
        <p className="muted">
          Auto-updating financial market headlines powered by Finnhub. Carousel rotates every 6 seconds.
        </p>
      </div>

      <button className="secondary-button" onClick={fetchMarketNews}>
        {newsLoading ? "Refreshing..." : "Refresh News"}
      </button>
    </div>

    {marketNews.length > 0 ? (
      <div className="news-carousel">
        <div className="news-card">
          {marketNews[newsIndex]?.image && (
            <img
              src={marketNews[newsIndex].image}
              alt={marketNews[newsIndex].headline}
              className="news-image"
            />
          )}

          <div className="news-content">
            <div className="news-meta">
              <span>{marketNews[newsIndex]?.source || "Market News"}</span>
              <span>{formatNewsDate(marketNews[newsIndex]?.datetime)}</span>
            </div>

            <h3>{marketNews[newsIndex]?.headline}</h3>

            <p>
              {marketNews[newsIndex]?.summary ||
                "No summary available for this article."}
            </p>

            {marketNews[newsIndex]?.url && (
              <a
                href={marketNews[newsIndex].url}
                target="_blank"
                rel="noreferrer"
                className="news-link"
              >
                Open article
              </a>
            )}
          </div>
        </div>

        <div className="news-controls">
          <button className="secondary-button compact-button" onClick={goToPreviousNews}>
            Previous
          </button>

          <span>
            {newsIndex + 1} / {marketNews.length}
          </span>

          <button className="secondary-button compact-button" onClick={goToNextNews}>
            Next
          </button>
        </div>
      </div>
    ) : (
      <p className="empty-state">
        {newsLoading
          ? "Loading market news..."
          : "No market news loaded yet. Click Refresh News."}
      </p>
    )}
  </section>
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
      <div className="price-chart-panel">
  <div className="analytics-title-row">
    <h3>{quote ? `${quote.symbol} Price Chart` : "Price Chart"}</h3>

    <div className="chart-range-tabs">
      {CHART_RANGES.map((rangeOption) => (
        <button
          key={rangeOption.value}
          className={`chart-range-button ${
            chartRange === rangeOption.value ? "active" : ""
          }`}
          onClick={() => changeChartRange(rangeOption.value)}
        >
          {rangeOption.label}
        </button>
      ))}
    </div>
  </div>

  {chartLoading ? (
    <p className="empty-state">Loading price chart...</p>
  ) : priceChartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={280}>
  <LineChart
    key={`${quote?.symbol}-${chartRange}-${priceChartData.length}`}
    data={priceChartData}
    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      dataKey="xIndex"
      type="number"
      domain={["dataMin", "dataMax"]}
      tickFormatter={(value) => {
        const item = priceChartData[Math.round(value)];
        return item?.label || "";
      }}
    />

    <YAxis domain={["auto", "auto"]} />

    <Tooltip
      labelFormatter={(value) => {
        const item = priceChartData[Math.round(value)];

        if (!item?.timestamp) return "";

        return new Date(item.timestamp).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }}
      formatter={(value) => formatMoney(value)}
    />

    <Line
      type="monotone"
      dataKey="close"
      strokeWidth={3}
      dot={false}
      isAnimationActive={false}
    />
  </LineChart>
</ResponsiveContainer>
  ) : (
    <p className="empty-state">
      Search a ticker or select a stock from Markets to load a chart.
    </p>
  )}
        </div>
      </div>

      <div className="card trade-ticket-card">
        <div className="card-header">
          <div>
            <h2>Trade Ticket</h2>
            <p className="muted">Build and submit simulated market orders.</p>
          </div>
        </div>

        <div className="trade-ticket">
          <div className="side-toggle">
            <button
              className={`side-button ${tradeSide === "BUY" ? "active buy" : ""}`}
              onClick={() => setTradeSide("BUY")}
            >
              Buy
            </button>

            <button
              className={`side-button ${tradeSide === "SELL" ? "active sell" : ""}`}
              onClick={() => setTradeSide("SELL")}
            >
              Sell
            </button>
          </div>

          <div className="ticket-field">
            <label>Ticker</label>
            <input
              value={tradeSymbol}
              onChange={(event) => setTradeSymbol(event.target.value.toUpperCase())}
              placeholder="AAPL"
            />
          </div>

          <div className="ticket-field">
            <label>
              Order Type{" "}
              <InfoTooltip text="This simulator currently uses market orders, which execute at the current available market price." />
            </label>
            <div className="order-type-pill">Market Order</div>
          </div>

          <div className="ticket-field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={tradeQuantity}
              onChange={(event) => setTradeQuantity(event.target.value)}
            />
          </div>

          <div className="ticket-estimates">
            <div>
              <span>
                Estimated Price{" "}
                <InfoTooltip text="The latest available quote used to estimate the simulated order value." />
              </span>
              <strong>{formatMoney(estimatedPrice)}</strong>
            </div>

            <div>
              <span>
                {tradeSide === "BUY" ? "Estimated Cost" : "Estimated Proceeds"}{" "}
                <InfoTooltip text="Estimated total order value based on price multiplied by quantity." />
              </span>
              <strong>{formatMoney(estimatedOrderValue)}</strong>
            </div>

            <div>
              <span>Available Cash</span>
              <strong>{formatMoney(portfolio?.cash)}</strong>
            </div>

            <div>
              <span>Owned Shares</span>
              <strong>{ownedQuantity}</strong>
            </div>
          </div>

          {tradeSide === "BUY" && !hasEnoughCash && (
            <p className="ticket-warning">
              Not enough cash for this simulated buy order.
            </p>
          )}

          {tradeSide === "SELL" && !hasEnoughShares && (
            <p className="ticket-warning">
              You do not own enough shares to sell this quantity.
            </p>
          )}

          <button
            className={`submit-order-button ${
              tradeSide === "BUY" ? "buy-submit" : "sell-submit"
            }`}
            onClick={submitTradeTicket}
            disabled={
              tradeLoading ||
              estimatedQuantity <= 0 ||
              (tradeSide === "BUY" && !hasEnoughCash) ||
              (tradeSide === "SELL" && !hasEnoughShares)
            }
          >
            {tradeLoading
              ? "Processing..."
              : `${tradeSide === "BUY" ? "Submit Buy Order" : "Submit Sell Order"}`}
          </button>
        </div>
      </div>
    </section>
  )}
    

      {activePage === "Portfolio" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Portfolio Holdings</h2>
              <p className="muted">
                All stocks currently owned in your simulated portfolio.
              </p>
            </div>
          </div>

          {portfolio && Object.keys(portfolio.holdings || {}).length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Market Value</th>
                    <th>P&L</th>
                    <th>Return</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(portfolio.holdings).map(([ticker, holding]) => (
                    <tr key={ticker}>
                      <td>
                        <button
                          className="company-cell-button"
                          onClick={() => fetchCompanyDetails(ticker)}
                        >
                          {companyLogos[ticker] ? (
                            <img
                              src={companyLogos[ticker]}
                              alt={ticker}
                              className="mini-company-logo"
                            />
                          ) : (
                            <span className="mini-company-logo logo-placeholder">
                              {ticker?.slice(0, 1)}
                            </span>
                          )}

                          <span>{ticker}</span>
                        </button>
                      </td>

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

                      <td>
                        <div className="table-actions">
                          <button
                            className="quote-trade-button compact-button"
                            onClick={() =>
                              selectStockResult({
                                symbol: ticker,
                                description: ticker,
                                type: "Common Stock",
                              })
                            }
                          >
                            Quote / Trade
                          </button>

                          <button
                            className="secondary-button compact-button"
                            onClick={() => fetchCompanyDetails(ticker)}
                          >
                            Company
                          </button>
                        </div>
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
              <h2>Orders / Trading Journal</h2>
              <p className="muted">
                Latest simulated orders, journal notes and CSV exports.
              </p>
            </div>

            <div className="header-actions journal-actions">
              <button
                className="secondary-button compact-button"
                onClick={exportTradeHistoryCsv}
              >
                Export Trades CSV
              </button>

              <button
                className="secondary-button compact-button"
                onClick={exportPortfolioCsv}
              >
                Export Portfolio CSV
              </button>

              <input
                className="filter-input"
                value={tradeFilter}
                onChange={(event) => setTradeFilter(event.target.value.toUpperCase())}
                placeholder="Filter by ticker"
              />
            </div>
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
                    <th>Journal Note</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTrades.slice(0, 12).map((trade, index) => {
                    const tradeKey = getTradeKey(trade, index);

                    return (
                      <tr key={tradeKey}>
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

                        <td>
                          <input
                            className="journal-note-input"
                            value={tradeNotes[tradeKey] || ""}
                            onChange={(event) =>
                              updateTradeNote(tradeKey, event.target.value)
                            }
                            placeholder="Add trade note..."
                          />
                        </td>
                      </tr>
                    );
                  })}
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
        <div className="search-autocomplete">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search company or ticker, e.g. Apple, Microsoft, TSLA"
          />

          {searchSuggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.symbol}-${index}`}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchQuery(suggestion.description || suggestion.symbol);
                    setSearchSuggestions([]);
                    fetchCompanyDetails(suggestion.symbol);
                  }}
                >
                  {companyLogos[suggestion.symbol] ? (
                    <img
                      src={companyLogos[suggestion.symbol]}
                      alt={suggestion.description || suggestion.symbol}
                      className="mini-company-logo"
                    />
                  ) : (
                    <span className="mini-company-logo logo-placeholder">
                      {suggestion.symbol?.slice(0, 1)}
                    </span>
                  )}

                  <span>
                    <strong>{suggestion.symbol}</strong>
                    <small>{suggestion.description || "N/A"}</small>
                  </span>
                </button>
              ))}

              {suggestionsLoading && (
                <p className="suggestions-loading">Loading suggestions...</p>
              )}
            </div>
          )}
        </div>

        <button className="market-search-button" onClick={searchStocks}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {searchResults.length > 0 ? (
        <div className="table-wrapper market-results">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {searchResults.map((result, index) => (
                <tr key={`${result.symbol}-${index}`}>
                  <td>
                    <button
                      className="company-cell-button"
                      onClick={() => fetchCompanyDetails(result.symbol)}
                    >
                      {companyLogos[result.symbol] ? (
                        <img
                          src={companyLogos[result.symbol]}
                          alt={result.description || result.symbol}
                          className="mini-company-logo"
                        />
                      ) : (
                        <span className="mini-company-logo logo-placeholder">
                          {result.symbol?.slice(0, 1)}
                        </span>
                      )}

                      <span>{result.description || "N/A"}</span>
                    </button>
                  </td>

                  <td>{result.symbol}</td>
                  <td>{result.type || "N/A"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="quote-trade-button compact-button"
                        onClick={() => selectStockResult(result)}
                      >
                        Quote / Trade
                      </button>

                      <button
                        className="watchlist-button compact-button"
                        onClick={() => addToWatchlist(result)}
                      >
                        Watchlist
                      </button>
                    </div>
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
        <p className="muted">
          Track favourite tickers with live prices and quick trade access.
        </p>
      </div>

      <button className="secondary-button" onClick={fetchWatchlistQuotes}>
        {watchlistLoading ? "Refreshing..." : "Refresh Prices"}
      </button>
    </div>

    {watchlist.length > 0 ? (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Symbol</th>
              <th>Current Price</th>
              <th>Daily Change</th>
              <th>Daily Change %</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {watchlist.map((item) => {
              const quoteData = watchlistQuotes[item.symbol];
              const dailyChange = getDailyChange(quoteData);
              const dailyChangePercent = getDailyChangePercent(quoteData);

              return (
                <tr key={item.symbol}>
                  <td>
                    <button
                      className="company-cell-button"
                      onClick={() => fetchCompanyDetails(item.symbol)}
                    >
                      {companyLogos[item.symbol] ? (
                        <img
                          src={companyLogos[item.symbol]}
                          alt={item.description || item.symbol}
                          className="mini-company-logo"
                        />
                      ) : (
                        <span className="mini-company-logo logo-placeholder">
                          {item.symbol?.slice(0, 1)}
                        </span>
                      )}

                      <span>{item.description}</span>
                    </button>
                  </td>

                  <td>{item.symbol}</td>
                  <td>
                    {quoteData
                      ? formatMoney(quoteData.current_price)
                      : "Loading..."}
                  </td>
                  <td className={getPnLClass(dailyChange)}>
                    {formatMoney(dailyChange)}
                  </td>
                  <td className={getPnLClass(dailyChangePercent)}>
                    {dailyChangePercent.toFixed(2)}%
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="quote-trade-button compact-button"
                        onClick={() => selectStockResult(item)}
                      >
                        Quote / Trade
                      </button>

                      <button
                        className="danger-button compact-button"
                        onClick={() => removeFromWatchlist(item.symbol)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="empty-state">
        Your watchlist is empty. Go to Markets, search for a company, and add it here.
      </p>
    )}
  </section>
)}

        {activePage === "Education" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Education</h2>
          <p className="muted">
            Learn the key trading, portfolio, valuation and market data terms used across Visio.
          </p>
        </div>
      </div>

      <div className="education-sections">
        {EDUCATION_TERMS.map((section) => (
          <div className="education-section" key={section.category}>
            <div className="education-section-header">
              <h3>{section.category}</h3>
              <span>{section.terms.length} terms</span>
            </div>

            <div className="education-grid">
              {section.terms.map((term) => (
                <div className="metric education-card" key={term.title}>
                  <p className="label">{term.title}</p>
                  <p className="muted">{term.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )}

      {activePage === "Calendar" && (
  <section className="card">
    <div className="card-header">
      <div>
        <h2>Economic Calendar</h2>
        <p className="muted">
          Demo macro calendar for tracking major market-moving events.
        </p>
      </div>
    </div>

    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Country</th>
            <th>Event</th>
            <th>Impact</th>
            <th>Actual</th>
            <th>Forecast</th>
            <th>Previous</th>
          </tr>
        </thead>

        <tbody>
          {ECONOMIC_CALENDAR_EVENTS.map((event) => (
            <tr key={`${event.date}-${event.event}`}>
              <td>{event.date}</td>
              <td>{event.time}</td>
              <td>{event.country}</td>
              <td>{event.event}</td>
              <td>
                <span className={`impact-badge ${getImpactClass(event.impact)}`}>
                  {event.impact}
                </span>
              </td>
              <td>{event.actual}</td>
              <td>{event.forecast}</td>
              <td>{event.previous}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <p className="empty-state">
      Calendar data is currently demo data for UI presentation. A future version can connect a live macroeconomic calendar API.
    </p>
  </section>
)}

      {activePage === "Leaderboard" && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Leaderboard</h2>
              <p className="muted">
                Demo ranking of simulated traders by portfolio return.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Trader</th>
                  <th>Style</th>
                  <th>Portfolio Value</th>
                  <th>Return</th>
                  <th>Total P&L</th>
                  <th>Best Holding</th>
                </tr>
              </thead>

              <tbody>
                {leaderboardRows.map((row, index) => (
                  <tr
                    key={`${row.trader}-${index}`}
                    className={row.isUser ? "user-leaderboard-row" : ""}
                  >
                    <td>{index + 1}</td>
                    <td>{row.trader}</td>
                    <td>{row.style}</td>
                    <td>{formatMoney(row.portfolioValue)}</td>
                    <td className={getPnLClass(row.returnPercent)}>
                      {row.returnPercent.toFixed(2)}%
                    </td>
                    <td className={getPnLClass(row.totalPnl)}>
                      {formatMoney(row.totalPnl)}
                    </td>
                    <td>{row.bestHolding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="empty-state">
            This is a local demo leaderboard for presentation. A future version could connect real user accounts.
          </p>
        </section>
      )}

        {activePage === "About" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>About Visio Trading</h2>
          <p className="muted">
            A full-stack paper trading simulator built as a finance and software engineering portfolio project.
          </p>
        </div>
      </div>

      <div className="about-grid">
        <div className="metric">
          <p className="label">Purpose</p>
          <p className="muted">
            Visio Trading helps users practise simulated investing, understand portfolio performance,
            explore company fundamentals and learn market terminology without risking real money.
          </p>
        </div>

        <div className="metric">
          <p className="label">Core Features</p>
          <p className="muted">
            Paper trading, portfolio holdings, watchlist, market search, company profiles,
            price charts, trade journal, CSV exports, news, education, calendar and leaderboard.
          </p>
        </div>

        <div className="metric">
          <p className="label">Tech Stack</p>
          <p className="muted">
            React, Vite, Recharts, FastAPI, SQLite, Python, Finnhub market data and Yahoo Finance chart fallback.
          </p>
        </div>

        <div className="metric">
          <p className="label">Data Sources</p>
          <p className="muted">
            Quotes, company data and news are fetched from market data APIs. Historical chart data uses a fallback source
            where needed to keep charts available during development.
          </p>
        </div>

        <div className="metric">
          <p className="label">Project Scope</p>
          <p className="muted">
            This is a local development portfolio project, not a live brokerage platform. It does not execute real orders.
          </p>
        </div>

        <div className="metric">
          <p className="label">Disclaimer</p>
          <p className="muted">
            The simulator is for educational demonstration only. Nothing in the app is financial advice.
          </p>
        </div>
      </div>
    </section>
  )}

        {activePage === "Help" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Help</h2>
          <p className="muted">
            Quick guide for navigating the simulator.
          </p>
        </div>
      </div>

      <div className="help-steps">
        <div className="metric">
          <p className="label">1. Search markets</p>
          <p className="muted">
            Use Markets to search by ticker or company name. Autocomplete suggestions can open the company details page.
          </p>
        </div>

        <div className="metric">
          <p className="label">2. Research a company</p>
          <p className="muted">
            Click a company name or logo to view profile information, valuation metrics, risk indicators and liquidity notes.
          </p>
        </div>

        <div className="metric">
          <p className="label">3. Place simulated trades</p>
          <p className="muted">
            Use the Trade page to submit buy or sell market orders. Orders affect only the local simulated portfolio.
          </p>
        </div>

        <div className="metric">
          <p className="label">4. Review holdings</p>
          <p className="muted">
            Use Portfolio to see all owned stocks, current values, P&L, returns and quick actions.
          </p>
        </div>

        <div className="metric">
          <p className="label">5. Use the journal</p>
          <p className="muted">
            Use Orders / Trading Journal to write notes for trades and export trade or portfolio data as CSV files.
          </p>
        </div>

        <div className="metric">
          <p className="label">6. Explore analytics</p>
          <p className="muted">
            Use Analytics, Leaderboard and Calendar for portfolio visualisation and demo market context.
          </p>
        </div>
      </div>
    </section>
  )}

        {activePage === "Legal" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Legal</h2>
          <p className="muted">
            Simulation disclaimer and data-source notes.
          </p>
        </div>
      </div>

      <div className="legal-content">
        <div className="metric">
          <p className="label">Paper trading only</p>
          <p className="muted">
            Visio Trading is a simulation. It does not connect to a broker, execute real trades or manage real money.
          </p>
        </div>

        <div className="metric">
          <p className="label">Not financial advice</p>
          <p className="muted">
            Information in this app is educational and demonstrational only. Users should not treat it as investment advice.
          </p>
        </div>

        <div className="metric">
          <p className="label">Market data</p>
          <p className="muted">
            Market data may be delayed, incomplete or unavailable depending on third-party API limits and development setup.
          </p>
        </div>

        <div className="metric">
          <p className="label">Local project</p>
          <p className="muted">
            This project is designed for local development, learning and GitHub portfolio presentation.
          </p>
        </div>
      </div>
    </section>
  )}

        {activePage === "Cookie Settings" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Cookie Settings</h2>
          <p className="muted">
            Local browser storage and privacy controls.
          </p>
        </div>
      </div>

      <div className="legal-content">
        <div className="metric">
          <p className="label">Cookies</p>
          <p className="muted">
            This local development version does not use advertising or tracking cookies.
          </p>
        </div>

        <div className="metric">
          <p className="label">LocalStorage</p>
          <p className="muted">
            The app stores watchlist items, trade journal notes and UI preferences in your browser localStorage.
          </p>
        </div>

        <div className="metric">
          <p className="label">Stored items</p>
          <p className="muted">
            visio-watchlist, visio-trade-notes, visio-show-hero, visio-compact-mode and visio-news-speed.
          </p>
        </div>

        <div className="metric">
          <p className="label">Clear data</p>
          <p className="muted">
            You can clear local browser data here without affecting the backend SQLite portfolio database.
          </p>

          <button className="danger-button" onClick={resetLocalBrowserData}>
            Clear Local Browser Data
          </button>
        </div>
      </div>
    </section>
  )}

      {activePage === "Company" && (
  <section className="card">
    <div className="card-header">
      <div>
        <h2>
          {selectedCompany?.profile?.name ||
            selectedCompany?.symbol ||
            "Company Details"}
        </h2>
        <p className="muted">
          Company profile, valuation, liquidity and risk metrics.
        </p>
      </div>

      <div className="header-actions">
        <button
          className="secondary-button"
          onClick={() => fetchCompanyDetails(selectedCompany?.symbol || symbol)}
        >
          {companyLoading ? "Refreshing..." : "Refresh"}
        </button>

        {selectedCompany?.symbol && (
          <button
            className="quote-trade-button"
            onClick={() =>
              selectStockResult({
                symbol: selectedCompany.symbol,
                description: selectedCompany?.profile?.name || selectedCompany.symbol,
                type: "Common Stock",
              })
            }
          >
            Quote / Trade
          </button>
        )}
      </div>
    </div>

    {selectedCompany ? (
      <>
        <div className="company-hero">
          {selectedCompany.profile?.logo && (
            <img
              src={selectedCompany.profile.logo}
              alt={selectedCompany.profile?.name}
              className="company-logo"
            />
          )}

          <div>
            <p className="eyebrow">{selectedCompany.symbol}</p>
            <h3>{selectedCompany.profile?.name || selectedCompany.symbol}</h3>
            <p className="muted">
              {selectedCompany.profile?.finnhubIndustry || "Industry N/A"} ·{" "}
              {selectedCompany.profile?.exchange || "Exchange N/A"} ·{" "}
              {selectedCompany.profile?.country || "Country N/A"}
            </p>

            {selectedCompany.profile?.weburl && (
              <a
                className="news-link"
                href={selectedCompany.profile.weburl}
                target="_blank"
                rel="noreferrer"
              >
                Company website
              </a>
            )}
          </div>
        </div>

        <div className="summary-grid company-metrics-grid">
          <div className="metric" title="Market capitalisation is the total market value of the company's equity.">
            <p className="label">
              Market Cap{" "}
              <InfoTooltip text="Total market value of the company’s equity." />
            </p>
            <p className="value">
              ${formatLargeNumber(selectedCompany.profile?.marketCapitalization)}
            </p>
          </div>

          <div className="metric" title="P/E ratio compares a company’s share price to its earnings per share.">
            <p className="label">
              P/E Ratio{" "}
              <InfoTooltip text="Price-to-earnings ratio. Shows how much investors pay for each dollar of earnings." />
            </p>
            <p className="value">
              {formatMetric(selectedCompany.metrics?.peBasicExclExtraTTM)}
            </p>
          </div>

          <div className="metric" title="Dividend yield is annual dividend income as a percentage of the share price.">
            <p className="label">
              Dividend Yield{" "}
              <InfoTooltip text="Annual dividend income as a percentage of the share price." />
            </p>
            <p className="value">
              {formatMetric(selectedCompany.metrics?.dividendYieldIndicatedAnnual, "%")}
            </p>
          </div>

          <div className="metric" title="Beta measures how sensitive the stock is to market movements.">
            <p className="label">
              Beta{" "}
              <InfoTooltip text="Measures how sensitive the stock is to movements in the wider market." />
            </p>
            <p className="value">{formatMetric(selectedCompany.metrics?.beta)}</p>
          </div>

          <div className="metric" title="Highest price reached in the last 52 weeks.">
            <p className="label">52W High</p>
            <p className="value">
              {formatMoney(selectedCompany.metrics?.["52WeekHigh"])}
            </p>
          </div>

          <div className="metric" title="Lowest price reached in the last 52 weeks.">
            <p className="label">52W Low</p>
            <p className="value">
              {formatMoney(selectedCompany.metrics?.["52WeekLow"])}
            </p>
          </div>

          <div className="metric" title="Average trading volume helps assess liquidity.">
            <p className="label">
              10D Avg Volume{" "}
              <InfoTooltip text="Average daily trading volume over the last 10 trading days." />
            </p>
            <p className="value">
              {formatLargeNumber(selectedCompany.metrics?.["10DayAverageTradingVolume"])}
            </p>
          </div>

          <div className="metric" title="EPS is earnings per share over the trailing twelve months.">
            <p className="label">
              EPS TTM{" "}
              <InfoTooltip text="Trailing twelve-month earnings per share." />
            </p>
            <p className="value">
              {formatMetric(selectedCompany.metrics?.epsBasicExclExtraItemsTTM)}
            </p>
          </div>
        </div>

        <div className="company-notes-grid">
          <div className="metric">
            <p className="label">Valuation View</p>
            <p className="muted">
              P/E and dividend yield help describe how the market prices the company relative to earnings and income.
            </p>
          </div>

          <div className="metric">
            <p className="label">Liquidity View</p>
            <p className="muted">
              Average trading volume gives a rough idea of how actively the stock trades.
            </p>
          </div>

          <div className="metric">
            <p className="label">Risk View</p>
            <p className="muted">
              Beta and 52-week range help describe volatility and sensitivity to broader market movement.
            </p>
          </div>
        </div>
      </>
    ) : (
      <p className="empty-state">
        Select a company from Markets, Watchlist or Portfolio to view details.
      </p>
    )}
  </section>
)}

        {activePage === "Settings" && (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">
            Customise the local simulator interface and demo data.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="metric setting-card">
          <p className="label">Display</p>

          <label className="setting-row">
            <span>Show hero banner</span>
            <input
              type="checkbox"
              checked={showHero}
              onChange={(event) => setShowHero(event.target.checked)}
            />
          </label>

          <label className="setting-row">
            <span>Compact mode</span>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(event) => setCompactMode(event.target.checked)}
            />
          </label>
        </div>

        <div className="metric setting-card">
          <p className="label">Defaults</p>

          <label className="setting-column">
            <span>Default chart range</span>
            <select
              value={chartRange}
              onChange={(event) => changeChartRange(event.target.value)}
            >
              {CHART_RANGES.map((rangeOption) => (
                <option key={rangeOption.value} value={rangeOption.value}>
                  {rangeOption.label}
                </option>
              ))}
            </select>
          </label>

          <label className="setting-column">
            <span>News carousel speed</span>
            <select
              value={newsCarouselSpeed}
              onChange={(event) => setNewsCarouselSpeed(Number(event.target.value))}
            >
              <option value={4000}>Fast — 4 seconds</option>
              <option value={6000}>Default — 6 seconds</option>
              <option value={10000}>Slow — 10 seconds</option>
              <option value={15000}>Very slow — 15 seconds</option>
            </select>
          </label>
        </div>

        <div className="metric setting-card">
          <p className="label">Portfolio Controls</p>

          <div className="settings-actions vertical-actions">
            <button className="secondary-button" onClick={fetchPortfolio}>
              Refresh Portfolio
            </button>

            <button className="secondary-button" onClick={loadDemoPortfolio}>
              {tradeLoading ? "Loading Demo..." : "Load Demo Portfolio"}
            </button>

            <button className="danger-button" onClick={resetPortfolio}>
              Reset Portfolio
            </button>
          </div>
        </div>

        <div className="metric setting-card">
          <p className="label">Browser Data</p>

          <p className="muted">
            Watchlist, journal notes and interface preferences are stored locally in your browser.
          </p>

          <button className="danger-button" onClick={resetLocalBrowserData}>
            Clear Local Browser Data
          </button>
        </div>
      </div>
    </section>
  )}
    </main>
    </div>
  </div>
);
}
export default App;