import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { query } from '@/lib/db';
import { Stock } from '@/types/stock';

interface SymbolWithExchange {
  symbol: string;
  exchange: string;
}

async function fetchUSSymbols(batch?: string): Promise<SymbolWithExchange[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stock-screener-esnlcgx4x-kuljit-s-projects.vercel.app';
  const url = batch ? `${baseUrl}/api/us-symbols?batch=${batch}` : `${baseUrl}/api/us-symbols`;
  const response = await fetch(url);
  const data = await response.json();
  return data.symbols;
}

// Scoring algorithm
function calculateStockScore(stock: Omit<Stock, 'score' | 'recommendation'>): number {
  let score = 50; // Base score

  // P/E Ratio (lower is better, under 25 is good)
  if (stock.pe > 0 && stock.pe < 15) score += 15;
  else if (stock.pe >= 15 && stock.pe < 25) score += 10;
  else if (stock.pe >= 25 && stock.pe < 40) score += 5;
  else if (stock.pe >= 40) score -= 10;

  // Market Cap (larger is more stable)
  if (stock.marketCap > 500e9) score += 10;
  else if (stock.marketCap > 100e9) score += 8;
  else if (stock.marketCap > 50e9) score += 5;
  else if (stock.marketCap > 10e9) score += 2;

  // Volume (higher is better liquidity)
  if (stock.volume > 10e6) score += 5;
  else if (stock.volume > 5e6) score += 3;
  else if (stock.volume > 1e6) score += 1;

  // Beta (lower is less volatile, better for conservative)
  if (stock.beta < 0.8) score += 10;
  else if (stock.beta < 1.0) score += 5;
  else if (stock.beta < 1.3) score += 0;
  else if (stock.beta >= 1.3) score -= 5;

  // Relative Strength (higher is better)
  if (stock.relativeStrength > 70) score += 15;
  else if (stock.relativeStrength > 60) score += 10;
  else if (stock.relativeStrength > 50) score += 5;
  else if (stock.relativeStrength < 40) score -= 5;

  // Debt-to-Equity (lower is better, normalized by sector)
  const sectorDebtLimits: Record<string, number> = {
    'Technology': 0.5,
    'Healthcare': 0.6,
    'Finance': 1.5,
    'Utilities': 1.5,
    'Energy': 1.0,
    'Consumer Cyclical': 0.8,
    'Consumer Defensive': 0.6,
    'Industrials': 0.8,
    'Real Estate': 1.2,
    'Unknown': 1.0,
  };
  const sectorLimit = sectorDebtLimits[stock.sector] || 1.0;
  const debtRatio = stock.debtToEquity / sectorLimit;
  if (debtRatio < 0.5) score += 10;
  else if (debtRatio < 0.8) score += 5;
  else if (debtRatio < 1.0) score += 0;
  else if (debtRatio >= 1.0) score -= 10;

  // Interest Coverage (higher is better)
  if (stock.interestCoverage > 10) score += 10;
  else if (stock.interestCoverage > 5) score += 5;
  else if (stock.interestCoverage > 3) score += 0;
  else if (stock.interestCoverage <= 3) score -= 10;

  // 52-week performance (being near 52-week high is bullish)
  const highPercent = (stock.price / stock.high52Week) * 100;
  if (highPercent > 95) score += 5;
  else if (highPercent > 90) score += 3;
  else if (highPercent > 80) score += 0;
  else if (highPercent < 70) score -= 5;

  return Math.min(100, Math.max(0, score));
}

function getRecommendation(score: number): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
  if (score >= 85) return 'Strong Buy';
  if (score >= 70) return 'Buy';
  if (score >= 50) return 'Hold';
  if (score >= 35) return 'Sell';
  return 'Strong Sell';
}

async function fetchSP500Symbols(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stock-screener-esnlcgx4x-kuljit-s-projects.vercel.app';
  try {
    const response = await fetch(`${baseUrl}/api/sp500-symbols`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`SP500 symbols API failed: ${response.status}`);
    }
    const data = await response.json();
    return data.symbols || [];
  } catch (error) {
    console.error('Error fetching S&P 500 symbols:', error);
    throw error;
  }
}

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const batch = url.searchParams.get('batch');
    const useSP500 = url.searchParams.get('sp500') === 'true';
    
    const symbols = useSP500 
      ? (await fetchSP500Symbols()).map(s => ({ symbol: s, exchange: 'S&P 500' as const }))
      : await fetchUSSymbols(batch || undefined);
    const yahooFinance = new YahooFinance();
    
    // Fetch S&P 500 for relative strength calculation
    const sp500Quote = await fetchWithRetry(() => yahooFinance.quote('^GSPC')) as any;
    const sp500Change = sp500Quote.regularMarketChangePercent || 0;

    let processed = 0;
    let errors = 0;

    // Fetch and update each stock
    for (const item of symbols) {
      const symbol = item.symbol;
      const exchange = item.exchange;
      
      try {
        const quote = await fetchWithRetry(() => yahooFinance.quote(symbol));
        
        // Fetch quoteSummary for additional metrics
        let sector = 'Unknown';
        let industry = 'Unknown';
        let debtToEquity = 0.5;
        let interestCoverage = 5;
        
        try {
          const summary = await fetchWithRetry(() => yahooFinance.quoteSummary(symbol, { modules: ['assetProfile', 'financialData'] })) as any;
          
          if (summary.assetProfile) {
            sector = summary.assetProfile.sector || 'Unknown';
            industry = summary.assetProfile.industry || 'Unknown';
          }
          
          if (summary.financialData) {
            debtToEquity = summary.financialData.debtToEquity || 0.5;
            interestCoverage = summary.financialData.interestCoverage || 5;
          }
        } catch (summaryError) {
          console.warn(`Failed to fetch quoteSummary for ${symbol}, using defaults`);
        }
        
        const changePercent = quote.regularMarketChangePercent || 0;
        const relativeStrength = Math.min(100, Math.max(0, 50 + (changePercent - sp500Change) * 2));

        const stockWithoutScore: Omit<Stock, 'score' | 'recommendation'> = {
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
          sector,
          industry,
          debtToEquity,
          relativeStrength: Math.round(relativeStrength),
          interestCoverage,
        };

        const score = calculateStockScore(stockWithoutScore);
        const recommendation = getRecommendation(score);

        // Upsert to database
        await query(
          `INSERT INTO stocks (
            symbol, name, price, change, change_percent, volume, market_cap,
            pe, eps, high_52_week, low_52_week, avg_volume, beta, sector, industry,
            debt_to_equity, relative_strength, interest_coverage, score, recommendation,
            exchange
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (symbol) DO UPDATE SET
            name = EXCLUDED.name,
            price = EXCLUDED.price,
            change = EXCLUDED.change,
            change_percent = EXCLUDED.change_percent,
            volume = EXCLUDED.volume,
            market_cap = EXCLUDED.market_cap,
            pe = EXCLUDED.pe,
            eps = EXCLUDED.eps,
            high_52_week = EXCLUDED.high_52_week,
            low_52_week = EXCLUDED.low_52_week,
            avg_volume = EXCLUDED.avg_volume,
            beta = EXCLUDED.beta,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            debt_to_equity = EXCLUDED.debt_to_equity,
            relative_strength = EXCLUDED.relative_strength,
            interest_coverage = EXCLUDED.interest_coverage,
            score = EXCLUDED.score,
            recommendation = EXCLUDED.recommendation,
            exchange = EXCLUDED.exchange,
            updated_at = CURRENT_TIMESTAMP`,
          [
            stockWithoutScore.symbol,
            stockWithoutScore.name,
            stockWithoutScore.price,
            stockWithoutScore.change,
            stockWithoutScore.changePercent,
            stockWithoutScore.volume,
            stockWithoutScore.marketCap,
            stockWithoutScore.pe,
            stockWithoutScore.eps,
            stockWithoutScore.high52Week,
            stockWithoutScore.low52Week,
            stockWithoutScore.avgVolume,
            stockWithoutScore.beta,
            stockWithoutScore.sector,
            stockWithoutScore.industry,
            stockWithoutScore.debtToEquity,
            stockWithoutScore.relativeStrength,
            stockWithoutScore.interestCoverage,
            score,
            recommendation,
            exchange,
          ]
        );

        processed++;
        
        // Log progress every 50 stocks
        if (processed % 50 === 0) {
          console.log(`Processed ${processed}/${symbols.length} stocks`);
        }
      } catch (error) {
        console.error(`Failed to process ${symbol}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      total: symbols.length,
    });
  } catch (error) {
    console.error('Error refreshing stocks:', error);
    return NextResponse.json(
      { error: 'Failed to refresh stocks', details: String(error) },
      { status: 500 }
    );
  }
}
