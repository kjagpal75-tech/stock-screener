export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  high52Week: number;
  low52Week: number;
  avgVolume: number;
  beta: number;
  sector: string;
  industry: string;
  debtToEquity: number;
  relativeStrength: number;
  interestCoverage: number;
  score: number;
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  exchange?: string;
}

export interface ScreeningCriteria {
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  sectors?: string[];
  minChangePercent?: number;
  maxChangePercent?: number;
  minBeta?: number;
  maxBeta?: number;
  maxDebtToEquity?: number;
  minRelativeStrength?: number;
  minInterestCoverage?: number;
}
