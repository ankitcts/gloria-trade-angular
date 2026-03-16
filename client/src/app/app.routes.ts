import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component'),
      },
      {
        path: 'securities',
        loadChildren: () => import('./features/securities/securities.routes'),
      },
      {
        path: 'trading',
        loadChildren: () => import('./features/trading/trading.routes'),
      },
      {
        path: 'portfolio',
        loadChildren: () => import('./features/portfolio/portfolio.routes'),
      },
      {
        path: 'predictions',
        loadChildren: () => import('./features/predictions/predictions.routes'),
      },
      {
        path: 'watchlist',
        loadChildren: () => import('./features/watchlist/watchlist.routes'),
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes'),
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes'),
        canActivate: [adminGuard],
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component'),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
