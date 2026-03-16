import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TradingService } from '../services/trading.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Order } from '../../../models/trading.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    UpperCasePipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    CurrencyFormatPipe,
  ],
  template: `
    @if (tradingService.loading() && !o()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (o()) {
      <div class="order-detail-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/trading" class="breadcrumb-link">
            <mat-icon>arrow_back</mat-icon>
            Orders
          </a>
          <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
          <span>Order Detail</span>
        </div>

        <!-- Order Header -->
        <div class="order-header">
          <div class="header-left">
            <div class="order-id-row">
              <h1 class="order-id">{{ o()!.symbol }}</h1>
              <span class="side-badge" [class]="o()!.side">{{ o()!.side | uppercase }}</span>
              <span class="status-badge" [class]="'status-' + o()!.status">{{ formatStatus(o()!.status) }}</span>
            </div>
            @if (o()!.security_name) {
              <p class="security-name">{{ o()!.security_name }}</p>
            }
            <p class="order-meta-line">
              {{ o()!.order_type | uppercase }} order
              &middot; {{ o()!.quantity }} shares
              &middot; {{ o()!.exchange_code }}
              &middot; {{ o()!.validity | uppercase }}
            </p>
          </div>
          <div class="header-right">
            @if (o()!.status === 'pending' || o()!.status === 'open') {
              <button mat-raised-button color="warn" (click)="onCancel()">
                <mat-icon>cancel</mat-icon>
                Cancel Order
              </button>
            }
          </div>
        </div>

        <div class="detail-grid">
          <!-- Left Column -->
          <div class="detail-left">
            <!-- Order Summary Card -->
            <mat-card class="summary-card">
              <mat-card-header>
                <mat-card-title>Order Summary</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="summary-grid">
                  <div class="summary-item">
                    <span class="item-label">Order Type</span>
                    <span class="item-value">{{ o()!.order_type | uppercase }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="item-label">Side</span>
                    <span class="item-value side-text" [class]="o()!.side">{{ o()!.side | uppercase }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="item-label">Quantity</span>
                    <span class="item-value">{{ o()!.quantity }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="item-label">Filled Qty</span>
                    <span class="item-value">{{ o()!.filled_quantity }}</span>
                  </div>
                  @if (o()!.limit_price) {
                    <div class="summary-item">
                      <span class="item-label">Limit Price</span>
                      <span class="item-value">{{ o()!.limit_price | currencyFormat:o()!.currency }}</span>
                    </div>
                  }
                  @if (o()!.stop_price) {
                    <div class="summary-item">
                      <span class="item-label">Stop Price</span>
                      <span class="item-value">{{ o()!.stop_price | currencyFormat:o()!.currency }}</span>
                    </div>
                  }
                  @if (o()!.avg_fill_price) {
                    <div class="summary-item highlight">
                      <span class="item-label">Avg Fill Price</span>
                      <span class="item-value">{{ o()!.avg_fill_price | currencyFormat:o()!.currency }}</span>
                    </div>
                  }
                  <div class="summary-item">
                    <span class="item-label">Validity</span>
                    <span class="item-value">{{ o()!.validity | uppercase }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Financial Summary -->
            <mat-card class="financial-card">
              <mat-card-header>
                <mat-card-title>Financial Details</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="financial-rows">
                  <div class="fin-row">
                    <span>Total Amount</span>
                    <span class="fin-value">{{ o()!.total_amount | currencyFormat:o()!.currency }}</span>
                  </div>
                  <div class="fin-row">
                    <span>Fees</span>
                    <span class="fin-value">{{ o()!.total_fees | currencyFormat:o()!.currency }}</span>
                  </div>
                  <div class="fin-row">
                    <span>Taxes</span>
                    <span class="fin-value">{{ o()!.total_taxes | currencyFormat:o()!.currency }}</span>
                  </div>
                  <mat-divider></mat-divider>
                  <div class="fin-row total">
                    <span>Net Total</span>
                    <span class="fin-value">{{ netTotal() | currencyFormat:o()!.currency }}</span>
                  </div>
                  @if (o()!.realized_pnl != null) {
                    <div class="fin-row">
                      <span>Realized P&L</span>
                      <span class="fin-value" [class.text-profit]="o()!.realized_pnl! > 0" [class.text-loss]="o()!.realized_pnl! < 0">
                        {{ o()!.realized_pnl | currencyFormat:o()!.currency }}
                      </span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Fill Breakdown -->
            @if (o()!.fills && o()!.fills.length > 0) {
              <mat-card class="fills-card">
                <mat-card-header>
                  <mat-card-title>Fill Breakdown</mat-card-title>
                  <mat-card-subtitle>{{ o()!.fills.length }} fill(s)</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <table mat-table [dataSource]="o()!.fills" class="fills-table">
                    <ng-container matColumnDef="fill_id">
                      <th mat-header-cell *matHeaderCellDef>Fill #</th>
                      <td mat-cell *matCellDef="let fill; let i = index">{{ i + 1 }}</td>
                    </ng-container>
                    <ng-container matColumnDef="quantity">
                      <th mat-header-cell *matHeaderCellDef>Quantity</th>
                      <td mat-cell *matCellDef="let fill">{{ fill.quantity }}</td>
                    </ng-container>
                    <ng-container matColumnDef="price">
                      <th mat-header-cell *matHeaderCellDef>Price</th>
                      <td mat-cell *matCellDef="let fill">{{ fill.price | currencyFormat:o()!.currency }}</td>
                    </ng-container>
                    <ng-container matColumnDef="value">
                      <th mat-header-cell *matHeaderCellDef>Value</th>
                      <td mat-cell *matCellDef="let fill">{{ fill.quantity * fill.price | currencyFormat:o()!.currency }}</td>
                    </ng-container>
                    <ng-container matColumnDef="fees">
                      <th mat-header-cell *matHeaderCellDef>Fees</th>
                      <td mat-cell *matCellDef="let fill">{{ fill.fees | currencyFormat:o()!.currency }}</td>
                    </ng-container>
                    <ng-container matColumnDef="filled_at">
                      <th mat-header-cell *matHeaderCellDef>Time</th>
                      <td mat-cell *matCellDef="let fill">{{ fill.filled_at | date:'short' }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="fillColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: fillColumns;"></tr>
                  </table>
                </mat-card-content>
              </mat-card>
            }
          </div>

          <!-- Right Column - Timeline & Info -->
          <div class="detail-right">
            <!-- Order Timeline -->
            <mat-card class="timeline-card">
              <mat-card-header>
                <mat-card-title>Timeline</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="timeline">
                  <div class="timeline-item completed">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <span class="timeline-label">Order Placed</span>
                      <span class="timeline-time">{{ o()!.placed_at | date:'medium' }}</span>
                    </div>
                  </div>

                  @if (o()!.status === 'filled' || o()!.status === 'partially_filled') {
                    <div class="timeline-item completed">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-label">Order Accepted</span>
                        <span class="timeline-time">{{ o()!.placed_at | date:'medium' }}</span>
                      </div>
                    </div>
                  }

                  @if (o()!.executed_at) {
                    <div class="timeline-item completed success">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-label">{{ o()!.status === 'filled' ? 'Fully Filled' : 'Partially Filled' }}</span>
                        <span class="timeline-time">{{ o()!.executed_at | date:'medium' }}</span>
                        @if (o()!.avg_fill_price) {
                          <span class="timeline-detail">Avg price: {{ o()!.avg_fill_price | currencyFormat:o()!.currency }}</span>
                        }
                      </div>
                    </div>
                  }

                  @if (o()!.cancelled_at) {
                    <div class="timeline-item completed error">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-label">Cancelled</span>
                        <span class="timeline-time">{{ o()!.cancelled_at | date:'medium' }}</span>
                      </div>
                    </div>
                  }

                  @if (o()!.status === 'pending' || o()!.status === 'open') {
                    <div class="timeline-item pending">
                      <div class="timeline-dot"></div>
                      <div class="timeline-content">
                        <span class="timeline-label">{{ o()!.status === 'pending' ? 'Awaiting Execution' : 'Open - Waiting for Fill' }}</span>
                      </div>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Order Info -->
            <mat-card class="info-card">
              <mat-card-header>
                <mat-card-title>Order Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="info-rows">
                  <div class="info-row">
                    <span class="info-label">Order ID</span>
                    <span class="info-value mono">{{ o()!.id }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Portfolio</span>
                    <span class="info-value">{{ o()!.portfolio_id }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Exchange</span>
                    <span class="info-value">{{ o()!.exchange_code }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Currency</span>
                    <span class="info-value">{{ o()!.currency }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Simulated</span>
                    <span class="info-value">{{ o()!.is_simulated ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Created</span>
                    <span class="info-value">{{ o()!.created_at | date:'medium' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Updated</span>
                    <span class="info-value">{{ o()!.updated_at | date:'medium' }}</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <mat-icon>error_outline</mat-icon>
        <p>Order not found</p>
        <a mat-button routerLink="/trading" color="primary">Back to Trading</a>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .order-detail-page { max-width: 1100px; }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 4px; margin-bottom: 20px; font-size: 13px; color: var(--gt-text-secondary); }
    .breadcrumb-link { display: flex; align-items: center; gap: 4px; color: var(--gt-primary); text-decoration: none; cursor: pointer; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .breadcrumb-sep { font-size: 16px; width: 16px; height: 16px; }

    /* Header */
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .order-id-row { display: flex; align-items: center; gap: 12px; }
    .order-id { font-size: 28px; font-weight: 700; color: var(--gt-text-primary); margin: 0; }
    .side-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; }
    .side-badge.buy { background: var(--gt-badge-buy); color: var(--gt-badge-buy-text); }
    .side-badge.sell { background: var(--gt-badge-sell); color: var(--gt-badge-sell-text); }
    .status-badge { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 4px; text-transform: capitalize; }
    .status-pending { background: rgba(255, 152, 0, 0.12); color: #ff9800; }
    .status-open { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
    .status-filled { background: var(--gt-profit-bg); color: var(--gt-profit); }
    .status-cancelled { background: rgba(120, 123, 134, 0.12); color: #787b86; }
    .status-rejected { background: var(--gt-loss-bg); color: var(--gt-loss); }
    .status-partially_filled { background: rgba(33, 150, 243, 0.12); color: #2196f3; }
    .security-name { color: var(--gt-text-secondary); margin: 4px 0 0; font-size: 14px; }
    .order-meta-line { color: var(--gt-text-muted); font-size: 13px; margin: 4px 0 0; }

    /* Grid Layout */
    .detail-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }
    .detail-left, .detail-right { display: flex; flex-direction: column; gap: 16px; }

    /* Summary Card */
    .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 8px; }
    .summary-item { display: flex; flex-direction: column; gap: 4px; }
    .summary-item.highlight { background: rgba(41, 98, 255, 0.06); padding: 10px; border-radius: 6px; border-left: 3px solid var(--gt-primary); }
    .item-label { font-size: 12px; color: var(--gt-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .item-value { font-size: 15px; font-weight: 600; color: var(--gt-text-primary); }
    .side-text.buy { color: var(--gt-profit); }
    .side-text.sell { color: var(--gt-loss); }

    /* Financial */
    .financial-rows { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .fin-row { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
    .fin-row span:first-child { color: var(--gt-text-secondary); }
    .fin-value { font-weight: 500; color: var(--gt-text-primary); }
    .fin-row.total { padding-top: 10px; }
    .fin-row.total span:first-child { font-weight: 600; color: var(--gt-text-primary); }
    .fin-row.total .fin-value { font-size: 18px; font-weight: 700; color: var(--gt-primary); }

    /* Fills Table */
    .fills-table { width: 100%; }

    /* Timeline */
    .timeline { display: flex; flex-direction: column; gap: 0; margin-top: 8px; }
    .timeline-item { display: flex; gap: 12px; padding: 12px 0; position: relative; }
    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 7px;
      top: 32px;
      bottom: -4px;
      width: 2px;
      background: var(--gt-border-strong);
    }
    .timeline-dot {
      width: 16px; height: 16px; border-radius: 50%;
      background: var(--gt-primary);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .timeline-item.success .timeline-dot { background: var(--gt-profit); }
    .timeline-item.error .timeline-dot { background: var(--gt-loss); }
    .timeline-item.pending .timeline-dot {
      background: transparent;
      border: 2px solid var(--gt-status-pending);
    }
    .timeline-content { display: flex; flex-direction: column; gap: 2px; }
    .timeline-label { font-size: 13px; font-weight: 500; color: var(--gt-text-primary); }
    .timeline-time { font-size: 12px; color: var(--gt-text-secondary); }
    .timeline-detail { font-size: 12px; color: var(--gt-primary); font-weight: 500; }

    /* Info Card */
    .info-rows { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; }
    .info-label { color: var(--gt-text-secondary); }
    .info-value { color: var(--gt-text-primary); font-weight: 500; }
    .info-value.mono { font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 11px; word-break: break-all; max-width: 200px; text-align: right; }

    /* Empty State */
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px; color: var(--gt-text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }

    .text-profit { color: var(--gt-profit) !important; }
    .text-loss { color: var(--gt-loss) !important; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `],
})
export default class OrderDetailComponent implements OnInit, OnDestroy {
  readonly tradingService = inject(TradingService);
  private readonly route = inject(ActivatedRoute);
  readonly o = this.tradingService.selectedOrder;

  fillColumns = ['fill_id', 'quantity', 'price', 'value', 'fees', 'filled_at'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tradingService.loadOrderDetail(id);
    }
  }

  ngOnDestroy(): void {
    this.tradingService.clearSelection();
  }

  netTotal(): number {
    const o = this.o();
    if (!o) return 0;
    return (o.total_amount || 0) + o.total_fees + o.total_taxes;
  }

  formatStatus(status: string): string {
    return status.replace(/_/g, ' ');
  }

  onCancel(): void {
    const o = this.o();
    if (o) {
      this.tradingService.cancelOrder(o.id);
    }
  }
}
