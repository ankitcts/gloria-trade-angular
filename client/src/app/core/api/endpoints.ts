export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  SECURITIES: {
    LIST: '/securities',
    DETAIL: (id: string) => `/securities/${id}`,
    SEARCH: '/securities/search',
    HISTORY: (id: string) => `/securities/${id}/history`,
  },
  PREDICTIONS: {
    LIST: '/predictions',
    DETAIL: (id: string) => `/predictions/${id}`,
    BY_SECURITY: (securityId: string) => `/securities/${securityId}/predictions`,
  },
  TRADING: {
    ORDERS: '/orders',
    ORDER_DETAIL: (id: string) => `/orders/${id}`,
    CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,
    TRADES: '/trades',
  },
  PORTFOLIO: {
    LIST: '/portfolios',
    DETAIL: (id: string) => `/portfolios/${id}`,
    HOLDINGS: (id: string) => `/portfolios/${id}/holdings`,
    TRANSACTIONS: (id: string) => `/portfolios/${id}/transactions`,
  },
  WATCHLIST: {
    LIST: '/watchlists',
    DETAIL: (id: string) => `/watchlists/${id}`,
    ADD_SECURITY: (id: string) => `/watchlists/${id}/securities`,
    REMOVE_SECURITY: (id: string, secId: string) => `/watchlists/${id}/securities/${secId}`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  OTP: {
    SEND: '/otp/send',
    VERIFY: '/otp/verify',
  },
  ADMIN: {
    USERS: '/admin',
    USER_DETAIL: (id: string) => `/admin/${id}`,
    USER_ROLE: (id: string) => `/admin/${id}/role`,
    USER_STATUS: (id: string) => `/admin/${id}/status`,
    USER_PERMISSIONS: (id: string) => `/admin/${id}/permissions`,
    RESET_PASSWORD: (id: string) => `/admin/${id}/reset-password`,
    GROUPS: '/admin/groups',
    GROUP_DETAIL: (id: string) => `/admin/groups/${id}`,
    GROUP_MEMBERS: (id: string) => `/admin/groups/${id}/members`,
  },
} as const;
