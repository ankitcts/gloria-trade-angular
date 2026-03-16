import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UpperCasePipe } from '@angular/common';
import { TradingService } from './services/trading.service';
import { SecuritiesService } from '../securities/services/securities.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import {
  OrderType,
  OrderSide,
  OrderValidity,
  CreateOrderRequest,
} from '../../models/trading.model';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    UpperCasePipe,
    CurrencyFormatPipe,
    RelativeTimePipe,
  ],
  template: `
    <div class="trading-page">
      <h1 class="page-title">Trading</h1>

      <div class="trading-layout">
        <!-- Order Form -->
        <mat-card class="order-card">
          <mat-card-header>
            <mat-card-title>Place Order</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onSubmitOrder()" class="order-form">
              <!-- Buy/Sell Toggle -->
              <mat-button-toggle-group [(ngModel)]="orderSide" name="side" class="side-toggle">
                <mat-button-toggle value="buy" class="buy-toggle">Buy</mat-button-toggle>
                <mat-button-toggle value="sell" class="sell-toggle">Sell</mat-button-toggle>
              </mat-button-toggle-group>

              <!-- Security Search -->
              <mat-form-field appearance="outline">
                <mat-label>Security Symbol</mat-label>
                <input matInput [(ngModel)]="securitySymbol" name="symbol" placeholder="e.g. RELIANCE" required />
                <mat-icon matPrefix>search</mat-icon>
              </mat-form-field>

              <!-- Order Type -->
              <mat-form-field appearance="outline">
                <mat-label>Order Type</mat-label>
                <mat-select [(ngModel)]="orderType" name="orderType">
                  @for (type of orderTypes; track type.value) {
                    <mat-option [value]="type.value">{{ type.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Quantity -->
              <mat-form-field appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="quantity" name="quantity" min="1" required />
              </mat-form-field>

              <!-- Price (for limit/stop orders) -->
              @if (orderType !== 'market') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ orderType === 'stop_loss' || orderType === 'stop_limit' ? 'Stop Price' : 'Limit Price' }}</mat-label>
                  <input matInput type="number" [(ngModel)]="price" name="price" min="0.01" step="0.01" />
                </mat-form-field>
              }

              <!-- Validity -->
              <mat-form-field appearance="outline">
                <mat-label>Validity</mat-label>
                <mat-select [(ngModel)]="validity" name="validity">
                  @for (v of validityOptions; track v.value) {
                    <mat-option [value]="v.value">{{ v.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              @if (orderError()) {
                <div class="error-message">{{ orderError() }}</div>
              }

              <button mat-raised-button [color]="orderSide === 'buy' ? 'primary' : 'warn'"
                      type="submit" [disabled]="tradingService.submitting()" class="submit-btn">
                @if (tradingService.submitting()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order' }}
                }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Order History -->
        <mat-card class="history-card">
          <mat-card-header>
            <mat-card-title>Order History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (tradingService.loading()) {
              <div class="loading-container">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (tradingService.orders().length === 0) {
              <div class="empty-state">
                <mat-icon>receipt_long</mat-icon>
                <p>No orders yet</p>
              </div>
            } @else {
              <div class="orders-list">
                @for (order of tradingService.orders(); track order.id) {
                  <div class="order-item" (click)="onOrderClick(order.id)">
                    <div class="order-main">
                      <span class="order-side" [class.buy]="order.side === 'buy'" [class.sell]="order.side === 'sell'">
                        {{ order.side | uppercase }}
                      </span>
                      <span class="order-symbol">{{ order.symbol }}</span>
                      <span class="order-qty">{{ order.quantity }} qty</span>
                      <span class="order-type">{{ order.order_type | uppercase }}</span>
                    </div>
                    <div class="order-meta">
                      <span class="order-status" [class]="'status-' + order.status">{{ order.status }}</span>
                      <span class="order-time">{{ order.placed_at | relativeTime }}</span>
                      @if (order.status === 'pending' || order.status === 'open') {
                        <button mat-icon-button (click)="onCancelOrder(order.id)" class="cancel-btn">
                          <mat-icon>close</mat-icon>
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .trading-page { max-width: 1100px; }
    .page-title { font-size: 24px; font-weight: 600; margin-bottom: 20px; }
    .trading-layout { display: grid; grid-template-columns: 380px 1fr; gap: 16px; }
    .order-form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .side-toggle { width: 100%; margin-bottom: 8px; }
    .side-toggle mat-button-toggle { width: 50%; text-align: center; }
    .buy-toggle.mat-button-toggle-checked { background: rgba(102, 187, 106, 0.2); color: #66bb6a; }
    .sell-toggle.mat-button-toggle-checked { background: rgba(239, 83, 80, 0.2); color: #ef5350; }
    mat-form-field { width: 100%; }
    .submit-btn { height: 44px; font-size: 15px; font-weight: 600; margin-top: 8px; }
    .error-message { background: rgba(239, 83, 80, 0.12); color: #ef5350; padding: 10px; border-radius: 6px; font-size: 13px; }
    .loading-container { display: flex; justify-content: center; padding: 32px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: #8c8c8c; }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.3; margin-bottom: 8px; }
    .orders-list { display: flex; flex-direction: column; }
    .order-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--gt-border); cursor: pointer; }
    .order-item:hover { background: var(--gt-bg-hover); }
    .order-main { display: flex; align-items: center; gap: 12px; }
    .order-side { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .order-side.buy { background: rgba(102, 187, 106, 0.15); color: #66bb6a; }
    .order-side.sell { background: rgba(239, 83, 80, 0.15); color: #ef5350; }
    .order-symbol { font-weight: 600; color: #ffb300; }
    .order-qty { font-size: 13px; color: #8c8c8c; }
    .order-type { font-size: 11px; padding: 2px 6px; border-radius: 3px; background: rgba(255,255,255,0.06); color: #8c8c8c; }
    .order-meta { display: flex; align-items: center; gap: 12px; }
    .order-status { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 4px; text-transform: capitalize; }
    .status-pending { background: rgba(255, 167, 38, 0.12); color: #ffa726; }
    .status-open { background: rgba(66, 165, 245, 0.12); color: #42a5f5; }
    .status-filled { background: rgba(102, 187, 106, 0.12); color: #66bb6a; }
    .status-cancelled { background: rgba(140, 140, 140, 0.1); color: #8c8c8c; }
    .status-rejected { background: rgba(239, 83, 80, 0.12); color: #ef5350; }
    .status-partially_filled { background: rgba(66, 165, 245, 0.12); color: #42a5f5; }
    .order-time { font-size: 12px; color: #666; }
    .cancel-btn { color: #ef5350; }
  `],
})
export default class TradingComponent implements OnInit {
  readonly tradingService = inject(TradingService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  orderSide: string = 'buy';
  orderType: string = 'market';
  securitySymbol = '';
  quantity: number | null = null;
  price: number | null = null;
  validity = 'day';
  orderError = signal('');

  orderTypes = [
    { value: OrderType.MARKET, label: 'Market' },
    { value: OrderType.LIMIT, label: 'Limit' },
    { value: OrderType.STOP_LOSS, label: 'Stop Loss' },
    { value: OrderType.STOP_LIMIT, label: 'Stop Limit' },
  ];

  validityOptions = [
    { value: OrderValidity.DAY, label: 'Day' },
    { value: OrderValidity.GTC, label: 'Good Till Cancelled' },
    { value: OrderValidity.IOC, label: 'Immediate or Cancel' },
  ];

  ngOnInit(): void {
    this.tradingService.loadOrders();
  }

  onSubmitOrder(): void {
    if (!this.securitySymbol || !this.quantity) {
      this.orderError.set('Please fill in all required fields');
      return;
    }
    this.orderError.set('');

    const order: CreateOrderRequest = {
      security_id: this.securitySymbol, // In real app, resolve symbol to ID
      portfolio_id: 'default',
      side: this.orderSide as OrderSide,
      order_type: this.orderType as OrderType,
      quantity: this.quantity,
      validity: this.validity as OrderValidity,
    };

    if (this.orderType === 'limit' || this.orderType === 'stop_limit') {
      order.limit_price = this.price ?? undefined;
    }
    if (this.orderType === 'stop_loss' || this.orderType === 'stop_limit') {
      order.stop_price = this.price ?? undefined;
    }

    this.tradingService.placeOrder(order).subscribe({
      next: (res) => {
        this.snackBar.open(`Order placed: ${res.symbol} (${res.status})`, 'OK', { duration: 3000 });
        this.resetForm();
      },
      error: (err) => {
        this.orderError.set(err.error?.detail || 'Failed to place order');
      },
    });
  }

  onCancelOrder(orderId: string): void {
    this.tradingService.cancelOrder(orderId);
    this.snackBar.open('Order cancelled', 'OK', { duration: 2000 });
  }

  onOrderClick(orderId: string): void {
    this.router.navigate(['/trading/orders', orderId]);
  }

  private resetForm(): void {
    this.securitySymbol = '';
    this.quantity = null;
    this.price = null;
  }
}
