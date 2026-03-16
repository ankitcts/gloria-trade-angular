import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./portfolio.component'),
  },
  {
    path: ':id',
    loadComponent: () => import('./portfolio-detail/portfolio-detail.component'),
  },
];

export default routes;
