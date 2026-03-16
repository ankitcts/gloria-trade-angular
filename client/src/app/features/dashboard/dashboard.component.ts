import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from './services/dashboard.service';
import { WebSocketService } from '../../core/websocket/websocket.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { PriceChangeBadgeComponent } from '../../shared/components/price-change-badge/price-change-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    UpperCasePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyFormatPipe,
    RelativeTimePipe,
    PriceChangeBadgeComponent,
  ],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <div class="ws-status">
          <span class="ws-dot" [class.connected]="wsService.connected()"></span>
          {{ wsService.connected() ? 'Live' : 'Offline' }}
        </div>
      </div>

      @if (dashboardService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-cards">
          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon"><mat-icon>account_balance_wallet</mat-icon></div>
              <div class="card-info">
                <span class="card-label">Portfolio Value</span>
                <span class="card-value">{{ dashboardService.summary().portfolioValue | currencyFormat:'INR':true }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon" [class.profit]="dashboardService.summary().todaysPnl >= 0" [class.loss]="dashboardService.summary().todaysPnl < 0">
                <mat-icon>{{ dashboardService.summary().todaysPnl >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              </div>
              <div class="card-info">
                <span class="card-label">Unrealized P&L</span>
                <span class="card-value" [class.text-profit]="dashboardService.summary().todaysPnl > 0" [class.text-loss]="dashboardService.summary().todaysPnl < 0">
                  {{ dashboardService.summary().todaysPnl | currencyFormat }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon orders"><mat-icon>swap_horiz</mat-icon></div>
              <div class="card-info">
                <span class="card-label">Open Orders</span>
                <span class="card-value">{{ dashboardService.summary().openOrders }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="summary-card">
            <mat-card-content>
              <div class="card-icon alerts"><mat-icon>notifications_active</mat-icon></div>
              <div class="card-info">
                <span class="card-label">Watchlist Alerts</span>
                <span class="card-value">{{ dashboardService.summary().watchlistAlerts }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Grid -->
        <div class="dashboard-grid">
          <!-- Top Securities -->
          <mat-card class="securities-card">
            <mat-card-header>
              <mat-card-title>Top Securities</mat-card-title>
              <a mat-button routerLink="/securities" color="primary" class="view-all">View All</a>
            </mat-card-header>
            <mat-card-content>
              @if (dashboardService.topSecurities().length === 0) {
                <div class="empty-mini">
                  <mat-icon>trending_up</mat-icon>
                  <p>No securities data</p>
                </div>
              } @else {
                <div class="sec-list">
                  @for (sec of dashboardService.topSecurities(); track sec.id) {
                    <div class="sec-row" routerLink="/securities/{{ sec.id }}">
                      <div class="sec-info">
                        <span class="sec-symbol">{{ sec.symbol }}</span>
                        <span class="sec-name">{{ sec.name }}</span>
                      </div>
                      <div class="sec-price">
                        <span>{{ sec.last_price | currencyFormat }}</span>
                        @if (sec.change_pct != null) {
                          <app-price-change-badge [value]="sec.change_pct" />
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Recent Orders -->
          <mat-card class="orders-card">
            <mat-card-header>
              <mat-card-title>Recent Orders</mat-card-title>
              <a mat-button routerLink="/trading" color="primary" class="view-all">View All</a>
            </mat-card-header>
            <mat-card-content>
              @if (dashboardService.recentOrders().length === 0) {
                <div class="empty-mini">
                  <mat-icon>receipt_long</mat-icon>
                  <p>No recent orders</p>
                </div>
              } @else {
                <div class="order-list">
                  @for (order of dashboardService.recentOrders(); track order.id) {
                    <div class="order-row">
                      <span class="order-side" [class.buy]="order.side === 'buy'" [class.sell]="order.side === 'sell'">
                        {{ order.side | uppercase }}
                      </span>
                      <span class="order-symbol">{{ order.symbol }}</span>
                      <span class="order-qty">{{ order.quantity }} qty</span>
                      <span class="order-status" [class]="'status-' + order.status">{{ order.status }}</span>
                      <span class="order-time">{{ order.placed_at | relativeTime }}</span>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <mat-card class="action-card" routerLink="/trading">
            <mat-card-content>
              <mat-icon>swap_horiz</mat-icon>
              <span>Place Order</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" routerLink="/securities">
            <mat-card-content>
              <mat-icon>search</mat-icon>
              <span>Search Securities</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" routerLink="/portfolio">
            <mat-card-content>
              <mat-icon>account_balance_wallet</mat-icon>
              <span>Portfolio</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="action-card" routerLink="/predictions">
            <mat-card-content>
              <mat-icon>insights</mat-icon>
              <span>Predictions</span>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0; }
    .ws-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #8c8c8c; }
    .ws-dot { width: 8px; height: 8px; border-radius: 50%; background: #ef5350; }
    .ws-dot.connected { background: #66bb6a; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card mat-card-content { display: flex; align-items: center; gap: 16px; padding: 16px; }
    .card-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,179,0,0.12); display: flex; align-items: center; justify-content: center; }
    .card-icon mat-icon { color: #ffb300; }
    .card-icon.profit { background: rgba(102,187,106,0.12); }
    .card-icon.profit mat-icon { color: #66bb6a; }
    .card-icon.loss { background: rgba(239,83,80,0.12); }
    .card-icon.loss mat-icon { color: #ef5350; }
    .card-icon.orders { background: rgba(66,165,245,0.12); }
    .card-icon.orders mat-icon { color: #42a5f5; }
    .card-icon.alerts { background: rgba(171,71,188,0.12); }
    .card-icon.alerts mat-icon { color: #ab47bc; }
    .card-info { display: flex; flex-direction: column; }
    .card-label { font-size: 13px; color: #8c8c8c; }
    .card-value { font-size: 22px; font-weight: 600; }
    .text-profit { color: #66bb6a; }
    .text-loss { color: #ef5350; }
    .dashboard-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; margin-bottom: 24px; }
    .view-all { margin-left: auto; }
    .empty-mini { display: flex; flex-direction: column; align-items: center; padding: 32px; color: #8c8c8c; }
    .empty-mini mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.3; margin-bottom: 4px; }
    .sec-list { display: flex; flex-direction: column; }
    .sec-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); cursor: pointer; }
    .sec-row:hover { background: rgba(255,255,255,0.02); }
    .sec-info { display: flex; flex-direction: column; }
    .sec-symbol { font-weight: 600; color: #ffb300; font-size: 14px; }
    .sec-name { font-size: 11px; color: #8c8c8c; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sec-price { display: flex; align-items: center; gap: 8px; }
    .order-list { display: flex; flex-direction: column; }
    .order-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; }
    .order-side { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
    .order-side.buy { background: rgba(102,187,106,0.15); color: #66bb6a; }
    .order-side.sell { background: rgba(239,83,80,0.15); color: #ef5350; }
    .order-symbol { font-weight: 600; color: #ffb300; }
    .order-qty { color: #8c8c8c; }
    .order-status { font-size: 11px; padding: 2px 6px; border-radius: 3px; text-transform: capitalize; }
    .status-pending { background: rgba(255,167,38,0.12); color: #ffa726; }
    .status-open { background: rgba(66,165,245,0.12); color: #42a5f5; }
    .status-filled { background: rgba(102,187,106,0.12); color: #66bb6a; }
    .status-cancelled { background: rgba(140,140,140,0.1); color: #8c8c8c; }
    .order-time { margin-left: auto; font-size: 11px; color: #666; }
    .quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .action-card { cursor: pointer; transition: transform 0.15s; }
    .action-card:hover { transform: translateY(-2px); }
    .action-card mat-card-content { display: flex; align-items: center; gap: 12px; padding: 16px; }
    .action-card mat-icon { color: #ffb300; }

    @media (max-width: 768px) {
      .summary-cards { grid-template-columns: repeat(2, 1fr); }
      .dashboard-grid { grid-template-columns: 1fr; }
      .quick-actions { grid-template-columns: repeat(2, 1fr); }
    }
  `],
})
export default class DashboardComponent implements OnInit {
  readonly dashboardService = inject(DashboardService);
  readonly wsService = inject(WebSocketService);

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
    this.wsService.connect();
  }
}
