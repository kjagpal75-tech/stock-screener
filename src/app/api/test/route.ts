import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Stock } from '@/types/stock';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const pageParam = url.searchParams.get('page');
    
    const limit = limitParam ? parseInt(limitParam) : 25;
    const page = pageParam ? parseInt(pageParam) : 1;
    const offset = (page - 1) * limit;
    
    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) as total FROM stocks');
    const total = parseInt(countResult.rows[0].total);
    
    // Query stocks from PostgreSQL, sorted by score (highest first)
    const result = await query(
      `SELECT 
        symbol, name, price, change, change_percent as "changePercent", 
        volume, market_cap as "marketCap", pe, eps, 
        high_52_week as "high52Week", low_52_week as "low52Week", 
        avg_volume as "avgVolume", beta, sector, industry, 
        debt_to_equity as "debtToEquity", relative_strength as "relativeStrength", 
        interest_coverage as "interestCoverage", score, recommendation,
        exchange
      FROM stocks 
      ORDER BY score DESC 
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const stocks: Stock[] = result.rows.map(row => ({
      symbol: row.symbol,
      name: row.name,
      price: parseFloat(row.price),
      change: parseFloat(row.change),
      changePercent: parseFloat(row.changePercent),
      volume: parseInt(row.volume),
      marketCap: parseInt(row.marketCap),
      pe: parseFloat(row.pe),
      eps: parseFloat(row.eps),
      high52Week: parseFloat(row.high52Week),
      low52Week: parseFloat(row.low52Week),
      avgVolume: parseInt(row.avgVolume),
      beta: parseFloat(row.beta),
      sector: row.sector,
      industry: row.industry,
      debtToEquity: parseFloat(row.debtToEquity),
      relativeStrength: row.relativeStrength,
      interestCoverage: parseFloat(row.interestCoverage),
      score: row.score,
      recommendation: row.recommendation,
      exchange: row.exchange,
    }));

    return NextResponse.json({
      stocks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: String(error), stack: (error as any).stack }, { status: 500 });
  }
}
