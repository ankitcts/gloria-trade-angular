export enum WsMessageType {
  QUOTE_UPDATE = 'quote_update',
  ORDER_UPDATE = 'order_update',
  NOTIFICATION = 'notification',
  TRADE_TICK = 'trade_tick',
  MARKET_SUMMARY = 'market_summary',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong',
}

export interface WsMessage {
  type: WsMessageType;
  channel?: string;
  data: unknown;
  timestamp?: string;
}

export interface QuoteUpdateData {
  security_id: string;
  symbol: string;
  last_price: number;
  change: number;
  change_pct: number;
  volume: number;
  timestamp: string;
}

export interface OrderUpdateData {
  order_id: string;
  status: string;
  filled_quantity: number;
  avg_fill_price: number;
}
