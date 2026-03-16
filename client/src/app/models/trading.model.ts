export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LOSS = 'stop_loss',
  STOP_LIMIT = 'stop_limit',
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum OrderValidity {
  DAY = 'day',
  GTC = 'gtc',
  IOC = 'ioc',
  GTD = 'gtd',
}

export interface FillRecord {
  fill_id: string;
  quantity: number;
  price: number;
  fees: number;
  filled_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  portfolio_id: string;
  security_id: string;
  symbol: string;
  exchange_code: string;
  security_name?: string;
  order_type: OrderType;
  side: OrderSide;
  quantity: number;
  filled_quantity: number;
  limit_price?: number;
  stop_price?: number;
  avg_fill_price?: number;
  validity: OrderValidity;
  status: OrderStatus;
  fills: FillRecord[];
  total_amount?: number;
  total_fees: number;
  total_taxes: number;
  currency: string;
  realized_pnl?: number;
  is_simulated: boolean;
  trigger_source?: string;
  placed_at: string;
  executed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  security_id: string;
  portfolio_id: string;
  side: OrderSide;
  order_type: OrderType;
  quantity: number;
  limit_price?: number;
  stop_price?: number;
  validity?: OrderValidity;
}
