export enum UserRole {
  ADMIN = 'admin',
  TRADER = 'trader',
  ANALYST = 'analyst',
  VIEWER = 'viewer',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DEACTIVATED = 'deactivated',
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  DOCUMENTS_SUBMITTED = 'documents_submitted',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum Permission {
  TRADE_EXECUTE = 'trade:execute',
  TRADE_VIEW = 'trade:view',
  PORTFOLIO_MANAGE = 'portfolio:manage',
  PORTFOLIO_VIEW = 'portfolio:view',
  MARKET_DATA_REALTIME = 'market_data:realtime',
  MARKET_DATA_HISTORICAL = 'market_data:historical',
  SENTIMENT_VIEW = 'sentiment:view',
  PREDICTIONS_VIEW = 'predictions:view',
  ADMIN_USERS = 'admin:users',
  ADMIN_SYSTEM = 'admin:system',
}

export interface RiskProfile {
  high_pct: number;
  medium_pct: number;
  low_pct: number;
  max_daily_trade_amount: number | null;
  preferred_currency: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  role: UserRole;
  account_status: AccountStatus;
  group_ids: string[];
  extra_permissions: Permission[];
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserDetail extends User {
  phone: string | null;
  timezone: string;
  preferred_locale: string;
  kyc: { status: KYCStatus; document_type?: string };
  risk_profile: RiskProfile;
}
