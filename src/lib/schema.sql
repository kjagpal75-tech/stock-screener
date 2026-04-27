-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
  symbol VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 4),
  change DECIMAL(12, 4),
  change_percent DECIMAL(8, 4),
  volume BIGINT,
  market_cap BIGINT,
  pe DECIMAL(10, 2),
  eps DECIMAL(10, 2),
  high_52_week DECIMAL(12, 4),
  low_52_week DECIMAL(12, 4),
  avg_volume BIGINT,
  beta DECIMAL(6, 3),
  sector VARCHAR(100),
  industry VARCHAR(100),
  debt_to_equity DECIMAL(10, 2),
  relative_strength INTEGER,
  interest_coverage DECIMAL(10, 2),
  score INTEGER,
  recommendation VARCHAR(20),
  exchange VARCHAR(20),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stocks_score ON stocks(score DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);
CREATE INDEX IF NOT EXISTS idx_stocks_market_cap ON stocks(market_cap DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_updated_at ON stocks(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stocks_exchange ON stocks(exchange);
