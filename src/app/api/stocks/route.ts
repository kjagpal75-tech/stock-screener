import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { Stock } from '@/types/stock';

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

const SYMBOLS = ['AAPL', 'NVDA']; // Test with just 2 symbols first

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function GET() {
  try {
    const yahooFinance = new YahooFinance();
    
    // Fetch quotes for all symbols sequentially to avoid rate limiting
    const quotes: any[] = [];
    for (const symbol of SYMBOLS) {
      try {
        const quote = await fetchWithRetry(() => yahooFinance.quote(symbol));
        quotes.push(quote);
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        // Continue with other symbols even if one fails
      }
    }

    // Fetch S&P 500 data for relative strength calculation
    const sp500Quote = await fetchWithRetry(() => yahooFinance.quote('^GSPC')) as any;
    const sp500Change = sp500Quote.regularMarketChangePercent || 0;

    const stocks: Omit<Stock, 'score' | 'recommendation'>[] = quotes.map(quote => {
      const metadata = STOCK_METADATA[quote.symbol];

      // Calculate relative strength (stock performance vs S&P 500)
      const changePercent = quote.regularMarketChangePercent || 0;
      const relativeStrength = Math.min(100, Math.max(0, 50 + (changePercent - sp500Change) * 2));

      return {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: changePercent,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0,
        pe: quote.trailingPE || 0,
        eps: quote.epsTrailingTwelveMonths || 0,
        high52Week: quote.fiftyTwoWeekHigh || 0,
        low52Week: quote.fiftyTwoWeekLow || 0,
        avgVolume: quote.averageDailyVolume3Month || quote.regularMarketVolume || 0,
        beta: quote.beta || 1,
        sector: metadata?.sector || 'Unknown',
        industry: metadata?.industry || 'Unknown',
        debtToEquity: 0.5, // Default value - quoteSummary disabled for now
        relativeStrength: Math.round(relativeStrength),
        interestCoverage: 5, // Default value
      };
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Error fetching real stock data from Yahoo Finance:', error);
    return NextResponse.json({ error: 'Failed to fetch stock data', details: String(error) }, { status: 500 });
  }
}
