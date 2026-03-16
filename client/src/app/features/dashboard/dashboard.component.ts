import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>

      <div class="summary-cards">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>account_balance_wallet</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Portfolio Value</span>
              <span class="card-value">--</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-icon profit"><mat-icon>trending_up</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Today's P&L</span>
              <span class="card-value">--</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>swap_horiz</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Open Orders</span>
              <span class="card-value">--</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card">
          <mat-card-content>
            <div class="card-icon"><mat-icon>notifications_active</mat-icon></div>
            <div class="card-info">
              <span class="card-label">Watchlist Alerts</span>
              <span class="card-value">--</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-grid">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Market Overview</mat-card-title>
          </mat-card-header>
          <mat-card-content class="placeholder-content">
            <mat-icon class="placeholder-icon">show_chart</mat-icon>
            <p>Market chart will be displayed here</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>Recent Orders</mat-card-title>
          </mat-card-header>
          <mat-card-content class="placeholder-content">
            <mat-icon class="placeholder-icon">receipt_long</mat-icon>
            <p>Recent orders will appear here</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .summary-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 179, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon mat-icon {
      color: #ffb300;
    }
    .card-icon.profit {
      background: rgba(102, 187, 106, 0.12);
    }
    .card-icon.profit mat-icon {
      color: #66bb6a;
    }
    .card-info {
      display: flex;
      flex-direction: column;
    }
    .card-label {
      font-size: 13px;
      color: #8c8c8c;
    }
    .card-value {
      font-size: 22px;
      font-weight: 600;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }
    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: #8c8c8c;
    }
    .placeholder-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.3;
    }
  `],
})
export default class DashboardComponent {}
