import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';
import type { IChartApi, ISeriesApi, SeriesType, Time } from 'lightweight-charts';
import { PriceDataPoint } from '../../../../models/security.model';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule],
  template: `
    <div class="chart-wrapper">
      <div class="chart-controls">
        <mat-button-toggle-group [(ngModel)]="chartType" (change)="updateChartType()">
          <mat-button-toggle value="candlestick">Candlestick</mat-button-toggle>
          <mat-button-toggle value="line">Line</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
      <div #chartContainer class="chart-container"></div>
    </div>
  `,
  styles: [`
    .chart-wrapper {
      width: 100%;
    }
    .chart-controls {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }
    .chart-container {
      width: 100%;
      height: 400px;
    }
  `],
})
export class PriceChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLElement>;
  @Input() data: PriceDataPoint[] = [];

  chartType = 'candlestick';
  private chart: IChartApi | null = null;
  private currentSeries: ISeriesApi<SeriesType> | null = null;
  private initialized = false;

  ngAfterViewInit(): void {
    this.initialized = true;
    this.createChartInstance();
    this.renderData();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.initialized) {
      this.renderData();
    }
  }

  updateChartType(): void {
    this.renderData();
  }

  private createChartInstance(): void {
    if (!this.chartContainer) return;

    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#8c8c8c',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: false,
      },
      handleScale: true,
      handleScroll: true,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.chart?.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private renderData(): void {
    if (!this.chart || !this.data.length) return;

    // Remove existing series
    if (this.currentSeries) {
      this.chart.removeSeries(this.currentSeries);
      this.currentSeries = null;
    }

    if (this.chartType === 'candlestick') {
      const series = this.chart.addSeries(CandlestickSeries, {
        upColor: '#66bb6a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#66bb6a',
        wickDownColor: '#ef5350',
        wickUpColor: '#66bb6a',
      });
      series.setData(
        this.data.map((d) => ({
          time: d.date as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
      this.currentSeries = series as ISeriesApi<SeriesType>;
    } else {
      const series = this.chart.addSeries(LineSeries, {
        color: '#ffb300',
        lineWidth: 2,
      });
      series.setData(
        this.data.map((d) => ({
          time: d.date as Time,
          value: d.close,
        }))
      );
      this.currentSeries = series as ISeriesApi<SeriesType>;
    }

    this.chart.timeScale().fitContent();
  }
}
