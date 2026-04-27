import { NextResponse } from 'next/server';

const NASDAQ_URL = 'https://www.nasdaqtrader.com/dynamic/symdir/nasdaqlisted.txt';
const OTHER_URL = 'https://www.nasdaqtrader.com/dynamic/symdir/otherlisted.txt';

interface SymbolWithExchange {
  symbol: string;
  exchange: string;
}

let cache: { symbols: SymbolWithExchange[]; timestamp: number } = { symbols: [], timestamp: 0 };
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchNASDAQSymbols(): Promise<SymbolWithExchange[]> {
  const response = await fetch(NASDAQ_URL);
  const text = await response.text();
  const lines = text.split('\n').slice(1); // Skip header
  
  const symbols: SymbolWithExchange[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('|');
    const symbol = parts[0] || '';
    const etf = parts[6] || '';
    const testIssue = parts[3] || '';
    
    // Filter: Common stocks only (not ETFs, not test issues)
    if (etf === 'N' && testIssue === 'N' && symbol && !symbol.includes('$') && !symbol.includes('.')) {
      symbols.push({ symbol, exchange: 'NASDAQ' });
    }
  }
  
  return symbols;
}

async function fetchOtherSymbols(): Promise<SymbolWithExchange[]> {
  const response = await fetch(OTHER_URL);
  const text = await response.text();
  const lines = text.split('\n').slice(1); // Skip header
  
  const symbols: SymbolWithExchange[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('|');
    const symbol = parts[0] || '';
    const etf = parts[4] || '';
    const testIssue = parts[6] || '';
    const exchange = parts[2] || '';
    
    // Filter: Common stocks only (not ETFs, not test issues, NYSE/N/AMEX/A only)
    if (etf === 'N' && testIssue === 'N' && (exchange === 'N' || exchange === 'A') && symbol && !symbol.includes('$') && !symbol.includes('.')) {
      const exchangeName = exchange === 'N' ? 'NYSE' : 'AMEX';
      symbols.push({ symbol, exchange: exchangeName });
    }
  }
  
  return symbols;
}

function filterByBatch(symbols: SymbolWithExchange[], batch: string): SymbolWithExchange[] {
  if (!batch) return symbols;
  
  // Parse batch range (e.g., "A-C", "D-F")
  const [start, end] = batch.split('-').map(s => s.toUpperCase());
  
  return symbols.filter(item => {
    const firstChar = item.symbol[0].toUpperCase();
    return firstChar >= start && firstChar <= end;
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const batch = url.searchParams.get('batch');
    const forceRefresh = url.searchParams.get('forceRefresh') === 'true';
    
    // Check cache
    const now = Date.now();
    if (!forceRefresh && cache.symbols.length > 0 && (now - cache.timestamp) < CACHE_DURATION) {
      const filtered = filterByBatch(cache.symbols, batch || '');
      return NextResponse.json({
        symbols: filtered,
        total: filtered.length,
        cached: true,
      });
    }
    
    // Fetch fresh data
    const [nasdaqSymbols, otherSymbols] = await Promise.all([
      fetchNASDAQSymbols(),
      fetchOtherSymbols(),
    ]);
    
    // Combine and deduplicate by symbol
    const symbolMap = new Map<string, SymbolWithExchange>();
    [...nasdaqSymbols, ...otherSymbols].forEach(item => {
      symbolMap.set(item.symbol, item);
    });
    const allSymbols = Array.from(symbolMap.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
    
    // Update cache
    cache = { symbols: allSymbols, timestamp: now };
    
    const filtered = filterByBatch(allSymbols, batch || '');
    
    return NextResponse.json({
      symbols: filtered,
      total: filtered.length,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching US symbols:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
