import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { SecuritiesService } from '../services/securities.service';
import { PriceChartComponent } from '../components/price-chart/price-chart.component';
import { FundamentalsCardComponent } from '../components/fundamentals-card/fundamentals-card.component';
import { RiskBadgeComponent } from '../components/risk-badge/risk-badge.component';
import { UpperCasePipe } from '@angular/common';
import { PriceChangeBadgeComponent } from '../../../shared/components/price-change-badge/price-change-badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-security-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    PriceChartComponent,
    FundamentalsCardComponent,
    RiskBadgeComponent,
    UpperCasePipe,
    PriceChangeBadgeComponent,
    CurrencyFormatPipe,
  ],
  template: `
    @if (securitiesService.loading() && !s()) {
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (s()) {
      <div class="detail-page">
        <!-- Header -->
        <div class="detail-header">
          <button mat-icon-button routerLink="/securities" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="header-info">
            <div class="header-top">
              <h1 class="symbol">{{ s()!.symbol }}</h1>
              <span class="type-chip">{{ s()!.security_type | uppercase }}</span>
              <app-risk-badge [risk]="s()!.computed_risk ?? null" />
            </div>
            <p class="name">{{ s()!.name }}</p>
            @if (s()!.industry) {
              <p class="industry">{{ s()!.industry }}</p>
            }
          </div>
          <div class="price-info">
            <span class="current-price">{{ s()!.quote?.last_price | currencyFormat:s()!.currency }}</span>
            @if (s()!.quote?.change_pct != null) {
              <app-price-change-badge [value]="s()!.quote!.change_pct!" />
            }
          </div>
        </div>

        <!-- Quote summary -->
        <mat-card class="quote-card">
          <mat-card-content>
            <div class="quote-grid">
              <div class="quote-item">
                <span class="quote-label">Open</span>
                <span class="quote-value">{{ s()!.quote?.open | currencyFormat:s()!.currency }}</span>
              </div>
              <div class="quote-item">
                <span class="quote-label">High</span>
                <span class="quote-value">{{ s()!.quote?.high | currencyFormat:s()!.currency }}</span>
              </div>
              <div class="quote-item">
                <span class="quote-label">Low</span>
                <span class="quote-value">{{ s()!.quote?.low | currencyFormat:s()!.currency }}</span>
              </div>
              <div class="quote-item">
                <span class="quote-label">Prev Close</span>
                <span class="quote-value">{{ s()!.quote?.prev_close | currencyFormat:s()!.currency }}</span>
              </div>
              <div class="quote-item">
                <span class="quote-label">Volume</span>
                <span class="quote-value">{{ formatVolume(s()!.quote?.volume) }}</span>
              </div>
              <div class="quote-item">
                <span class="quote-label">Exchange</span>
                <span class="quote-value">{{ s()!.primary_exchange_code }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Tabs: Chart / Fundamentals / About -->
        <mat-tab-group animationDuration="200ms" class="detail-tabs">
          <!-- Chart Tab -->
          <mat-tab label="Price Chart">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <app-price-chart [data]="securitiesService.priceHistory()" />
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Fundamentals Tab -->
          <mat-tab label="Fundamentals">
            <div class="tab-content">
              <app-fundamentals-card
                [fundamentals]="s()!.fundamentals"
                [currency]="s()!.currency" />
            </div>
          </mat-tab>

          <!-- About Tab -->
          <mat-tab label="About">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  @if (s()!.description) {
                    <p class="description">{{ s()!.description }}</p>
                    <mat-divider></mat-divider>
                  }
                  <div class="about-grid">
                    <div class="about-item">
                      <span class="about-label">ISIN</span>
                      <span class="about-value">{{ s()!.isin || '--' }}</span>
                    </div>
                    <div class="about-item">
                      <span class="about-label">Sector</span>
                      <span class="about-value">{{ formatSector(s()!.sector) }}</span>
                    </div>
                    <div class="about-item">
                      <span class="about-label">Country</span>
                      <span class="about-value">{{ s()!.country_code }}</span>
                    </div>
                    <div class="about-item">
                      <span class="about-label">Currency</span>
                      <span class="about-value">{{ s()!.currency }}</span>
                    </div>
                    <div class="about-item">
                      <span class="about-label">Data Source</span>
                      <span class="about-value">{{ s()!.data_source || '--' }}</span>
                    </div>
                    <div class="about-item">
                      <span class="about-label">Historical Data</span>
                      <span class="about-value">{{ s()!.has_historical_data ? 'Available' : 'Not available' }}</span>
                    </div>
                  </div>

                  @if (s()!.listings.length > 0) {
                    <h3 class="section-title">Exchange Listings</h3>
                    <div class="listings-grid">
                      @for (listing of s()!.listings; track listing.exchange_code) {
                        <div class="listing-item">
                          <span class="listing-exchange">{{ listing.exchange_code }}</span>
                          <span class="listing-ticker">{{ listing.ticker }}</span>
                          @if (listing.is_primary) {
                            <span class="primary-badge">Primary</span>
                          }
                        </div>
                      }
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    } @else {
      <div class="empty-state">
        <mat-icon>error_outline</mat-icon>
        <p>Security not found</p>
        <button mat-button routerLink="/securities" color="primary">Back to Securities</button>
      </div>
    }
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px;
    }
    .detail-page {
      max-width: 1000px;
    }
    .detail-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }
    .back-btn {
      margin-top: 4px;
    }
    .header-info {
      flex: 1;
    }
    .header-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .symbol {
      font-size: 28px;
      font-weight: 700;
      color: #ffb300;
      margin: 0;
    }
    .type-chip {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 179, 0, 0.1);
      color: #ffb300;
      font-weight: 500;
    }
    .name {
      font-size: 16px;
      margin: 4px 0 0;
      color: #e6e6e6;
    }
    .industry {
      font-size: 13px;
      color: #8c8c8c;
      margin: 2px 0 0;
    }
    .price-info {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .current-price {
      font-size: 28px;
      font-weight: 700;
    }
    .quote-card {
      margin-bottom: 16px;
    }
    .quote-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
    }
    .quote-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .quote-label {
      font-size: 12px;
      color: #8c8c8c;
    }
    .quote-value {
      font-size: 14px;
      font-weight: 500;
    }
    .detail-tabs {
      margin-top: 16px;
    }
    .tab-content {
      padding-top: 16px;
    }
    .description {
      line-height: 1.6;
      color: #c0c0c0;
      margin-bottom: 16px;
    }
    .about-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .about-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .about-label {
      font-size: 12px;
      color: #8c8c8c;
    }
    .about-value {
      font-size: 14px;
      font-weight: 500;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 24px 0 12px;
    }
    .listings-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .listing-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.04);
    }
    .listing-exchange {
      font-weight: 600;
      color: #ffb300;
    }
    .listing-ticker {
      color: #e6e6e6;
    }
    .primary-badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 3px;
      background: rgba(102, 187, 106, 0.15);
      color: #66bb6a;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      color: #8c8c8c;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.3;
      margin-bottom: 8px;
    }
  `],
})
export default class SecurityDetailComponent implements OnInit, OnDestroy {
  readonly securitiesService = inject(SecuritiesService);
  private readonly route = inject(ActivatedRoute);
  readonly s = this.securitiesService.selectedSecurity;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.securitiesService.loadSecurityDetail(id);
      this.securitiesService.loadPriceHistory(id);
    }
  }

  ngOnDestroy(): void {
    this.securitiesService.clearSelection();
  }

  formatSector(sector: string | null | undefined): string {
    if (!sector) return '--';
    return sector.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  formatVolume(val: number | null | undefined): string {
    if (val == null) return '--';
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(0);
  }
}
