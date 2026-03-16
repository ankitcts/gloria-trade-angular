export enum MLModelType {
  LSTM_PRICE = 'lstm_price',
  LINEAR_REGRESSION = 'linear_regression',
  SVM = 'svm',
  RANDOM_FOREST = 'random_forest',
  XGBOOST = 'xgboost',
  TRANSFORMER = 'transformer',
  ENSEMBLE = 'ensemble',
}

export enum MLModelStatus {
  TRAINING = 'training',
  TRAINED = 'trained',
  DEPLOYED = 'deployed',
  DEPRECATED = 'deprecated',
  FAILED = 'failed',
}

export enum PredictionSignal {
  STRONG_BUY = 'strong_buy',
  BUY = 'buy',
  HOLD = 'hold',
  SELL = 'sell',
  STRONG_SELL = 'strong_sell',
}

export interface MLModel {
  id: string;
  name: string;
  model_type: MLModelType;
  status: MLModelStatus;
  version: string;
  security_id?: string;
  accuracy_metrics: {
    rmse?: number;
    mae?: number;
    mape?: number;
    directional_accuracy?: number;
  };
  trained_at?: string;
  created_at: string;
}

export interface MLPrediction {
  id: string;
  model_id: string;
  security_id: string;
  symbol: string;
  predicted_prices: { date: string; price: number }[];
  confidence: number;
  signal: PredictionSignal;
  risk_assessment: {
    daily_return_mean?: number;
    annual_return?: number;
    volatility?: number;
    sharpe_ratio?: number;
  };
  actual_prices?: { date: string; price: number }[];
  created_at: string;
}
