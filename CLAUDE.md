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
- [ ] Phase 2: Shared components (loading-spinner, price-change-badge, data-table, search-bar)
- [ ] Phase 2: Shared pipes and directives
- [x] Phase 2: Shared components (loading-spinner, price-change-badge)
- [x] Phase 2: Shared pipes (currency-format, relative-time) and directives (role)
- [x] Backend: FastAPI server with all routers (auth, securities, trading, portfolio, predictions, watchlists, notifications, admin)
- [x] Backend: 13 Beanie ODM models (user, session, security, price history, order, portfolio, watchlist, ML model, prediction, sentiment, market, notification)
- [x] Backend: JWT auth (register, login, refresh, logout, session management)
- [x] Backend: Docker Compose (MongoDB 7 + Mongo Express)
- [ ] Phase 3: Securities feature
- [ ] Phase 4: Portfolio feature
- [ ] Phase 5: Trading feature
- [ ] Phase 6: Predictions + analytics
- [ ] Phase 7: Watchlist + notifications
- [ ] Phase 8: WebSocket integration
- [ ] Phase 9: Admin panel
- [ ] Phase 10: Dashboard + polish

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
