import { Component, inject, OnInit } from '@angular/core';
import { UpperCasePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PredictionsService } from './services/predictions.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [
    UpperCasePipe,
    DecimalPipe,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RelativeTimePipe,
  ],
  template: `
    <div class="predictions-page">
      <h1 class="page-title">ML Predictions</h1>

      @if (predictionsService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (predictionsService.predictions().length === 0) {
        <mat-card>
          <mat-card-content class="empty-state">
            <mat-icon>insights</mat-icon>
            <p>No predictions available</p>
            <p class="sub-text">ML models will generate predictions when trained on security data</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="predictions-grid">
          @for (pred of predictionsService.predictions(); track pred.id) {
            <mat-card class="prediction-card">
              <mat-card-header>
                <mat-card-title class="pred-symbol">{{ pred.symbol }}</mat-card-title>
                <mat-card-subtitle>{{ pred.created_at | relativeTime }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="signal-row">
                  <span class="signal-badge" [class]="'signal-' + pred.signal">
                    {{ pred.signal.replace('_', ' ') | uppercase }}
                  </span>
                  <span class="confidence">
                    Confidence: {{ (pred.confidence * 100) | number:'1.1-1' }}%
                  </span>
                </div>

                @if (pred.risk_assessment) {
                  <div class="metrics">
                    @if (pred.risk_assessment.annual_return != null) {
                      <div class="metric">
                        <span class="metric-label">Annual Return</span>
                        <span class="metric-value">{{ (pred.risk_assessment.annual_return! * 100) | number:'1.2-2' }}%</span>
                      </div>
                    }
                    @if (pred.risk_assessment.volatility != null) {
                      <div class="metric">
                        <span class="metric-label">Volatility</span>
                        <span class="metric-value">{{ (pred.risk_assessment.volatility! * 100) | number:'1.2-2' }}%</span>
                      </div>
                    }
                    @if (pred.risk_assessment.sharpe_ratio != null) {
                      <div class="metric">
                        <span class="metric-label">Sharpe Ratio</span>
                        <span class="metric-value">{{ pred.risk_assessment.sharpe_ratio | number:'1.2-2' }}</span>
                      </div>
                    }
                  </div>
                }

                @if (pred.predicted_prices.length > 0) {
                  <div class="price-forecast">
                    <span class="forecast-label">Price Forecast</span>
                    <div class="forecast-items">
                      @for (pp of pred.predicted_prices.slice(0, 5); track pp.date) {
                        <div class="forecast-item">
                          <span class="forecast-date">{{ pp.date }}</span>
                          <span class="forecast-price">{{ pp.price | number:'1.2-2' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .predictions-page { max-width: 1200px; }
    .page-title { font-size: 24px; font-weight: 600; margin-bottom: 20px; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px; color: #8c8c8c; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
    .sub-text { font-size: 13px; color: #666; }
    .predictions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .pred-symbol { color: #ffb300; font-weight: 700; }
    .signal-row { display: flex; align-items: center; justify-content: space-between; margin: 12px 0; }
    .signal-badge { font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; }
    .signal-strong_buy, .signal-buy { background: rgba(102,187,106,0.15); color: #66bb6a; }
    .signal-hold { background: rgba(255,179,0,0.12); color: #ffb300; }
    .signal-sell, .signal-strong_sell { background: rgba(239,83,80,0.15); color: #ef5350; }
    .confidence { font-size: 13px; color: #8c8c8c; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; }
    .metric { display: flex; flex-direction: column; gap: 2px; }
    .metric-label { font-size: 11px; color: #8c8c8c; }
    .metric-value { font-size: 14px; font-weight: 500; }
    .price-forecast { margin-top: 12px; }
    .forecast-label { font-size: 12px; color: #8c8c8c; font-weight: 500; }
    .forecast-items { margin-top: 6px; }
    .forecast-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .forecast-date { color: #8c8c8c; }
    .forecast-price { font-weight: 500; }
  `],
})
export default class PredictionsComponent implements OnInit {
  readonly predictionsService = inject(PredictionsService);

  ngOnInit(): void {
    this.predictionsService.loadPredictions();
  }
}
