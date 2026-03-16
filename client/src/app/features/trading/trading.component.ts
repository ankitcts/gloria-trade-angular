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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UpperCasePipe } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { TradingService } from './services/trading.service';
import { SecuritiesService } from '../securities/services/securities.service';
import { PortfolioService } from '../portfolio/services/portfolio.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { SecuritySummary } from '../../models/security.model';
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
    FormsModule, MatCardModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonToggleModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatAutocompleteModule, UpperCasePipe, CurrencyFormatPipe, RelativeTimePipe,
  ],
  template: `
    <div class="trading-page">
      <h1 class="page-title">Trading</h1>
      <div class="trading-layout">
        <!-- Order Form -->
        <mat-card class="order-card">
          <mat-card-header><mat-card-title>Place Order</mat-card-title></mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="onSubmitOrder()" class="order-form">
              <mat-button-toggle-group [(ngModel)]="orderSide" name="side" class="side-toggle">
                <mat-button-toggle value="buy" class="buy-toggle">Buy</mat-button-toggle>
                <mat-button-toggle value="sell" class="sell-toggle">Sell</mat-button-toggle>
              </mat-button-toggle-group>

              <!-- Security Search with Autocomplete -->
              <mat-form-field appearance="outline">
                <mat-label>Search Security</mat-label>
                <input matInput [(ngModel)]="searchInput" name="symbol" placeholder="Type symbol or name..."
                       [matAutocomplete]="secAuto" (ngModelChange)="onSearchChange($event)" required />
                <mat-icon matPrefix>search</mat-icon>
                @if (selectedSecurity()) {
                  <mat-icon matSuffix class="check-icon">check_circle</mat-icon>
                }
                <mat-autocomplete #secAuto="matAutocomplete" (optionSelected)="onSecuritySelected($event.option.value)" [displayWith]="displaySecurity">
                  @for (sec of searchResults(); track sec.id) {
                    <mat-option [value]="sec">
                      <div class="sec-option">
                        <span class="sec-option-symbol">{{ sec.symbol }}</span>
                        <span class="sec-option-name">{{ sec.name }}</span>
                        @if (sec.last_price) {
                          <span class="sec-option-price">{{ sec.last_price | currencyFormat }}</span>
                        }
                      </div>
                    </mat-option>
                  }
                  @if (searching()) { <mat-option disabled><mat-spinner diameter="20"></mat-spinner> Searching...</mat-option> }
                  @if (!searching() && searchInput.length >= 1 && searchResults().length === 0 && !selectedSecurity()) {
                    <mat-option disabled>No securities found</mat-option>
                  }
                </mat-autocomplete>
              </mat-form-field>

              @if (selectedSecurity()) {
                <div class="selected-security">
                  <div class="sel-info">
                    <span class="sel-symbol">{{ selectedSecurity()!.symbol }}</span>
                    <span class="sel-name">{{ selectedSecurity()!.name }}</span>
                  </div>
                  @if (selectedSecurity()!.last_price) {
                    <span class="sel-price">{{ selectedSecurity()!.last_price | currencyFormat }}</span>
                  }
                  <button mat-icon-button (click)="clearSecurity()" type="button" class="sel-clear"><mat-icon>close</mat-icon></button>
                </div>
              }

              <mat-form-field appearance="outline">
                <mat-label>Order Type</mat-label>
                <mat-select [(ngModel)]="orderType" name="orderType">
                  @for (type of orderTypes; track type.value) { <mat-option [value]="type.value">{{ type.label }}</mat-option> }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="quantity" name="quantity" min="1" required />
              </mat-form-field>

              @if (orderType !== 'market') {
                <mat-form-field appearance="outline">
                  <mat-label>{{ orderType === 'stop_loss' || orderType === 'stop_limit' ? 'Stop Price' : 'Limit Price' }}</mat-label>
                  <input matInput type="number" [(ngModel)]="price" name="price" min="0.01" step="0.01" />
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Validity</mat-label>
                <mat-select [(ngModel)]="validity" name="validity">
                  @for (v of validityOptions; track v.value) { <mat-option [value]="v.value">{{ v.label }}</mat-option> }
                </mat-select>
              </mat-form-field>

              @if (selectedSecurity() && quantity) {
                <div class="order-preview">
                  <span>{{ orderSide | uppercase }} {{ quantity }} {{ selectedSecurity()!.symbol }}</span>
                  @if (orderType === 'market' && selectedSecurity()!.last_price) {
                    <span class="preview-est">Est. {{ (quantity * selectedSecurity()!.last_price!) | currencyFormat }}</span>
                  }
                </div>
              }

              @if (orderError()) { <div class="error-message">{{ orderError() }}</div> }

              <button mat-raised-button [color]="orderSide === 'buy' ? 'primary' : 'warn'" type="submit"
                      [disabled]="tradingService.submitting() || !selectedSecurity() || !quantity" class="submit-btn">
                @if (tradingService.submitting()) { <mat-spinner diameter="20"></mat-spinner> }
                @else { {{ orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order' }} }
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Order History -->
        <mat-card class="history-card">
          <mat-card-header><mat-card-title>Order History</mat-card-title></mat-card-header>
          <mat-card-content>
            @if (tradingService.loading()) {
              <div class="loading-container"><mat-spinner diameter="32"></mat-spinner></div>
            } @else if (tradingService.orders().length === 0) {
              <div class="empty-state"><mat-icon>receipt_long</mat-icon><p>No orders yet</p></div>
            } @else {
              <div class="orders-list">
                @for (order of tradingService.orders(); track order.id) {
                  <div class="order-item" (click)="onOrderClick(order.id)">
                    <div class="order-main">
                      <span class="order-side" [class.buy]="order.side === 'buy'" [class.sell]="order.side === 'sell'">{{ order.side | uppercase }}</span>
                      <div class="order-info">
                        <span class="order-symbol">{{ order.symbol }}</span>
                        <span class="order-detail-text">{{ order.quantity }} qty &middot; {{ order.order_type | uppercase }}</span>
                      </div>
                    </div>
                    <div class="order-meta">
                      @if (order.avg_fill_price) { <span class="order-fill-price">{{ order.avg_fill_price | currencyFormat }}</span> }
                      <span class="order-status" [class]="'status-' + order.status">{{ order.status }}</span>
                      <span class="order-time">{{ order.placed_at | relativeTime }}</span>
                      <mat-icon class="order-arrow">chevron_right</mat-icon>
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
    .trading-layout { display: grid; grid-template-columns: 400px 1fr; gap: 16px; }
    .order-form { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
    .side-toggle { width: 100%; margin-bottom: 8px; }
    .side-toggle mat-button-toggle { width: 50%; text-align: center; }
    .buy-toggle.mat-button-toggle-checked { background: var(--gt-badge-buy); color: var(--gt-badge-buy-text); }
    .sell-toggle.mat-button-toggle-checked { background: var(--gt-badge-sell); color: var(--gt-badge-sell-text); }
    mat-form-field { width: 100%; }
    .check-icon { color: var(--gt-profit); }
    .sec-option { display: flex; align-items: center; gap: 8px; width: 100%; }
    .sec-option-symbol { font-weight: 600; color: var(--gt-primary); min-width: 60px; }
    .sec-option-name { flex: 1; font-size: 13px; color: var(--gt-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sec-option-price { font-size: 13px; font-weight: 500; }
    .selected-security { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 6px; background: rgba(41, 98, 255, 0.06); border: 1px solid rgba(41, 98, 255, 0.2); }
    .sel-info { flex: 1; display: flex; flex-direction: column; }
    .sel-symbol { font-weight: 600; color: var(--gt-primary); font-size: 14px; }
    .sel-name { font-size: 12px; color: var(--gt-text-secondary); }
    .sel-price { font-size: 15px; font-weight: 600; }
    .sel-clear { color: var(--gt-text-muted); }
    .order-preview { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 6px; background: var(--gt-bg-hover); font-size: 13px; font-weight: 500; }
    .preview-est { color: var(--gt-text-secondary); }
    .submit-btn { height: 44px; font-size: 15px; font-weight: 600; margin-top: 8px; }
    .error-message { background: var(--gt-loss-bg); color: var(--gt-loss); padding: 10px; border-radius: 6px; font-size: 13px; }
    .loading-container { display: flex; justify-content: center; padding: 32px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: var(--gt-text-muted); }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.3; margin-bottom: 8px; }
    .orders-list { display: flex; flex-direction: column; }
    .order-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 8px; border-bottom: 1px solid var(--gt-border); cursor: pointer; border-radius: 4px; }
    .order-item:hover { background: var(--gt-bg-hover); }
    .order-main { display: flex; align-items: center; gap: 12px; }
    .order-side { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 4px; min-width: 32px; text-align: center; }
    .order-side.buy { background: var(--gt-badge-buy); color: var(--gt-badge-buy-text); }
    .order-side.sell { background: var(--gt-badge-sell); color: var(--gt-badge-sell-text); }
    .order-info { display: flex; flex-direction: column; }
    .order-symbol { font-weight: 600; color: var(--gt-primary); font-size: 14px; }
    .order-detail-text { font-size: 12px; color: var(--gt-text-secondary); }
    .order-meta { display: flex; align-items: center; gap: 10px; }
    .order-fill-price { font-size: 13px; font-weight: 500; }
    .order-status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: capitalize; }
    .status-pending { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
    .status-open { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
    .status-filled { background: var(--gt-profit-bg); color: var(--gt-profit); }
    .status-cancelled { background: rgba(120, 123, 134, 0.12); color: #787b86; }
    .status-rejected { background: var(--gt-loss-bg); color: var(--gt-loss); }
    .order-time { font-size: 11px; color: var(--gt-text-muted); }
    .order-arrow { font-size: 18px; width: 18px; height: 18px; color: var(--gt-text-muted); }
  `],
})
export default class TradingComponent implements OnInit {
  readonly tradingService = inject(TradingService);
  private readonly securitiesService = inject(SecuritiesService);
  private readonly portfolioService = inject(PortfolioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  orderSide = 'buy';
  orderType = 'market';
  searchInput = '';
  quantity: number | null = null;
  price: number | null = null;
  validity = 'day';

  selectedSecurity = signal<SecuritySummary | null>(null);
  searchResults = signal<SecuritySummary[]>([]);
  searching = signal(false);
  orderError = signal('');
  private searchSubject = new Subject<string>();

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
    this.portfolioService.loadPortfolios();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (q.length < 1) { this.searchResults.set([]); this.searching.set(false); return of([]); }
        this.searching.set(true);
        return this.securitiesService.searchSecurities(q).pipe(
          catchError(() => { this.searching.set(false); return of([]); })
        );
      })
    ).subscribe((results) => { this.searchResults.set(results as SecuritySummary[]); this.searching.set(false); });
  }

  onSearchChange(value: unknown): void {
    // Only trigger search for string input, not when autocomplete sets the object
    if (typeof value === 'string') {
      this.selectedSecurity.set(null);
      this.searchSubject.next(value);
    }
  }
  onSecuritySelected(sec: SecuritySummary): void { this.selectedSecurity.set(sec); this.searchResults.set([]); }
  clearSecurity(): void { this.selectedSecurity.set(null); this.searchInput = ''; this.searchResults.set([]); }
  displaySecurity = (sec: SecuritySummary | string): string => {
    if (!sec) return '';
    return typeof sec === 'string' ? sec : sec.symbol;
  };

  onSubmitOrder(): void {
    const sec = this.selectedSecurity();
    if (!sec || !this.quantity) { this.orderError.set('Please select a security and enter quantity'); return; }
    this.orderError.set('');
    const portfolios = this.portfolioService.portfolios();
    const defaultPortfolio = portfolios.find((p) => p.is_default) || portfolios[0];
    const order: CreateOrderRequest = {
      security_id: sec.id,
      portfolio_id: defaultPortfolio?.id || 'default',
      side: this.orderSide as OrderSide,
      order_type: this.orderType as OrderType,
      quantity: this.quantity,
      validity: this.validity as OrderValidity,
    };
    if (this.orderType === 'limit' || this.orderType === 'stop_limit') order.limit_price = this.price ?? undefined;
    if (this.orderType === 'stop_loss' || this.orderType === 'stop_limit') order.stop_price = this.price ?? undefined;

    this.tradingService.placeOrder(order).subscribe({
      next: (res) => { this.snackBar.open(`Order placed: ${res.symbol} (${res.status})`, 'OK', { duration: 3000 }); this.resetForm(); },
      error: (err) => { this.orderError.set(err.error?.detail || 'Failed to place order'); },
    });
  }

  onCancelOrder(orderId: string): void { this.tradingService.cancelOrder(orderId); this.snackBar.open('Order cancelled', 'OK', { duration: 2000 }); }
  onOrderClick(orderId: string): void { this.router.navigate(['/trading/orders', orderId]); }
  private resetForm(): void { this.selectedSecurity.set(null); this.searchInput = ''; this.quantity = null; this.price = null; }
}
