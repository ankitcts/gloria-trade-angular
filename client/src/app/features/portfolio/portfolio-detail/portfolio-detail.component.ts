import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { PortfolioService } from '../services/portfolio.service';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { PriceChangeBadgeComponent } from '../../../shared/components/price-change-badge/price-change-badge.component';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [
    RouterLink, DecimalPipe, DatePipe,
    MatCardModule, MatIconModule, MatButtonModule, MatTableModule,
    MatTabsModule, MatProgressSpinnerModule, MatDividerModule,
    CurrencyFormatPipe, PriceChangeBadgeComponent,
  ],
  template: `
    @if (portfolioService.loading() && !p()) {
      <div class="loading-container"><mat-spinner diameter="40"></mat-spinner></div>
    } @else if (p()) {
      <div class="detail-page">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a routerLink="/portfolio" class="breadcrumb-link"><mat-icon>arrow_back</mat-icon> Portfolios</a>
          <mat-icon class="breadcrumb-sep">chevron_right</mat-icon>
          <span>{{ p()!.name }}</span>
        </div>

        <!-- Header -->
        <div class="portfolio-header">
          <div class="header-left">
            <h1 class="portfolio-name">
              {{ p()!.name }}
              @if (p()!.is_default) { <span class="default-badge">Default</span> }
            </h1>
            @if (p()!.description) { <p class="portfolio-desc">{{ p()!.description }}</p> }
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="sum-label">Total Invested</span>
              <span class="sum-value">{{ p()!.total_invested | currencyFormat:p()!.currency }}</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="sum-label">Current Value</span>
              <span class="sum-value">{{ p()!.total_current_value | currencyFormat:p()!.currency }}</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="sum-label">Unrealized P&L</span>
              <span class="sum-value" [class.text-profit]="p()!.total_unrealized_pnl > 0"
                    [class.text-loss]="p()!.total_unrealized_pnl < 0">
                {{ p()!.total_unrealized_pnl | currencyFormat:p()!.currency }}
              </span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="sum-label">Realized P&L</span>
              <span class="sum-value" [class.text-profit]="p()!.total_realized_pnl > 0"
                    [class.text-loss]="p()!.total_realized_pnl < 0">
                {{ p()!.total_realized_pnl | currencyFormat:p()!.currency }}
              </span>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Tabs: Holdings / Transactions -->
        <mat-tab-group animationDuration="200ms">
          <!-- Holdings Tab -->
          <mat-tab label="Holdings ({{ p()!.holdings?.length || 0 }})">
            <div class="tab-content">
              @if (!p()!.holdings || p()!.holdings.length === 0) {
                <div class="empty-mini"><mat-icon>inventory_2</mat-icon><p>No holdings</p></div>
              } @else {
                <table mat-table [dataSource]="p()!.holdings" class="holdings-table">
                  <ng-container matColumnDef="symbol">
                    <th mat-header-cell *matHeaderCellDef>Security</th>
                    <td mat-cell *matCellDef="let h">
                      <div class="holding-cell">
                        <span class="h-symbol">{{ h.symbol }}</span>
                        @if (h.security_name) { <span class="h-name">{{ h.security_name }}</span> }
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef class="right">Qty</th>
                    <td mat-cell *matCellDef="let h" class="right">{{ h.quantity }}</td>
                  </ng-container>
                  <ng-container matColumnDef="avg_cost">
                    <th mat-header-cell *matHeaderCellDef class="right">Avg Cost</th>
                    <td mat-cell *matCellDef="let h" class="right">{{ h.avg_cost_price | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="current_price">
                    <th mat-header-cell *matHeaderCellDef class="right">Current</th>
                    <td mat-cell *matCellDef="let h" class="right">{{ h.current_price | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="invested">
                    <th mat-header-cell *matHeaderCellDef class="right">Invested</th>
                    <td mat-cell *matCellDef="let h" class="right">{{ h.invested_value | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="current_value">
                    <th mat-header-cell *matHeaderCellDef class="right">Current Value</th>
                    <td mat-cell *matCellDef="let h" class="right">{{ h.current_value | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="pnl">
                    <th mat-header-cell *matHeaderCellDef class="right">P&L</th>
                    <td mat-cell *matCellDef="let h" class="right">
                      <div class="pnl-cell">
                        <span [class.text-profit]="(h.unrealized_pnl || 0) > 0" [class.text-loss]="(h.unrealized_pnl || 0) < 0">
                          {{ h.unrealized_pnl | currencyFormat }}
                        </span>
                        @if (h.unrealized_pnl_pct != null) {
                          <small [class.text-profit]="h.unrealized_pnl_pct > 0" [class.text-loss]="h.unrealized_pnl_pct < 0">
                            ({{ h.unrealized_pnl_pct | number:'1.2-2' }}%)
                          </small>
                        }
                      </div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="sector">
                    <th mat-header-cell *matHeaderCellDef>Sector</th>
                    <td mat-cell *matCellDef="let h">{{ h.sector || '--' }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="holdingColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: holdingColumns;"></tr>
                </table>
              }
            </div>
          </mat-tab>

          <!-- Transactions Tab -->
          <mat-tab label="Transactions">
            <div class="tab-content">
              @if (portfolioService.transactions().length === 0) {
                <div class="empty-mini"><mat-icon>receipt_long</mat-icon><p>No transactions</p></div>
              } @else {
                <table mat-table [dataSource]="portfolioService.transactions()" class="txn-table">
                  <ng-container matColumnDef="type">
                    <th mat-header-cell *matHeaderCellDef>Type</th>
                    <td mat-cell *matCellDef="let t">
                      <span class="txn-type" [class]="'type-' + t.type">{{ t.type }}</span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="symbol">
                    <th mat-header-cell *matHeaderCellDef>Security</th>
                    <td mat-cell *matCellDef="let t" class="txn-symbol">{{ t.symbol }}</td>
                  </ng-container>
                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef class="right">Qty</th>
                    <td mat-cell *matCellDef="let t" class="right">{{ t.quantity }}</td>
                  </ng-container>
                  <ng-container matColumnDef="price">
                    <th mat-header-cell *matHeaderCellDef class="right">Price</th>
                    <td mat-cell *matCellDef="let t" class="right">{{ t.price | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="net_amount">
                    <th mat-header-cell *matHeaderCellDef class="right">Net Amount</th>
                    <td mat-cell *matCellDef="let t" class="right">{{ t.net_amount | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="fees">
                    <th mat-header-cell *matHeaderCellDef class="right">Fees</th>
                    <td mat-cell *matCellDef="let t" class="right">{{ t.fees | currencyFormat }}</td>
                  </ng-container>
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let t">{{ t.executed_at | date:'mediumDate' }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="txnColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: txnColumns;"></tr>
                </table>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="empty-state">
        <mat-icon>error_outline</mat-icon>
        <p>Portfolio not found</p>
        <a mat-button routerLink="/portfolio" color="primary">Back to Portfolios</a>
      </div>
    }
  `,
  styles: [`
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .detail-page { max-width: 1100px; }
    .breadcrumb { display: flex; align-items: center; gap: 4px; margin-bottom: 20px; font-size: 13px; color: var(--gt-text-secondary); }
    .breadcrumb-link { display: flex; align-items: center; gap: 4px; color: var(--gt-primary); text-decoration: none; }
    .breadcrumb-link:hover { text-decoration: underline; }
    .breadcrumb-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .breadcrumb-sep { font-size: 16px; width: 16px; height: 16px; }
    .portfolio-header { margin-bottom: 20px; }
    .portfolio-name { font-size: 28px; font-weight: 700; margin: 0; color: var(--gt-text-primary); }
    .default-badge { font-size: 11px; padding: 3px 8px; border-radius: 4px; background: var(--gt-profit-bg); color: var(--gt-profit); margin-left: 10px; vertical-align: middle; }
    .portfolio-desc { color: var(--gt-text-secondary); margin: 4px 0 0; font-size: 14px; }
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card mat-card-content { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
    .sum-label { font-size: 12px; color: var(--gt-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .sum-value { font-size: 22px; font-weight: 700; }
    .text-profit { color: var(--gt-profit) !important; }
    .text-loss { color: var(--gt-loss) !important; }
    .tab-content { padding-top: 16px; }
    .holdings-table, .txn-table { width: 100%; }
    .right { text-align: right; }
    .holding-cell { display: flex; flex-direction: column; }
    .h-symbol { font-weight: 600; color: var(--gt-primary); }
    .h-name { font-size: 11px; color: var(--gt-text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pnl-cell { display: flex; flex-direction: column; align-items: flex-end; }
    .pnl-cell small { font-size: 11px; }
    .txn-type { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .type-buy { background: var(--gt-profit-bg); color: var(--gt-profit); }
    .type-sell { background: var(--gt-loss-bg); color: var(--gt-loss); }
    .type-dividend { background: rgba(41, 98, 255, 0.1); color: var(--gt-primary); }
    .txn-symbol { font-weight: 600; color: var(--gt-primary); }
    .empty-mini { display: flex; flex-direction: column; align-items: center; padding: 48px; color: var(--gt-text-muted); }
    .empty-mini mat-icon { font-size: 36px; width: 36px; height: 36px; opacity: 0.3; margin-bottom: 8px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px; color: var(--gt-text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
    @media (max-width: 768px) { .summary-row { grid-template-columns: repeat(2, 1fr); } }
  `],
})
export default class PortfolioDetailComponent implements OnInit, OnDestroy {
  readonly portfolioService = inject(PortfolioService);
  private readonly route = inject(ActivatedRoute);
  readonly p = this.portfolioService.selectedPortfolio;

  holdingColumns = ['symbol', 'quantity', 'avg_cost', 'current_price', 'invested', 'current_value', 'pnl', 'sector'];
  txnColumns = ['type', 'symbol', 'quantity', 'price', 'net_amount', 'fees', 'date'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.portfolioService.loadPortfolioDetail(id);
      this.portfolioService.loadTransactions(id);
    }
  }

  ngOnDestroy(): void {
    this.portfolioService.clearSelection();
  }
}
