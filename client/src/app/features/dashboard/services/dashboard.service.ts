import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface DashboardSummary {
  portfolioValue: number;
  todaysPnl: number;
  openOrders: number;
  watchlistAlerts: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  private readonly _summary = signal<DashboardSummary>({
    portfolioValue: 0,
    todaysPnl: 0,
    openOrders: 0,
    watchlistAlerts: 0,
  });
  private readonly _recentOrders = signal<any[]>([]);
  private readonly _topSecurities = signal<any[]>([]);
  private readonly _loading = signal(false);

  readonly summary = this._summary.asReadonly();
  readonly recentOrders = this._recentOrders.asReadonly();
  readonly topSecurities = this._topSecurities.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadDashboard(): void {
    this._loading.set(true);

    forkJoin({
      portfolios: this.api.get<any[]>(ENDPOINTS.PORTFOLIO.LIST),
      orders: this.api.get<any>(ENDPOINTS.TRADING.ORDERS, { page: 1, page_size: 5 }),
      securities: this.api.get<any>(ENDPOINTS.SECURITIES.LIST, { page: 1, page_size: 10 }),
    }).subscribe({
      next: ({ portfolios, orders, securities }) => {
        const totalValue = (portfolios || []).reduce((s: number, p: any) => s + (p.total_current_value || 0), 0);
        const totalPnl = (portfolios || []).reduce((s: number, p: any) => s + (p.total_unrealized_pnl || 0), 0);
        const openCount = (orders?.items || []).filter((o: any) => o.status === 'pending' || o.status === 'open').length;

        this._summary.set({
          portfolioValue: totalValue,
          todaysPnl: totalPnl,
          openOrders: openCount,
          watchlistAlerts: 0,
        });

        this._recentOrders.set(orders?.items || []);
        this._topSecurities.set(securities?.items || []);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }
}
