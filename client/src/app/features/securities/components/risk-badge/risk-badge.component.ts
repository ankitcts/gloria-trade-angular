import { Component, input } from '@angular/core';
import { RiskLevel } from '../../../../models/security.model';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  template: `
    @if (risk()) {
      <span class="risk-badge" [class]="'risk-' + risk()">
        {{ formatRisk(risk()!) }}
      </span>
    } @else {
      <span class="risk-badge risk-unknown">N/A</span>
    }
  `,
  styles: [`
    .risk-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .risk-low {
      background: rgba(102, 187, 106, 0.15);
      color: #66bb6a;
    }
    .risk-medium {
      background: rgba(255, 167, 38, 0.15);
      color: #ffa726;
    }
    .risk-high {
      background: rgba(239, 83, 80, 0.15);
      color: #ef5350;
    }
    .risk-very_high {
      background: rgba(211, 47, 47, 0.18);
      color: #d32f2f;
    }
    .risk-unknown {
      background: rgba(140, 140, 140, 0.1);
      color: #8c8c8c;
    }
  `],
})
export class RiskBadgeComponent {
  risk = input<RiskLevel | null>(null);

  formatRisk(risk: RiskLevel): string {
    return risk.replace(/_/g, ' ');
  }
}
