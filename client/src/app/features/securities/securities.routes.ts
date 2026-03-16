import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./securities-list/securities-list.component'),
  },
  {
    path: ':id',
    loadComponent: () => import('./security-detail/security-detail.component'),
  },
];

export default routes;
