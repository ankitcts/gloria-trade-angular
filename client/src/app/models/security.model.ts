export enum SecurityType {
  EQUITY = 'equity',
  ETF = 'etf',
  INDEX = 'index',
  MUTUAL_FUND = 'mutual_fund',
  BOND = 'bond',
  COMMODITY = 'commodity',
  DERIVATIVE = 'derivative',
}

export enum Sector {
  TECHNOLOGY = 'technology',
  FINANCIAL_SERVICES = 'financial_services',
  HEALTHCARE = 'healthcare',
  CONSUMER_CYCLICAL = 'consumer_cyclical',
  CONSUMER_DEFENSIVE = 'consumer_defensive',
  INDUSTRIALS = 'industrials',
  ENERGY = 'energy',
  UTILITIES = 'utilities',
  REAL_ESTATE = 'real_estate',
  COMMUNICATION_SERVICES = 'communication_services',
  BASIC_MATERIALS = 'basic_materials',
  OTHER = 'other',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export interface ExchangeListing {
  exchange_code: string;
  ticker: string;
  is_primary: boolean;
  listing_date?: string;
  delisting_date?: string;
  lot_size: number;
  is_active: boolean;
}

export interface Fundamentals {
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  eps?: number;
  dividend_yield_pct?: number;
  book_value?: number;
  face_value?: number;
  week_52_high?: number;
  week_52_low?: number;
  avg_volume_30d?: number;
  beta?: number;
  debt_to_equity?: number;
  roe_pct?: number;
  updated_at?: string;
}

export interface QuoteSnapshot {
  last_price?: number;
  change?: number;
  change_pct?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  prev_close?: number;
  volume?: number;
  bid?: number;
  ask?: number;
  timestamp?: string;
}

export interface SecuritySummary {
  id: string;
  symbol: string;
  name: string;
  security_type: SecurityType;
  sector?: Sector;
  primary_exchange_code: string;
  currency: string;
  country_code: string;
  computed_risk?: RiskLevel;
  last_price?: number;
  change_pct?: number;
  is_active: boolean;
}

export interface SecurityDetail extends SecuritySummary {
  isin?: string;
  industry?: string;
  description?: string;
  listings: ExchangeListing[];
  fundamentals: Fundamentals;
  quote: QuoteSnapshot;
  risk_updated_at?: string;
  data_source?: string;
  has_historical_data: boolean;
  historical_data_from?: string;
  historical_data_to?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close?: number;
  change_pct?: number;
}
