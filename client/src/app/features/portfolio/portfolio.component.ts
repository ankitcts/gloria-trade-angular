import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div>
      <h1 class="page-title">Portfolio</h1>
      <mat-card>
        <mat-card-content class="placeholder">
          <mat-icon>account_balance_wallet</mat-icon>
          <p>Portfolio holdings and performance will be displayed here</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-title { font-size: 24px; font-weight: 600; margin-bottom: 24px; }
    .placeholder { display: flex; flex-direction: column; align-items: center; padding: 64px; color: #8c8c8c; }
    .placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
  `],
})
export default class PortfolioComponent {}
