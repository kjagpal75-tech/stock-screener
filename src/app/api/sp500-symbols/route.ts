import { NextResponse } from 'next/server';

// Cache for S&P 500 symbols
let cachedSymbols: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Clear cache for testing
cachedSymbols = null;
cacheTimestamp = 0;

async function fetchSP500Symbols(): Promise<string[]> {
  try {
    // Fetch Wikipedia page
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies');
    const html = await response.text();
    
    // Parse the HTML to extract ticker symbols
    // The Wikipedia page has a table with tickers in the format: <td><a href="/wiki/...">TICKER</a></td>
    const tickerRegex = /<td><a href="\/wiki\/[^"]+">([A-Z\.]+)<\/a><\/td>/g;
    const symbols: string[] = [];
    let match;
    
    while ((match = tickerRegex.exec(html)) !== null) {
      const symbol = match[1];
      // Filter out common words and ensure it looks like a ticker
      if (symbol.length >= 2 && symbol.length <= 5 && /^[A-Z\.]+$/.test(symbol) && !symbols.includes(symbol)) {
        symbols.push(symbol);
      }
    }
    
    // If scraping failed, return a fallback list of major S&P 500 stocks
    if (symbols.length < 100) {
      return [
        'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'JPM',
        'JNJ', 'V', 'PG', 'XOM', 'UNH', 'HD', 'MA', 'BAC', 'PFE', 'COST', 'CVX', 'KO',
        'PEP', 'MRK', 'AVGO', 'CSCO', 'ABBV', 'ADBE', 'CRM', 'NFLX', 'ACN', 'WMT', 'MCD',
        'NKE', 'DHR', 'ABT', 'LIN', 'QCOM', 'VZ', 'TXN', 'NEE', 'C', 'MDT', 'T', 'HON',
        'UNP', 'UPS', 'LMT', 'CAT', 'MMM', 'GE', 'IBM', 'GS', 'INTC', 'AMD', 'DIS', 'BA',
        'WFC', 'COP', 'RTX', 'AMAT', 'BLK', 'SPGI', 'GILD', 'PM', 'DE', 'MS', 'SBUX', 'ADP',
        'EL', 'PLD', 'TMO', 'CVS', 'LOW', 'CB', 'CI', 'MMC', 'AMGN', 'MDLZ', 'ISRG', 'PYPL',
        'BX', 'ATVI', 'ADSK', 'CSX', 'USB', 'SLB', 'CL', 'PNC', 'ANTM', 'KHC', 'VRTX', 'REGN',
        'EOG', 'SYK', 'BDX', 'F', 'GM', 'TJX', 'ORCL', 'ZTS', 'LLY', 'HUM', 'BMY', 'MRNA',
        'NOW', 'DG', 'ADI', 'EW', 'AON', 'MRO', 'SCHW', 'BIIB', 'GPN', 'MU', 'RMD', 'DECK',
        'CME', 'EQIX', 'MNST', 'SNPS', 'AJG', 'ROP', 'SHW', 'KMB', 'IBKR', 'EMR', 'ETN', 'PGR',
        'WST', 'A', 'FTNT', 'ELV', 'APD', 'TDG', 'ITW', 'MCK', 'HCA', 'K', 'CARR', 'DHI',
        'ORLY', 'AZO', 'PAYX', 'IDXX', 'CDAY', 'TRV', 'CNC', 'RJF', 'WTW', 'FAST', 'ANET',
        'DXCM', 'BKNG', 'EXC', 'LEN', 'LRCX', 'PH', 'ODFL', 'CHD', 'PNR', 'TDY', 'AMP', 'WBD',
        'CTAS', 'HSIC', 'ROST', 'KDP', 'CBOE', 'MKC', 'CTSH', 'HIG', 'O', 'XYL', 'KEYS',
        'TECH', 'RCL', 'MPC', 'NDAQ', 'LKQ', 'COO', 'FDS', 'GLW', 'CRL', 'ALGN', 'EA', 'EXPD',
        'CINF', 'SWK', 'LHX', 'WEC', 'BKR', 'ESS', 'WAB', 'TT', 'HES', 'FTV', 'ALL', 'KR',
        'RSG', 'SLG', 'CPRT', 'TRMB', 'JBHT', 'VMC', 'WAT', 'AME', 'CPT', 'WY', 'RE', 'HWM',
        'AEE', 'XEL', 'AWK', 'ED', 'DTE', 'FE', 'NI', 'PNW', 'PEG', 'SRE', 'WEC'
      ];
    }
    
    return symbols;
  } catch (error) {
    console.error('Error fetching S&P 500 symbols from Wikipedia:', error);
    // Return fallback list on error
    return [
      'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'JPM',
      'JNJ', 'V', 'PG', 'XOM', 'UNH', 'HD', 'MA', 'BAC', 'PFE', 'COST', 'CVX', 'KO',
      'PEP', 'MRK', 'AVGO', 'CSCO', 'ABBV', 'ADBE', 'CRM', 'NFLX', 'ACN', 'WMT', 'MCD',
      'NKE', 'DHR', 'ABT', 'LIN', 'QCOM', 'VZ', 'TXN', 'NEE', 'C', 'MDT', 'T', 'HON',
      'UNP', 'UPS', 'LMT', 'CAT', 'MMM', 'GE', 'IBM', 'GS', 'INTC', 'AMD', 'DIS', 'BA',
      'WFC', 'COP', 'RTX', 'AMAT', 'BLK', 'SPGI', 'GILD', 'PM', 'DE', 'MS', 'SBUX', 'ADP',
      'EL', 'PLD', 'TMO', 'CVS', 'LOW', 'CB', 'CI', 'MMC', 'AMGN', 'MDLZ', 'ISRG', 'PYPL',
      'BX', 'ATVI', 'ADSK', 'CSX', 'USB', 'SLB', 'CL', 'PNC', 'ANTM', 'KHC', 'VRTX', 'REGN',
      'EOG', 'SYK', 'BDX', 'F', 'GM', 'TJX', 'ORCL', 'ZTS', 'LLY', 'HUM', 'BMY', 'MRNA',
      'NOW', 'DG', 'ADI', 'EW', 'AON', 'MRO', 'SCHW', 'BIIB', 'GPN', 'MU', 'RMD', 'DECK',
      'CME', 'EQIX', 'MNST', 'SNPS', 'AJG', 'ROP', 'SHW', 'KMB', 'IBKR', 'EMR', 'ETN', 'PGR',
      'WST', 'A', 'FTNT', 'ELV', 'APD', 'TDG', 'ITW', 'MCK', 'HCA', 'K', 'CARR', 'DHI',
      'ORLY', 'AZO', 'PAYX', 'IDXX', 'CDAY', 'TRV', 'CNC', 'RJF', 'WTW', 'FAST', 'ANET',
      'DXCM', 'BKNG', 'EXC', 'LEN', 'LRCX', 'PH', 'ODFL', 'CHD', 'PNR', 'TDY', 'AMP', 'WBD',
      'CTAS', 'HSIC', 'ROST', 'KDP', 'CBOE', 'MKC', 'CTSH', 'HIG', 'O', 'XYL', 'KEYS',
      'TECH', 'RCL', 'MPC', 'NDAQ', 'LKQ', 'COO', 'FDS', 'GLW', 'CRL', 'ALGN', 'EA', 'EXPD',
      'CINF', 'SWK', 'LHX', 'WEC', 'BKR', 'ESS', 'WAB', 'TT', 'HES', 'FTV', 'ALL', 'KR',
      'RSG', 'SLG', 'CPRT', 'TRMB', 'JBHT', 'VMC', 'WAT', 'AME', 'CPT', 'WY', 'RE', 'HWM',
      'AEE', 'XEL', 'AWK', 'ED', 'DTE', 'FE', 'NI', 'PNW', 'PEG', 'SRE', 'WEC'
    ];
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';
  const limitParam = url.searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam) : undefined;
  const now = Date.now();
  
  // Return cached data if available and not expired (unless force refresh)
  if (!forceRefresh && cachedSymbols && (now - cacheTimestamp) < CACHE_DURATION) {
    const symbols = limit ? cachedSymbols.slice(0, limit) : cachedSymbols;
    return NextResponse.json({
      symbols,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000 / 60), // minutes
    });
  }
  
  try {
    const symbols = await fetchSP500Symbols();
    
    // Update cache
    cachedSymbols = symbols;
    cacheTimestamp = now;
    
    const limitedSymbols = limit ? symbols.slice(0, limit) : symbols;
    
    return NextResponse.json({
      symbols: limitedSymbols,
      cached: false,
      count: limitedSymbols.length,
      total: symbols.length,
    });
  } catch (error) {
    // If fetch fails but we have cached data, return it
    if (cachedSymbols) {
      const symbols = limit ? cachedSymbols.slice(0, limit) : cachedSymbols;
      return NextResponse.json({
        symbols,
        cached: true,
        cacheAge: Math.floor((now - cacheTimestamp) / 1000 / 60),
        error: 'Failed to fetch fresh data, using cached data',
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch S&P 500 symbols' },
      { status: 500 }
    );
  }
}
