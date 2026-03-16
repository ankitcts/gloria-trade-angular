import { Component, Input, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-price-change-badge',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span class="badge" [class.positive]="isPositive()" [class.negative]="isNegative()">
      <mat-icon class="badge-icon">{{ icon() }}</mat-icon>
      <span>{{ formattedValue() }}</span>
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 13px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 4px;
      color: #8c8c8c;
      background: rgba(140, 140, 140, 0.1);
    }
    .badge.positive {
      color: #66bb6a;
      background: rgba(102, 187, 106, 0.12);
    }
    .badge.negative {
      color: #ef5350;
      background: rgba(239, 83, 80, 0.12);
    }
    .badge-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `],
})
export class PriceChangeBadgeComponent {
  value = input<number>(0);
  showPercent = input<boolean>(true);

  isPositive = computed(() => this.value() > 0);
  isNegative = computed(() => this.value() < 0);
  icon = computed(() =>
    this.value() > 0 ? 'arrow_drop_up' : this.value() < 0 ? 'arrow_drop_down' : 'remove'
  );
  formattedValue = computed(() => {
    const v = this.value();
    const sign = v > 0 ? '+' : '';
    const num = this.showPercent() ? `${v.toFixed(2)}%` : v.toFixed(2);
    return `${sign}${num}`;
  });
}
