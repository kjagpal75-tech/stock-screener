#!/usr/bin/env node

// Standalone script to refresh stock data from Yahoo Finance
// Can be run manually or via cron job
// Usage: node -r ts-node/register scripts/refresh-stocks.ts [batch=A-C] [sp500=true]

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

async function refreshStocks() {
  const batch = process.argv.find(arg => arg.startsWith('batch='))?.split('=')[1];
  const useSP500 = process.argv.includes('sp500=true');
  
  let url = `${baseUrl}/api/refresh-stocks`;
  const params = new URLSearchParams();
  
  if (batch) params.append('batch', batch);
  if (useSP500) params.append('sp500', 'true');
  
  if (params.toString()) url += `?${params.toString()}`;
  
  console.log(`Starting stock data refresh${batch ? ` for batch ${batch}` : ''}${useSP500 ? ' (S&P 500)' : ''}...`);
  const startTime = Date.now();
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (data.success) {
      console.log(`✓ Stock data refreshed successfully in ${duration}s`);
      console.log(`  Processed: ${data.processed} stocks`);
      console.log(`  Errors: ${data.errors}`);
      console.log(`  Total: ${data.total}`);
    } else {
      console.error('✗ Failed to refresh stock data:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ Error refreshing stock data:', error);
    process.exit(1);
  }
}

refreshStocks();
