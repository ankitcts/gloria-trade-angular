export enum SentimentSource {
  NEWS = 'news',
  TWITTER = 'twitter',
  REDDIT = 'reddit',
  STOCKTWITS = 'stocktwits',
  ANALYST_REPORT = 'analyst_report',
  EARNINGS_CALL = 'earnings_call',
  RSS = 'rss',
}

export enum SentimentLabel {
  VERY_BULLISH = 'very_bullish',
  BULLISH = 'bullish',
  NEUTRAL = 'neutral',
  BEARISH = 'bearish',
  VERY_BEARISH = 'very_bearish',
}

export interface SentimentRecord {
  id: string;
  security_id?: string;
  symbol?: string;
  source: SentimentSource;
  label: SentimentLabel;
  score: number;
  title?: string;
  summary?: string;
  url?: string;
  published_at?: string;
  created_at: string;
}
