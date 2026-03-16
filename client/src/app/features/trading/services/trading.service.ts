import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Order, CreateOrderRequest } from '../../../models/trading.model';
import { PaginatedResponse } from '../../../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TradingService {
  private readonly api = inject(ApiService);

  private readonly _orders = signal<Order[]>([]);
  private readonly _loading = signal(false);
  private readonly _totalOrders = signal(0);
  private readonly _submitting = signal(false);

  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalOrders = this._totalOrders.asReadonly();
  readonly submitting = this._submitting.asReadonly();

  loadOrders(page = 1, status?: string): void {
    this._loading.set(true);
    const params: Record<string, string | number> = { page, page_size: 20 };
    if (status) params['order_status'] = status;

    this.api.get<PaginatedResponse<Order>>(ENDPOINTS.TRADING.ORDERS, params).subscribe({
      next: (res) => {
        this._orders.set(res.items);
        this._totalOrders.set(res.total);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  placeOrder(order: CreateOrderRequest): Observable<{ id: string; status: string; symbol: string }> {
    this._submitting.set(true);
    return new Observable((observer) => {
      this.api.post<{ id: string; status: string; symbol: string }>(ENDPOINTS.TRADING.ORDERS, order).subscribe({
        next: (res) => {
          this._submitting.set(false);
          this.loadOrders();
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          this._submitting.set(false);
          observer.error(err);
        },
      });
    });
  }

  cancelOrder(orderId: string): void {
    this.api.post(ENDPOINTS.TRADING.CANCEL_ORDER(orderId)).subscribe({
      next: () => this.loadOrders(),
    });
  }
}
