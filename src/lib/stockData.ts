import { Stock, ScreeningCriteria } from '@/types/stock';

// Mock stock data - fallback if API fails
const mockStocks: Omit<Stock, 'score' | 'recommendation'>[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.42,
    change: 45.23,
    changePercent: 5.45,
    volume: 52340000,
    marketCap: 2.2e12,
    pe: 65.2,
    eps: 13.42,
    high52Week: 974.00,
    low52Week: 392.30,
    avgVolume: 45000000,
    beta: 1.72,
    sector: 'Technology',
    industry: 'Semiconductors',
    debtToEquity: 0.42,
    relativeStrength: 78,
    interestCoverage: 25.5
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 173.50,
    change: 2.15,
    changePercent: 1.25,
    volume: 42000000,
    marketCap: 2.7e12,
    pe: 28.5,
    eps: 6.08,
    high52Week: 199.62,
    low52Week: 124.17,
    avgVolume: 48000000,
    beta: 1.28,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    debtToEquity: 1.87,
    relativeStrength: 55,
    interestCoverage: 18.2
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 245.67,
    change: -8.32,
    changePercent: -3.28,
    volume: 98000000,
    marketCap: 780e9,
    pe: 42.8,
    eps: 5.74,
    high52Week: 299.29,
    low52Week: 101.81,
    avgVolume: 110000000,
    beta: 2.15,
    sector: 'Consumer Cyclical',
    industry: 'Auto Manufacturers',
    debtToEquity: 0.85,
    relativeStrength: 42,
    interestCoverage: 8.5
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.23,
    change: 6.78,
    changePercent: 1.66,
    volume: 22000000,
    marketCap: 3.1e12,
    pe: 35.2,
    eps: 11.80,
    high52Week: 468.35,
    low52Week: 309.45,
    avgVolume: 25000000,
    beta: 0.92,
    sector: 'Technology',
    industry: 'Software',
    debtToEquity: 0.35,
    relativeStrength: 62,
    interestCoverage: 32.1
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 178.25,
    change: 3.45,
    changePercent: 1.97,
    volume: 35000000,
    marketCap: 1.85e12,
    pe: 52.3,
    eps: 3.41,
    high52Week: 189.77,
    low52Week: 95.63,
    avgVolume: 40000000,
    beta: 1.18,
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    debtToEquity: 0.68,
    relativeStrength: 58,
    interestCoverage: 12.3
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    price: 485.32,
    change: 12.45,
    changePercent: 2.63,
    volume: 18000000,
    marketCap: 1.25e12,
    pe: 33.5,
    eps: 14.48,
    high52Week: 542.81,
    low52Week: 276.90,
    avgVolume: 20000000,
    beta: 1.24,
    sector: 'Technology',
    industry: 'Internet Content',
    debtToEquity: 0.15,
    relativeStrength: 72,
    interestCoverage: 45.8
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 156.78,
    change: 1.23,
    changePercent: 0.79,
    volume: 25000000,
    marketCap: 1.95e12,
    pe: 25.8,
    eps: 6.07,
    high52Week: 177.21,
    low52Week: 108.85,
    avgVolume: 28000000,
    beta: 1.05,
    sector: 'Technology',
    industry: 'Internet Services',
    debtToEquity: 0.12,
    relativeStrength: 48,
    interestCoverage: 38.2
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 162.45,
    change: 8.92,
    changePercent: 5.81,
    volume: 62000000,
    marketCap: 263e9,
    pe: 48.2,
    eps: 3.37,
    high52Week: 227.33,
    low52Week: 93.42,
    avgVolume: 55000000,
    beta: 1.85,
    sector: 'Technology',
    industry: 'Semiconductors',
    debtToEquity: 0.28,
    relativeStrength: 82,
    interestCoverage: 15.7
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies',
    price: 24.67,
    change: 1.85,
    changePercent: 8.12,
    volume: 85000000,
    marketCap: 45e9,
    pe: 68.5,
    eps: 0.36,
    high52Week: 27.50,
    low52Week: 13.70,
    avgVolume: 75000000,
    beta: 2.45,
    sector: 'Technology',
    industry: 'Software',
    debtToEquity: 0.05,
    relativeStrength: 88,
    interestCoverage: 52.3
  },
  {
    symbol: 'SMCI',
    name: 'Super Micro Computer',
    price: 890.25,
    change: 35.67,
    changePercent: 4.18,
    volume: 3200000,
    marketCap: 50e9,
    pe: 42.3,
    eps: 21.02,
    high52Week: 1229.00,
    low52Week: 213.54,
    avgVolume: 4500000,
    beta: 2.85,
    sector: 'Technology',
    industry: 'Computer Hardware',
    debtToEquity: 1.25,
    relativeStrength: 75,
    interestCoverage: 6.8
  },
  {
    symbol: 'COIN',
    name: 'Coinbase Global',
    price: 245.89,
    change: 15.23,
    changePercent: 6.61,
    volume: 12000000,
    marketCap: 60e9,
    pe: 35.8,
    eps: 6.87,
    high52Week: 283.48,
    low52Week: 73.25,
    avgVolume: 10000000,
    beta: 3.12,
    sector: 'Finance',
    industry: 'Financial Services',
    debtToEquity: 0.45,
    relativeStrength: 85,
    interestCoverage: 9.2
  },
  {
    symbol: 'SQ',
    name: 'Block, Inc.',
    price: 78.45,
    change: -2.34,
    changePercent: -2.90,
    volume: 15000000,
    marketCap: 47e9,
    pe: 28.5,
    eps: 2.75,
    high52Week: 98.76,
    low52Week: 56.23,
    avgVolume: 18000000,
    beta: 2.35,
    sector: 'Finance',
    industry: 'Financial Services',
    debtToEquity: 0.52,
    relativeStrength: 38,
    interestCoverage: 4.5
  }
];

// Scoring algorithm based on multiple factors
function calculateStockScore(stock: Omit<Stock, 'score' | 'recommendation'>): number {
  let score = 50; // Base score

  // 1. Price Momentum (weight: 20%)
  // Positive daily change is good, higher positive change is better
  const momentumScore = Math.min(100, Math.max(0, 50 + (stock.changePercent * 5)));
  score += (momentumScore - 50) * 0.20;

  // 2. Relative Strength (weight: 20%)
  // Compares stock performance against sector/market (0-100 scale)
  // Higher relative strength means the stock is outperforming its peers
  const rsScore = stock.relativeStrength;
  score += (rsScore - 50) * 0.20;

  // 3. Valuation - P/E Ratio (weight: 15%)
  // Lower P/E is generally better, but depends on sector
  // Tech stocks can have higher P/E, so we normalize by sector
  const sectorPE: Record<string, number> = {
    'Technology': 35,
    'Finance': 15,
    'Consumer Cyclical': 25,
    'Healthcare': 25,
    'Energy': 15,
    'Industrial': 20
  };
  const expectedPE = sectorPE[stock.sector] || 25;
  const peRatio = stock.pe / expectedPE;
  // Score is higher when P/E is reasonable (close to 1x sector average)
  const peScore = peRatio <= 1 ? 100 : Math.max(0, 100 - ((peRatio - 1) * 50));
  score += (peScore - 50) * 0.15;

  // 4. Debt-to-Equity Ratio (weight: 15%)
  // Normalized by sector - ideal ratios vary wildly by industry
  // Tech/Software: 0.1-0.5 (very low debt)
  // Finance: 0.5-1.0 (moderate debt)
  // Consumer Cyclical: 0.5-1.0 (moderate debt)
  // Healthcare: 0.3-0.7 (low to moderate)
  // Energy: 1.0-2.0+ (naturally higher due to capital intensity)
  // Industrial: 1.0-2.0+ (naturally higher due to capital intensity)
  const sectorDE: Record<string, { min: number; max: number }> = {
    'Technology': { min: 0.1, max: 0.5 },
    'Finance': { min: 0.5, max: 1.0 },
    'Consumer Cyclical': { min: 0.5, max: 1.0 },
    'Healthcare': { min: 0.3, max: 0.7 },
    'Energy': { min: 1.0, max: 2.0 },
    'Industrial': { min: 1.0, max: 2.0 }
  };
  const expectedDE = sectorDE[stock.sector] || { min: 0.5, max: 1.0 };
  
  // Calculate how close the D/E is to the ideal range
  let deScore: number;
  if (stock.debtToEquity >= expectedDE.min && stock.debtToEquity <= expectedDE.max) {
    // Within ideal range - score based on position in range
    const rangePosition = (stock.debtToEquity - expectedDE.min) / (expectedDE.max - expectedDE.min);
    deScore = 100 - (Math.abs(rangePosition - 0.5) * 20); // Center of range is best
  } else if (stock.debtToEquity < expectedDE.min) {
    // Below ideal range (very low debt) - generally good but could indicate under-leveraging
    deScore = Math.max(70, 100 - ((expectedDE.min - stock.debtToEquity) * 50));
  } else {
    // Above ideal range (high debt) - penalize based on how far above
    deScore = Math.max(0, 80 - ((stock.debtToEquity - expectedDE.max) * 40));
  }
  score += (deScore - 50) * 0.15;

  // 5. Volume Trend (weight: 10%)
  // Higher than average volume indicates interest
  const volumeRatio = stock.volume / stock.avgVolume;
  const volumeScore = Math.min(100, volumeRatio * 50);
  score += (volumeScore - 50) * 0.10;

  // 6. 52-Week Range Position (weight: 10%)
  // Being near 52-week high can indicate strength, but also risk
  const rangePosition = (stock.price - stock.low52Week) / (stock.high52Week - stock.low52Week);
  // Optimal is in the upper 60-80% range (not too high, not too low)
  const rangeScore = rangePosition >= 0.6 && rangePosition <= 0.8 ? 100 : 
                     rangePosition > 0.8 ? 70 : 
                     rangePosition < 0.3 ? 30 : 50;
  score += (rangeScore - 50) * 0.10;

  // 7. Beta/Volatility (weight: 5%)
  // Moderate beta (1-1.5) is optimal for growth
  const betaScore = stock.beta >= 1 && stock.beta <= 1.5 ? 100 :
                   stock.beta < 1 ? 60 :
                   stock.beta > 2 ? 40 : 70;
  score += (betaScore - 50) * 0.05;

  // 8. Market Cap (weight: 5%)
  // Mid-cap ($10B-$100B) often has good growth potential
  const marketCapScore = stock.marketCap >= 10e9 && stock.marketCap <= 100e9 ? 100 :
                        stock.marketCap < 10e9 ? 60 :
                        stock.marketCap > 500e9 ? 70 : 80;
  score += (marketCapScore - 50) * 0.05;

  // 9. Interest Coverage Ratio (tie-breaker for high-debt sectors)
  // Especially important for Energy and Industrial sectors with D/E > 1.0
  // Measures ability to pay interest: EBIT / Interest Expense
  // >5x is excellent, 3-5x is good, 2-3x is concerning, <2x is dangerous
  if (stock.debtToEquity > 1.0 || ['Energy', 'Industrial'].includes(stock.sector)) {
    const icScore = stock.interestCoverage >= 5 ? 100 :
                    stock.interestCoverage >= 3 ? 80 :
                    stock.interestCoverage >= 2 ? 50 :
                    Math.max(0, 50 - ((2 - stock.interestCoverage) * 25));
    // Apply as a smaller weight (3%) since it's a tie-breaker
    score += (icScore - 50) * 0.03;
  }

  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getRecommendation(score: number): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
  if (score >= 85) return 'Strong Buy';
  if (score >= 70) return 'Buy';
  if (score >= 50) return 'Hold';
  if (score >= 35) return 'Sell';
  return 'Strong Sell';
}

export async function fetchStocks(page: number = 1, limit: number = 25): Promise<{ stocks: Stock[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  try {
    // Fetch from PostgreSQL with pagination
    const response = await fetch(`/api/test?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    return {
      stocks: data.stocks,
      pagination: data.pagination,
    };
  } catch (error) {
    console.warn('Failed to fetch data from database, using mock data:', error);
    
    // Fallback to mock data if API fails
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stocks = mockStocks.map(stock => {
      const score = calculateStockScore(stock);
      const recommendation = getRecommendation(score);
      return {
        ...stock,
        score,
        recommendation
      };
    });
    
    return {
      stocks,
      pagination: {
        page,
        limit,
        total: stocks.length,
        totalPages: 1,
      },
    };
  }
}

export function filterStocks(stocks: Stock[], criteria: ScreeningCriteria): Stock[] {
  return stocks.filter(stock => {
    if (criteria.minPrice && stock.price < criteria.minPrice) return false;
    if (criteria.maxPrice && stock.price > criteria.maxPrice) return false;
    if (criteria.minVolume && stock.volume < criteria.minVolume) return false;
    if (criteria.minMarketCap && stock.marketCap < criteria.minMarketCap) return false;
    if (criteria.maxMarketCap && stock.marketCap > criteria.maxMarketCap) return false;
    if (criteria.minPE && stock.pe < criteria.minPE) return false;
    if (criteria.maxPE && stock.pe > criteria.maxPE) return false;
    if (criteria.minChangePercent && stock.changePercent < criteria.minChangePercent) return false;
    if (criteria.maxChangePercent && stock.changePercent > criteria.maxChangePercent) return false;
    if (criteria.minBeta && stock.beta < criteria.minBeta) return false;
    if (criteria.maxBeta && stock.beta > criteria.maxBeta) return false;
    if (criteria.maxDebtToEquity && stock.debtToEquity > criteria.maxDebtToEquity) return false;
    if (criteria.minRelativeStrength && stock.relativeStrength < criteria.minRelativeStrength) return false;
    if (criteria.minInterestCoverage && stock.interestCoverage < criteria.minInterestCoverage) return false;
    if (criteria.sectors && criteria.sectors.length > 0 && !criteria.sectors.includes(stock.sector)) return false;
    return true;
  });
}

export function sortStocks(stocks: Stock[], sortBy: 'score' | 'changePercent' | 'volume' | 'marketCap', order: 'asc' | 'desc'): Stock[] {
  return [...stocks].sort((a, b) => {
    const comparison = a[sortBy] - b[sortBy];
    return order === 'asc' ? comparison : -comparison;
  });
}

export function getTopPicks(stocks: Stock[], limit: number = 5): Stock[] {
  return sortStocks(stocks, 'score', 'desc').slice(0, limit);
}
