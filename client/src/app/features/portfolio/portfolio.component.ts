import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioService } from './services/portfolio.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { PriceChangeBadgeComponent } from '../../shared/components/price-change-badge/price-change-badge.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyFormatPipe,
    PriceChangeBadgeComponent,
    DecimalPipe,
  ],
  template: `
    <div class="portfolio-page">
      <div class="page-header">
        <h1 class="page-title">Portfolio</h1>
      </div>

      @if (portfolioService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (portfolioService.portfolios().length === 0) {
        <mat-card class="empty-card">
          <mat-card-content class="empty-state">
            <mat-icon>account_balance_wallet</mat-icon>
            <p>No portfolios found</p>
            <p class="sub-text">Start trading to create your first portfolio</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <!-- Summary Cards -->
        <div class="summary-row">
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="summary-label">Total Invested</span>
              <span class="summary-value">{{ totalInvested() | currencyFormat }}</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="summary-label">Current Value</span>
              <span class="summary-value">{{ totalCurrentValue() | currencyFormat }}</span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="summary-label">Unrealized P&L</span>
              <span class="summary-value" [class.profit]="totalUnrealizedPnl() > 0" [class.loss]="totalUnrealizedPnl() < 0">
                {{ totalUnrealizedPnl() | currencyFormat }}
              </span>
            </mat-card-content>
          </mat-card>
          <mat-card class="summary-card">
            <mat-card-content>
              <span class="summary-label">Realized P&L</span>
              <span class="summary-value" [class.profit]="totalRealizedPnl() > 0" [class.loss]="totalRealizedPnl() < 0">
                {{ totalRealizedPnl() | currencyFormat }}
              </span>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Portfolio Cards -->
        <div class="portfolios-grid">
          @for (portfolio of portfolioService.portfolios(); track portfolio.id) {
            <mat-card class="portfolio-card" (click)="onPortfolioClick(portfolio.id)">
              <mat-card-header>
                <mat-card-title>
                  {{ portfolio.name }}
                  @if (portfolio.is_default) {
                    <span class="default-badge">Default</span>
                  }
                </mat-card-title>
                @if (portfolio.description) {
                  <mat-card-subtitle>{{ portfolio.description }}</mat-card-subtitle>
                }
              </mat-card-header>
              <mat-card-content>
                <div class="portfolio-stats">
                  <div class="stat">
                    <span class="stat-label">Holdings</span>
                    <span class="stat-value">{{ portfolio.holdings_count || portfolio.holdings?.length || 0 }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Invested</span>
                    <span class="stat-value">{{ portfolio.total_invested | currencyFormat:portfolio.currency:true }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Current</span>
                    <span class="stat-value">{{ portfolio.total_current_value | currencyFormat:portfolio.currency:true }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">P&L</span>
                    <span class="stat-value" [class.profit]="portfolio.total_unrealized_pnl > 0" [class.loss]="portfolio.total_unrealized_pnl < 0">
                      {{ portfolio.total_unrealized_pnl | currencyFormat:portfolio.currency }}
                    </span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Holdings Table (from first/default portfolio) -->
        @if (defaultPortfolio(); as dp) {
          @if (dp.holdings && dp.holdings.length > 0) {
            <h2 class="section-title">Holdings</h2>
            <mat-card class="holdings-card">
              <mat-card-content>
                <div class="holdings-table">
                  <div class="holdings-header">
                    <span>Symbol</span>
                    <span class="right">Qty</span>
                    <span class="right">Avg Cost</span>
                    <span class="right">Current</span>
                    <span class="right">Invested</span>
                    <span class="right">Current Value</span>
                    <span class="right">P&L</span>
                  </div>
                  @for (h of dp.holdings; track h.security_id) {
                    <div class="holdings-row">
                      <span class="holding-symbol">
                        <strong>{{ h.symbol }}</strong>
                        @if (h.security_name) {
                          <small>{{ h.security_name }}</small>
                        }
                      </span>
                      <span class="right">{{ h.quantity }}</span>
                      <span class="right">{{ h.avg_cost_price | currencyFormat }}</span>
                      <span class="right">{{ h.current_price | currencyFormat }}</span>
                      <span class="right">{{ h.invested_value | currencyFormat }}</span>
                      <span class="right">{{ h.current_value | currencyFormat }}</span>
                      <span class="right" [class.profit]="(h.unrealized_pnl ?? 0) > 0" [class.loss]="(h.unrealized_pnl ?? 0) < 0">
                        {{ h.unrealized_pnl | currencyFormat }}
                        @if (h.unrealized_pnl_pct != null) {
                          <small>({{ h.unrealized_pnl_pct | number:'1.2-2' }}%)</small>
                        }
                      </span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        }
      }
    </div>
  `,
  styles: [`
    .portfolio-page { max-width: 1200px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px; color: #8c8c8c; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
    .sub-text { font-size: 13px; color: #666; }
    .summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card mat-card-content { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
    .summary-label { font-size: 13px; color: #8c8c8c; }
    .summary-value { font-size: 20px; font-weight: 600; }
    .profit { color: #66bb6a; }
    .loss { color: #ef5350; }
    .portfolios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .portfolio-card { cursor: pointer; transition: transform 0.15s; }
    .portfolio-card:hover { transform: translateY(-2px); }
    .default-badge { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(102, 187, 106, 0.15); color: #66bb6a; margin-left: 8px; vertical-align: middle; }
    .portfolio-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-label { font-size: 12px; color: #8c8c8c; }
    .stat-value { font-size: 14px; font-weight: 500; }
    .section-title { font-size: 18px; font-weight: 600; margin: 8px 0 12px; }
    .holdings-card { overflow-x: auto; }
    .holdings-header, .holdings-row { display: grid; grid-template-columns: 2fr repeat(6, 1fr); gap: 8px; padding: 10px 16px; align-items: center; }
    .holdings-header { font-size: 12px; color: #8c8c8c; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .holdings-row { border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
    .holdings-row:hover { background: rgba(255,255,255,0.02); }
    .right { text-align: right; }
    .holding-symbol { display: flex; flex-direction: column; }
    .holding-symbol strong { color: #ffb300; }
    .holding-symbol small { font-size: 11px; color: #8c8c8c; }
  `],
})
export default class PortfolioComponent implements OnInit {
  readonly portfolioService = inject(PortfolioService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.portfolioService.loadPortfolios();
  }

  totalInvested = () => this.portfolioService.portfolios().reduce((sum, p) => sum + p.total_invested, 0);
  totalCurrentValue = () => this.portfolioService.portfolios().reduce((sum, p) => sum + p.total_current_value, 0);
  totalUnrealizedPnl = () => this.portfolioService.portfolios().reduce((sum, p) => sum + p.total_unrealized_pnl, 0);
  totalRealizedPnl = () => this.portfolioService.portfolios().reduce((sum, p) => sum + p.total_realized_pnl, 0);
  defaultPortfolio = () => this.portfolioService.portfolios().find((p) => p.is_default) || this.portfolioService.portfolios()[0] || null;

  onPortfolioClick(id: string): void {
    this.router.navigate(['/portfolio', id]);
  }
}
