import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Simple sample stock data to populate database
const SAMPLE_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24, volume: 5278900000, marketCap: 2750000000000, pe: 29.12, eps: 6.02, high52Week: 198.23, low52Week: 124.17, avgVolume: 52000000, beta: 1.25, sector: 'Technology', industry: 'Consumer Electronics', debtToEquity: 1.73, relativeStrength: 75, interestCoverage: 15.5, score: 85, recommendation: 'BUY', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.91, change: -1.23, changePercent: -0.32, volume: 21000000, marketCap: 2810000000000, pe: 32.15, eps: 11.79, high52Week: 384.52, low52Week: 213.43, avgVolume: 22000000, beta: 0.92, sector: 'Technology', industry: 'Software', debtToEquity: 0.47, relativeStrength: 65, interestCoverage: 25.3, score: 78, recommendation: 'HOLD', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.67, change: 0.89, changePercent: 0.64, volume: 28000000, marketCap: 1760000000000, pe: 26.21, eps: 5.33, high52Week: 151.55, low52Week: 83.34, avgVolume: 30000000, beta: 1.05, sector: 'Technology', industry: 'Internet Services', debtToEquity: 0.11, relativeStrength: 70, interestCoverage: 45.2, score: 82, recommendation: 'HOLD', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.32, change: 3.45, changePercent: 2.43, volume: 45000000, marketCap: 1510000000000, pe: 58.94, eps: 2.46, high52Week: 188.11, low52Week: 81.43, avgVolume: 55000000, beta: 1.17, sector: 'Consumer Cyclical', industry: 'Internet Retail', debtToEquity: 0.54, relativeStrength: 68, interestCoverage: 12.8, score: 75, recommendation: 'BUY', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -5.67, changePercent: -2.28, volume: 118000000, marketCap: 770000000000, pe: 73.45, eps: 3.31, high52Week: 414.50, low52Week: 101.81, avgVolume: 98000000, beta: 2.02, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', debtToEquity: 1.25, relativeStrength: 55, interestCoverage: 8.5, score: 70, recommendation: 'SELL', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 456.78, change: 12.34, changePercent: 2.78, volume: 41000000, marketCap: 1120000000000, pe: 65.32, eps: 6.99, high52Week: 502.66, low52Week: 108.13, avgVolume: 62000000, beta: 1.65, sector: 'Technology', industry: 'Semiconductors', debtToEquity: 0.23, relativeStrength: 90, interestCoverage: 35.7, score: 88, recommendation: 'BUY', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 325.78, change: 8.91, changePercent: 2.81, volume: 15000000, marketCap: 830000000000, pe: 31.45, eps: 10.37, high52Week: 384.52, low52Week: 88.09, avgVolume: 28000000, beta: 1.19, sector: 'Technology', industry: 'Internet Content', debtToEquity: 0.08, relativeStrength: 72, interestCoverage: 28.5, score: 83, recommendation: 'BUY', exchange: 'NASDAQ' },
];

export async function POST(request: Request) {
  try {
    const { count = 7 } = await request.json();
    
    const stocksToInsert = SAMPLE_STOCKS.slice(0, count);
    let processed = 0;
    let errors = 0;
    
    for (const stock of stocksToInsert) {
      try {
        await query(`
          INSERT INTO stocks (symbol, name, price, change, change_percent, volume, 
          market_cap, pe, eps, high_52_week, low_52_week, avg_volume, 
          beta, sector, industry, debt_to_equity, relative_strength, 
          interest_coverage, score, recommendation, exchange, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
          ON CONFLICT (symbol) DO UPDATE SET
          name = EXCLUDED.name, price = EXCLUDED.price, change = EXCLUDED.change,
          change_percent = EXCLUDED.change_percent, volume = EXCLUDED.volume,
          market_cap = EXCLUDED.market_cap, pe = EXCLUDED.pe, eps = EXCLUDED.eps,
          high_52_week = EXCLUDED.high_52_week, low_52_week = EXCLUDED.low_52_week,
          avg_volume = EXCLUDED.avg_volume, beta = EXCLUDED.beta,
          sector = EXCLUDED.sector, industry = EXCLUDED.industry,
          debt_to_equity = EXCLUDED.debt_to_equity, relative_strength = EXCLUDED.relative_strength,
          interest_coverage = EXCLUDED.interest_coverage, score = EXCLUDED.score,
          recommendation = EXCLUDED.recommendation, exchange = EXCLUDED.exchange,
          updated_at = NOW()
        `, [
          stock.symbol, stock.name, stock.price, stock.change, stock.changePercent,
          stock.volume, stock.marketCap, stock.pe, stock.eps,
          stock.high52Week, stock.low52Week, stock.avgVolume, stock.beta,
          stock.sector, stock.industry, stock.debtToEquity, stock.relativeStrength,
          stock.interestCoverage, stock.score, stock.recommendation, stock.exchange
        ]);
        processed++;
      } catch (error) {
        console.error(`Error inserting ${stock.symbol}:`, error);
        errors++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Populated ${processed} sample stocks`,
      errors,
      total: stocksToInsert.length
    });
  } catch (error) {
    console.error('Error in simple population:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stockCount = await query('SELECT COUNT(*) as count FROM stocks');
    const count = parseInt(stockCount.rows[0]?.count || 0);
    
    return NextResponse.json({
      currentStockCount: count,
      sampleStocksAvailable: SAMPLE_STOCKS.length,
      message: 'Use POST to populate sample stocks'
    });
  } catch (error) {
    console.error('Error checking stock count:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
