# Gloria Trade Angular - Trading Platform

## Project Overview
Full-stack AI-powered trading platform built with Angular 19 + FastAPI + MongoDB.

## Tech Stack
- **Frontend**: Angular 19 (standalone components, signals), Angular Material, Lightweight Charts, Chart.js
- **Backend**: FastAPI (Python 3.12+), Beanie ODM, MongoDB 7
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: WebSocket
- **Containerization**: Docker Compose

## Project Structure
```
gloria-trade-angular/
├── client/          # Angular 19 frontend (port 4200)
│   └── src/app/
│       ├── core/       # Auth, API, WebSocket, Theme services
│       ├── shared/     # Reusable components, pipes, directives
│       ├── models/     # TypeScript interfaces/enums
│       ├── layout/     # App shell, sidebar, header
│       └── features/   # Lazy-loaded features (dashboard, securities, trading, etc.)
├── server/          # FastAPI backend (port 9000)
│   └── app/
│       ├── models/     # Beanie ODM documents
│       ├── auth/       # JWT authentication
│       ├── securities/ # Securities CRUD + analysis
│       ├── trading/    # Orders + simulation
│       ├── portfolio/  # Portfolio management
│       ├── predictions/# ML models
│       └── ...
└── docker/          # Docker Compose configs
```

## Commands
- **Start frontend**: `cd client && ng serve`
- **Start backend**: `cd server && uvicorn app.main:app --reload --port 9000`
- **Build frontend**: `cd client && ng build`

## Implementation Status
- [x] Phase 1: Project scaffolding (Angular 19 + Angular Material + charts)
- [x] Phase 1: Core services (auth state/service/guard/interceptor, API service, theme service)
- [x] Phase 1: Layout (app-shell with sidenav, sidebar nav, header with user menu)
- [x] Phase 1: Auth pages (login, register)
- [x] Phase 1: Lazy-loaded routing for all features
- [x] Phase 2: Domain models (11 model files - user, auth, security, trading, portfolio, prediction, sentiment, market, watchlist, notification)
- [x] Phase 2: Dashboard placeholder with summary cards
- [x] Phase 2: Shared components (loading-spinner, price-change-badge, currency-format pipe, relative-time pipe, role directive)
- [x] Backend: FastAPI server with 8 routers (auth, securities, orders, portfolios, predictions, watchlists, notifications, admin)
- [x] Backend: 13 Beanie ODM models, JWT auth, Docker Compose (MongoDB 7 + Mongo Express)
- [x] Phase 3: Securities feature (list with table/search/filters, detail with candlestick chart, fundamentals, risk badge)
- [x] Phase 4: Portfolio feature (summary cards, portfolio cards grid, holdings table with P&L)
- [x] Phase 5: Trading feature (order form with buy/sell, order types, order history with cancel)
- [x] Phase 6: Predictions (ML predictions grid, signal badges, risk metrics, price forecast)
- [x] Phase 7: Watchlist (CRUD, securities list, price alerts) + Notifications (list, unread count, mark read)
- [x] Phase 9: Admin panel (user management table, role/status actions)
- [x] Phase 8: WebSocket integration (connection manager, channel subscriptions, auto-reconnect, heartbeat)
- [x] Phase 10: Dashboard (summary cards, top securities, recent orders, quick actions, responsive, WS status indicator)

## Key Patterns
- Standalone components only (no NgModules)
- Angular Signals + services for state management
- Lazy-loaded routes via loadChildren/loadComponent
- Functional HTTP interceptor with JWT token refresh queue
- Functional route guards
- OnPush change detection
- Custom Angular Material theme: dark mode with gold primary (#ffb300)

## Reference Files (from existing gloria-trade)
- Schema design: `/Users/ankkhand/Application/gloria-trade/docs/SCHEMA_DESIGN.md`
- Backend auth: `/Users/ankkhand/Application/gloria-trade/server/app/auth/service.py`
- API endpoints: `/Users/ankkhand/Application/gloria-trade/client/src/api/endpoints.ts`
- Domain models: `/Users/ankkhand/Application/gloria-trade/server/app/models/`
