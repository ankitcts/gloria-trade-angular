import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Fundamentals } from '../../../../models/security.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-fundamentals-card',
  standalone: true,
  imports: [MatCardModule, CurrencyFormatPipe],
  template: `
    <mat-card class="fundamentals-card">
      <mat-card-header>
        <mat-card-title>Fundamentals</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="metrics-grid">
          <div class="metric">
            <span class="metric-label">Market Cap</span>
            <span class="metric-value">{{ fundamentals().market_cap | currencyFormat:currency():true }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">P/E Ratio</span>
            <span class="metric-value">{{ formatNumber(fundamentals().pe_ratio) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">P/B Ratio</span>
            <span class="metric-value">{{ formatNumber(fundamentals().pb_ratio) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">EPS</span>
            <span class="metric-value">{{ formatNumber(fundamentals().eps) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Dividend Yield</span>
            <span class="metric-value">{{ formatPercent(fundamentals().dividend_yield_pct) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">52W High</span>
            <span class="metric-value">{{ fundamentals().week_52_high | currencyFormat:currency() }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">52W Low</span>
            <span class="metric-value">{{ fundamentals().week_52_low | currencyFormat:currency() }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Avg Volume (30d)</span>
            <span class="metric-value">{{ formatVolume(fundamentals().avg_volume_30d) }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Beta</span>
            <span class="metric-value">{{ formatNumber(fundamentals().beta) }}</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .fundamentals-card {
      height: 100%;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 12px;
    }
    .metric {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .metric-label {
      font-size: 12px;
      color: #8c8c8c;
    }
    .metric-value {
      font-size: 14px;
      font-weight: 500;
    }
  `],
})
export class FundamentalsCardComponent {
  fundamentals = input.required<Fundamentals>();
  currency = input<string>('INR');

  formatNumber(val: number | null | undefined): string {
    if (val == null) return '--';
    return val.toFixed(2);
  }

  formatPercent(val: number | null | undefined): string {
    if (val == null) return '--';
    return `${val.toFixed(2)}%`;
  }

  formatVolume(val: number | null | undefined): string {
    if (val == null) return '--';
    if (val >= 1_00_00_000) return `${(val / 1_00_00_000).toFixed(2)}Cr`;
    if (val >= 1_00_000) return `${(val / 1_00_000).toFixed(2)}L`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(0);
  }
}
