export interface StockPoint {
  date: string;
  price: number;
}

const TICKER_MAP: Record<string, string | null> = {
  apple: "AAPL", aapl: "AAPL",
  tesla: "TSLA", tsla: "TSLA",
  microsoft: "MSFT", msft: "MSFT",
  google: "GOOGL", alphabet: "GOOGL", googl: "GOOGL",
  amazon: "AMZN", amzn: "AMZN",
  meta: "META", facebook: "META",
  netflix: "NFLX", nflx: "NFLX",
  nvidia: "NVDA", nvda: "NVDA",
  openai: null, stripe: null, spacex: null,
};

/**
 * Fallback Yahoo Finance chart fetcher
 */
async function fetchYahooStock(ticker: string): Promise<StockPoint[]> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`,
      { headers: { "Accept": "application/json" } }
    );
    if (!res.ok) return [];
    const json = (await res.json()) as any;
    const result = json?.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[]     = result.indicators?.quote?.[0]?.close ?? [];
    return timestamps
      .map((ts, i) => ({
        date: new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: Math.round(closes[i] * 100) / 100,
      }))
      .filter((p) => p.price > 0);
  } catch {
    return [];
  }
}

/**
 * Resolves a company name to its stock ticker and fetches daily stock trends.
 * Supports Alpha Vantage with Yahoo Finance fallback.
 */
export async function getCompanyStockData(companyName: string): Promise<{
  ticker: string | null;
  points: StockPoint[];
  summary: string;
}> {
  const cleanName = companyName.toLowerCase().trim();
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  let ticker = TICKER_MAP[cleanName] ?? null;

  // 1. Resolve ticker if not in our map
  if (!ticker && apiKey) {
    try {
      const searchRes = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(companyName)}&apikey=${apiKey}`
      );
      if (searchRes.ok) {
        const searchJson = (await searchRes.json()) as any;
        // Check for rate limit or matches
        const matches = searchJson?.bestMatches;
        if (matches && matches.length > 0) {
          ticker = matches[0]["1. symbol"] || null;
        }
      }
    } catch (e) {
      console.warn("[STOCK RESOLVER] Alpha Vantage ticker search failed:", e);
    }
  }

  // Fallback to capitalizing the search query if it looks like a symbol
  if (!ticker && companyName.length <= 5 && /^[a-zA-Z]+$/.test(companyName)) {
    ticker = companyName.toUpperCase();
  }

  if (!ticker) {
    return {
      ticker: null,
      points: [],
      summary: "No public stock symbol matched for this company.",
    };
  }

  // 2. Fetch daily stock points (Last 30 days)
  let points: StockPoint[] = [];

  if (apiKey) {
    try {
      const chartRes = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`
      );
      if (chartRes.ok) {
        const chartJson = (await chartRes.json()) as any;
        const timeSeries = chartJson["Time Series (Daily)"];
        
        if (timeSeries) {
          // Extract dates and close prices, sort chronologically
          const sortedDates = Object.keys(timeSeries).sort().slice(-22); // ~1 month of trading days
          points = sortedDates.map((dateStr) => {
            const dateObj = new Date(dateStr);
            const formattedDate = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const closePrice = parseFloat(timeSeries[dateStr]["4. close"]);
            return {
              date: formattedDate,
              price: Math.round(closePrice * 100) / 100,
            };
          });
        } else if (chartJson["Note"] || chartJson["Information"]) {
          console.warn("[STOCK RESOLVER] Alpha Vantage rate limited. Falling back to Yahoo Finance.");
        }
      }
    } catch (e) {
      console.warn("[STOCK RESOLVER] Alpha Vantage chart fetch failed:", e);
    }
  }

  // Fallback to Yahoo Finance if Alpha Vantage fetch returned empty or failed
  if (points.length === 0) {
    points = await fetchYahooStock(ticker);
  }

  // 3. Build a text-based summary for the Researcher LLM Context
  let summary = `No pricing history available for public ticker "${ticker}".`;
  if (points.length >= 2) {
    const start = points[0].price;
    const end = points[points.length - 1].price;
    const diff = end - start;
    const pct = ((diff / start) * 100).toFixed(2);
    const direction = end >= start ? "upward" : "downward";
    
    // Find min and max in the range
    const prices = points.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    summary = `Stock historical trends for ticker "${ticker}" over the past 30 days: Started at $${start.toFixed(2)}, closed at $${end.toFixed(2)} (${pct}% ${direction} change). Trading range: Low of $${min.toFixed(2)}, High of $${max.toFixed(2)}.`;
  }

  return { ticker, points, summary };
}
