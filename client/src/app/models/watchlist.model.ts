export interface WatchlistItem {
  security_id: string;
  symbol: string;
  security_name?: string;
  alert_above?: number;
  alert_below?: number;
  notes?: string;
  added_at: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  securities: WatchlistItem[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
