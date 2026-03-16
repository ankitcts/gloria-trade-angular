export enum NotificationType {
  ORDER_FILLED = 'order_filled',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_REJECTED = 'order_rejected',
  PRICE_ALERT = 'price_alert',
  PREDICTION_READY = 'prediction_ready',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
