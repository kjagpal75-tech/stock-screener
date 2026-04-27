import { Stock } from '@/types/stock';

const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

// Sector/Industry mapping for stocks we track
const STOCK_METADATA: Record<string, { sector: string; industry: string }> = {
  'NVDA': { sector: 'Technology', industry: 'Semiconductors' },
  'AAPL': { sector: 'Technology', industry: 'Consumer Electronics' },
  'TSLA': { sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  'MSFT': { sector: 'Technology', industry: 'Software' },
  'AMZN': { sector: 'Consumer Cyclical', industry: 'Internet Retail' },
  'META': { sector: 'Technology', industry: 'Internet Content' },
  'GOOGL': { sector: 'Technology', industry: 'Internet Services' },
  'AMD': { sector: 'Technology', industry: 'Semiconductors' },
  'PLTR': { sector: 'Technology', industry: 'Software' },
  'SMCI': { sector: 'Technology', industry: 'Computer Hardware' },
  'COIN': { sector: 'Finance', industry: 'Financial Services' },
  'SQ': { sector: 'Finance', industry: 'Financial Services' },
};

const SYMBOLS = Object.keys(STOCK_METADATA);

interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  avgVolume: number;
  beta: number;
}

interface FMPProfile {
  symbol: string;
  industry: string;
  sector: string;
  debtToEquity: number;
  interestCoverage: number;
}

interface FMPHistoricalPrice {
  date: string;
  close: number;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

export async function fetchRealStockData(): Promise<Omit<Stock, 'score' | 'recommendation'>[]> {
  if (!FMP_API_KEY || FMP_API_KEY === 'your_fmp_api_key_here') {
    throw new Error('FMP_API_KEY not set. Please add your API key to .env.local');
  }

  try {
    // Fetch quotes individually (free tier doesn't support batch)
    const quotePromises = SYMBOLS.map(symbol => 
      fetchWithRetry(`${BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`)
    );
    const quotesResponses = await Promise.all(quotePromises);
    const quotes: FMPQuote[] = quotesResponses.flat();

    // Fetch profiles individually
    const profilePromises = SYMBOLS.map(symbol => 
      fetchWithRetry(`${BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`)
    );
    const profilesResponses = await Promise.all(profilePromises);
    const profiles: FMPProfile[] = profilesResponses.flat();

    // Fetch S&P 500 data for relative strength calculation
    const sp500Url = `${BASE_URL}/quote/^GSPC?apikey=${FMP_API_KEY}`;
    const sp500Data = await fetchWithRetry(sp500Url);
    const sp500Change = sp500Data[0]?.changesPercentage || 0;

    // Create a map for quick lookup
    const profileMap = new Map(profiles.map(p => [p.symbol, p]));

    const stocks: Omit<Stock, 'score' | 'recommendation'>[] = quotes.map(quote => {
      const profile = profileMap.get(quote.symbol);
      const metadata = STOCK_METADATA[quote.symbol];

      // Calculate relative strength (stock performance vs S&P 500)
      const relativeStrength = Math.min(100, Math.max(0, 50 + (quote.changesPercentage - sp500Change) * 2));

      return {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changesPercentage,
        volume: quote.volume,
        marketCap: quote.marketCap,
        pe: quote.pe || 0,
        eps: quote.eps || 0,
        high52Week: quote.yearHigh,
        low52Week: quote.yearLow,
        avgVolume: quote.avgVolume || quote.volume,
        beta: quote.beta || 1,
        sector: metadata?.sector || profile?.sector || 'Unknown',
        industry: metadata?.industry || profile?.industry || 'Unknown',
        debtToEquity: profile?.debtToEquity || 0.5,
        relativeStrength: Math.round(relativeStrength),
        interestCoverage: profile?.interestCoverage || 5,
      };
    });

    return stocks;
  } catch (error) {
    console.error('Error fetching real stock data:', error);
    throw error;
  }
}
