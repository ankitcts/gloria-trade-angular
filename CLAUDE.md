# Gloria Trade Angular - Trading Platform

## Project Overview
Full-stack AI-powered trading platform built with Angular 19 + FastAPI + MongoDB.
Enterprise-grade with TradingView-inspired dark theme, OTP verification, and real-time WebSocket.

## Tech Stack
- **Frontend**: Angular 19 (standalone components, signals), Angular Material, Lightweight Charts v5
- **Backend**: FastAPI (Python 3.12+), Beanie ODM, MongoDB Atlas
- **Auth**: JWT (access + refresh tokens) + OTP verification for sensitive actions
- **Real-time**: WebSocket with auto-reconnect
- **Theme**: TradingView-inspired dark (#131722 bg, #2962ff accent, #26a69a/#ef5350 P&L)
- **Currency**: USD (B/M/K notation)
- **Containerization**: Docker Compose (local dev)

## Project Structure
```
gloria-trade-angular/
├── client/                    # Angular 19 frontend (port 4200)
│   └── src/app/
│       ├── core/              # Auth, API, WebSocket, Theme, OTP services
│       ├── shared/            # Components, pipes, directives, dialogs
│       ├── models/            # TypeScript interfaces/enums (11 files)
│       ├── layout/            # App shell, sidebar, header (with user avatar)
│       └── features/          # Lazy-loaded features
│           ├── dashboard/     # Summary cards, top securities, recent orders, quick actions
│           ├── securities/    # List (table/search/filters), detail (candlestick chart, fundamentals)
│           ├── trading/       # Order form, order history, order detail page (timeline, fills, financials)
│           ├── portfolio/     # Summary, holdings table, P&L
│           ├── predictions/   # ML predictions grid, signals, risk metrics
│           ├── watchlist/     # CRUD, price alerts
│           ├── notifications/ # List, unread count, mark read
│           └── admin/         # User management, role/status actions
├── server/                    # FastAPI backend (port 9000)
│   └── app/
│       ├── models/            # 13 Beanie ODM documents
│       ├── auth/              # JWT auth + OTP verification
│       ├── securities/        # CRUD + price history
│       ├── trading/           # Orders (list, detail, create, cancel)
│       ├── portfolio/         # Holdings, transactions
│       ├── predictions/       # ML predictions
│       ├── watchlists/        # CRUD + securities
│       ├── notifications/     # List, mark read
│       ├── admin/             # User management
│       └── websocket/         # Connection manager, channels
├── server/scripts/            # seed_nasdaq.py (25 NASDAQ securities, 60 days data)
└── docker/                    # Docker Compose (MongoDB 7 + Mongo Express)
```

## Commands
- **Start both**: `cd /Users/ankkhand/Application/gloria-trade-angular && (cd server && source .venv/bin/activate && uvicorn app.main:app --reload --port 9000 &) && cd client && npx ng serve`
- **Start frontend only**: `cd client && npx ng serve`
- **Start backend only**: `cd server && source .venv/bin/activate && uvicorn app.main:app --reload --port 9000`
- **Build frontend**: `cd client && npx ng build`
- **Seed data**: `cd server && source .venv/bin/activate && python -m scripts.seed_nasdaq`

## Users
| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@gloriatrade.com | Admin@123 | Admin |
| Hulk | hulk@gloriatrade.com | admin | Admin |

## Database
- **MongoDB Atlas**: `tradingWarehouse` cluster
- **Database name**: `gloria_trade_angular`
- Local Docker URI preserved as comment in config.py for switching back

## Implementation Status
- [x] Phase 1: Scaffolding, core services (auth, API, theme), layout, auth pages, routing
- [x] Phase 2: Domain models (11 files), shared components/pipes/directives
- [x] Phase 3: Securities (paginated table, search, filters, candlestick chart, fundamentals, risk badge)
- [x] Phase 4: Portfolio (summary cards, portfolio grid, holdings table with P&L)
- [x] Phase 5: Trading (order form, order history, order detail page with timeline/fills/financials)
- [x] Phase 6: Predictions (ML grid, signal badges, risk metrics, price forecast)
- [x] Phase 7: Watchlist (CRUD, price alerts) + Notifications (list, unread count, mark read)
- [x] Phase 8: WebSocket (connection manager, channels, auto-reconnect, heartbeat)
- [x] Phase 9: Admin (user management table, role/status actions)
- [x] Phase 10: Dashboard (summary cards, top securities, recent orders, quick actions, responsive)
- [x] Enterprise theme: TradingView dark theme with CSS variables, responsive
- [x] Order detail: Full-page view with timeline, fill breakdown, financial summary
- [x] Seed data: 25 NASDAQ securities, 60 days price history, portfolios, orders, watchlists
- [x] OTP verification: Backend OTP service (generate, send, verify with TTL/max attempts) + frontend dialog with email/mobile choice, 6-digit code input, countdown timer, resend. Integrated into order cancel flow.

## Key Patterns
- Standalone components only (no NgModules)
- Angular Signals + services for state management
- CSS custom properties for theming (--gt-* variables)
- Lazy-loaded routes via loadChildren/loadComponent
- Functional HTTP interceptor with JWT token refresh queue
- TradingView color scheme: #131722 bg, #2962ff accent, #26a69a profit, #ef5350 loss
