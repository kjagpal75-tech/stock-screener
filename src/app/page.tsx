'use client';

import { useState, useEffect } from 'react';
import { Stock, ScreeningCriteria } from '@/types/stock';
import { fetchStocks, filterStocks, sortStocks, getTopPicks } from '@/lib/stockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Filter, ArrowUpDown, Sparkles } from 'lucide-react';

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [topPicks, setTopPicks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'changePercent' | 'volume' | 'marketCap'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [criteria, setCriteria] = useState<ScreeningCriteria>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });

  useEffect(() => {
    loadStocks();
  }, [page, limit]);

  useEffect(() => {
    const filtered = filterStocks(stocks, criteria);
    const sorted = sortStocks(filtered, sortBy, sortOrder);
    setFilteredStocks(sorted);
    setTopPicks(getTopPicks(sorted, 5));
  }, [stocks, criteria, sortBy, sortOrder]);

  const loadStocks = async () => {
    setLoading(true);
    const data = await fetchStocks(page, limit);
    setStocks(data.stocks);
    setPagination(data.pagination);
    setLoading(false);
  };

  const handleSort = (field: 'score' | 'changePercent' | 'volume' | 'marketCap') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Buy': return 'bg-green-500 text-white';
      case 'Buy': return 'bg-green-400 text-white';
      case 'Hold': return 'bg-yellow-400 text-white';
      case 'Sell': return 'bg-orange-400 text-white';
      case 'Strong Sell': return 'bg-red-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const sectors = ['Technology', 'Finance', 'Consumer Cyclical', 'Healthcare', 'Energy', 'Industrial'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500" />
            Stock Pop Finder
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Discover high-potential stocks with our advanced screening algorithm
          </p>
        </div>

        {topPicks.length > 0 && (
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Top Picks Today
              </CardTitle>
              <CardDescription>Stocks with the highest potential to pop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {topPicks.map((stock) => (
                  <Card key={stock.symbol} className="bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-lg">{stock.symbol}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{stock.name}</p>
                        </div>
                        <Badge className={getRecommendationColor(stock.recommendation)}>
                          {stock.recommendation}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
                        <p className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </p>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <span className="font-semibold">Score:</span>
                          <span className="text-blue-600 font-bold">{stock.score}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Stock Screener</CardTitle>
                <CardDescription>Filter and sort stocks to find your next investment</CardDescription>
              </div>
              <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <div>
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    value={criteria.minPrice || ''}
                    onChange={(e) => setCriteria({ ...criteria, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="1000"
                    value={criteria.maxPrice || ''}
                    onChange={(e) => setCriteria({ ...criteria, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minMarketCap">Min Market Cap (B)</Label>
                  <Input
                    id="minMarketCap"
                    type="number"
                    placeholder="1"
                    value={criteria.minMarketCap ? (criteria.minMarketCap / 1e9).toFixed(0) : ''}
                    onChange={(e) => setCriteria({ ...criteria, minMarketCap: e.target.value ? parseFloat(e.target.value) * 1e9 : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMarketCap">Max Market Cap (B)</Label>
                  <Input
                    id="maxMarketCap"
                    type="number"
                    placeholder="1000"
                    value={criteria.maxMarketCap ? (criteria.maxMarketCap / 1e9).toFixed(0) : ''}
                    onChange={(e) => setCriteria({ ...criteria, maxMarketCap: e.target.value ? parseFloat(e.target.value) * 1e9 : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minPE">Min P/E</Label>
                  <Input
                    id="minPE"
                    type="number"
                    placeholder="0"
                    value={criteria.minPE || ''}
                    onChange={(e) => setCriteria({ ...criteria, minPE: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPE">Max P/E</Label>
                  <Input
                    id="maxPE"
                    type="number"
                    placeholder="100"
                    value={criteria.maxPE || ''}
                    onChange={(e) => setCriteria({ ...criteria, maxPE: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minChange">Min Change %</Label>
                  <Input
                    id="minChange"
                    type="number"
                    placeholder="-10"
                    value={criteria.minChangePercent || ''}
                    onChange={(e) => setCriteria({ ...criteria, minChangePercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxChange">Max Change %</Label>
                  <Input
                    id="maxChange"
                    type="number"
                    placeholder="10"
                    value={criteria.maxChangePercent || ''}
                    onChange={(e) => setCriteria({ ...criteria, maxChangePercent: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Select
                    value={criteria.sectors?.[0] || 'all'}
                    onValueChange={(value) => setCriteria({ ...criteria, sectors: value === 'all' ? undefined : [value] })}
                  >
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="All Sectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxDebtToEquity">Max Debt-to-Equity</Label>
                  <Input
                    id="maxDebtToEquity"
                    type="number"
                    step="0.1"
                    placeholder="2.0"
                    value={criteria.maxDebtToEquity || ''}
                    onChange={(e) => setCriteria({ ...criteria, maxDebtToEquity: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minRelativeStrength">Min Relative Strength</Label>
                  <Input
                    id="minRelativeStrength"
                    type="number"
                    placeholder="50"
                    value={criteria.minRelativeStrength || ''}
                    onChange={(e) => setCriteria({ ...criteria, minRelativeStrength: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="minInterestCoverage">Min Interest Coverage</Label>
                  <Input
                    id="minInterestCoverage"
                    type="number"
                    step="0.1"
                    placeholder="3.0"
                    value={criteria.minInterestCoverage || ''}
                    onChange={(e) => setCriteria({ ...criteria, minInterestCoverage: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => setCriteria({})} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-zinc-500">Loading stock data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Exchange</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('changePercent')} className="font-semibold">
                          Change
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('volume')} className="font-semibold">
                          Volume
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('marketCap')} className="font-semibold">
                          Market Cap
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>P/E</TableHead>
                      <TableHead>D/E</TableHead>
                      <TableHead>IC</TableHead>
                      <TableHead>RS</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => handleSort('score')} className="font-semibold">
                          Score
                          <ArrowUpDown className="w-4 h-4 ml-1" />
                        </Button>
                      </TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock.symbol} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                        <TableCell className="font-bold">{stock.symbol}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{stock.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {stock.exchange || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${stock.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={stock.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatVolume(stock.volume)}</TableCell>
                        <TableCell>{formatNumber(stock.marketCap)}</TableCell>
                        <TableCell>{stock.pe ? stock.pe.toFixed(1) : 'N/A'}</TableCell>
                        <TableCell className={stock.debtToEquity && stock.debtToEquity > 1.5 ? 'text-red-600 font-semibold' : ''}>{stock.debtToEquity ? stock.debtToEquity.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell className={stock.interestCoverage && stock.interestCoverage < 3 ? 'text-red-600 font-semibold' : stock.interestCoverage && stock.interestCoverage >= 5 ? 'text-green-600' : ''}>{stock.interestCoverage ? stock.interestCoverage.toFixed(1) : 'N/A'}</TableCell>
                        <TableCell className={stock.relativeStrength >= 70 ? 'text-green-600 font-semibold' : stock.relativeStrength < 40 ? 'text-red-600' : ''}>{stock.relativeStrength}</TableCell>
                        <TableCell>
                          <span className="font-bold text-blue-600">{stock.score}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRecommendationColor(stock.recommendation)}>
                            {stock.recommendation}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredStocks.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    No stocks match your criteria. Try adjusting your filters.
                  </div>
                )}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Rows per page:</span>
                      <Select value={limit.toString()} onValueChange={(value) => { setLimit(parseInt(value)); setPage(1); }}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        Page {page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">1. Set Your Criteria</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use filters to narrow down stocks based on price, market cap, P/E ratio, sector, and more.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Analyze the Data</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Our algorithm scores stocks based on multiple factors including momentum, valuation, and volatility.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Make Your Move</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Review top picks and detailed metrics to make informed investment decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
