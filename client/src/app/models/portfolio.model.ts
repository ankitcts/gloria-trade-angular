export interface Holding {
  security_id: string;
  symbol: string;
  security_name?: string;
  quantity: number;
  avg_cost_price: number;
  current_price?: number;
  invested_value: number;
  current_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
  sector?: string;
  last_updated?: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  order_id?: string;
  security_id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'bonus';
  quantity: number;
  price: number;
  fees: number;
  taxes: number;
  net_amount: number;
  currency: string;
  executed_at: string;
}

export interface PortfolioSnapshot {
  date: string;
  total_value: number;
  invested_value: number;
  realized_pnl: number;
  unrealized_pnl: number;
}

export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  currency: string;
  holdings: Holding[];
  total_invested: number;
  total_current_value: number;
  total_realized_pnl: number;
  total_unrealized_pnl: number;
  holdings_count: number;
  created_at: string;
  updated_at: string;
}
