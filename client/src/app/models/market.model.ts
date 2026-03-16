export interface Country {
  id: string;
  code: string;
  name: string;
  default_currency: string;
  regulatory_body?: string;
  market_timezone: string;
}

export interface TradingHours {
  open: string;
  close: string;
  pre_open?: string;
  post_close?: string;
}

export interface Exchange {
  id: string;
  code: string;
  name: string;
  mic_code?: string;
  country_code: string;
  currency: string;
  timezone: string;
  trading_hours?: TradingHours;
  lot_size: number;
  tick_size: number;
  circuit_breaker_pct?: number;
  is_active: boolean;
  securities_count?: number;
}
