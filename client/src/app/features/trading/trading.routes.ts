import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./trading.component'),
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./order-detail/order-detail.component'),
  },
];

export default routes;
