import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UpperCasePipe } from '@angular/common';
import { SecuritiesService, SecurityFilters } from '../services/securities.service';
import { PriceChangeBadgeComponent } from '../../../shared/components/price-change-badge/price-change-badge.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { SecurityType, Sector, RiskLevel } from '../../../models/security.model';

@Component({
  selector: 'app-securities-list',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule,
    PriceChangeBadgeComponent,
    CurrencyFormatPipe,
    UpperCasePipe,
  ],
  template: `
    <div class="securities-page">
      <div class="page-header">
        <h1 class="page-title">Securities</h1>
      </div>

      <!-- Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search securities</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Symbol or name..." />
              <mat-icon matPrefix>search</mat-icon>
              @if (searchQuery) {
                <button mat-icon-button matSuffix (click)="clearSearch()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="type-filter">
              <mat-label>Type</mat-label>
              <mat-select [(ngModel)]="selectedType" (selectionChange)="onFilterChange()">
                <mat-option value="">All Types</mat-option>
                @for (type of securityTypes; track type.value) {
                  <mat-option [value]="type.value">{{ type.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sector-filter">
              <mat-label>Sector</mat-label>
              <mat-select [(ngModel)]="selectedSector" (selectionChange)="onFilterChange()">
                <mat-option value="">All Sectors</mat-option>
                @for (sector of sectors; track sector.value) {
                  <mat-option [value]="sector.value">{{ sector.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Table -->
      <mat-card class="table-card">
        @if (securitiesService.loading()) {
          <div class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="securitiesService.securities()" class="securities-table">
            <!-- Symbol -->
            <ng-container matColumnDef="symbol">
              <th mat-header-cell *matHeaderCellDef>Symbol</th>
              <td mat-cell *matCellDef="let row">
                <div class="symbol-cell">
                  <span class="symbol">{{ row.symbol }}</span>
                  <span class="name">{{ row.name }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Type -->
            <ng-container matColumnDef="security_type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">
                <span class="type-chip">{{ row.security_type | uppercase }}</span>
              </td>
            </ng-container>

            <!-- Sector -->
            <ng-container matColumnDef="sector">
              <th mat-header-cell *matHeaderCellDef>Sector</th>
              <td mat-cell *matCellDef="let row">{{ formatSector(row.sector) }}</td>
            </ng-container>

            <!-- Exchange -->
            <ng-container matColumnDef="exchange">
              <th mat-header-cell *matHeaderCellDef>Exchange</th>
              <td mat-cell *matCellDef="let row">{{ row.primary_exchange_code }}</td>
            </ng-container>

            <!-- Price -->
            <ng-container matColumnDef="last_price">
              <th mat-header-cell *matHeaderCellDef class="right-align">Price</th>
              <td mat-cell *matCellDef="let row" class="right-align">
                {{ row.last_price | currencyFormat:row.currency }}
              </td>
            </ng-container>

            <!-- Change -->
            <ng-container matColumnDef="change_pct">
              <th mat-header-cell *matHeaderCellDef class="right-align">Change</th>
              <td mat-cell *matCellDef="let row" class="right-align">
                @if (row.change_pct != null) {
                  <app-price-change-badge [value]="row.change_pct" />
                } @else {
                  <span class="text-muted">--</span>
                }
              </td>
            </ng-container>

            <!-- Risk -->
            <ng-container matColumnDef="risk">
              <th mat-header-cell *matHeaderCellDef>Risk</th>
              <td mat-cell *matCellDef="let row">
                @if (row.computed_risk) {
                  <span class="risk-badge" [class]="'risk-' + row.computed_risk">
                    {{ row.computed_risk | uppercase }}
                  </span>
                } @else {
                  <span class="text-muted">--</span>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                class="clickable-row"
                (click)="onRowClick(row)"></tr>
          </table>

          @if (securitiesService.securities().length === 0) {
            <div class="empty-state">
              <mat-icon>search_off</mat-icon>
              <p>No securities found</p>
            </div>
          }

          <mat-paginator
            [length]="securitiesService.totalCount()"
            [pageSize]="securitiesService.pageSize()"
            [pageIndex]="securitiesService.currentPage() - 1"
            [pageSizeOptions]="[10, 20, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .securities-page {
      max-width: 1200px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
    .filter-card {
      margin-bottom: 16px;
    }
    .filters-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 250px;
    }
    .type-filter, .sector-filter {
      width: 180px;
    }
    .table-card {
      overflow: hidden;
    }
    .securities-table {
      width: 100%;
    }
    .symbol-cell {
      display: flex;
      flex-direction: column;
    }
    .symbol {
      font-weight: 600;
      color: #ffb300;
    }
    .name {
      font-size: 12px;
      color: #8c8c8c;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .type-chip {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 179, 0, 0.1);
      color: #ffb300;
      font-weight: 500;
    }
    .right-align {
      text-align: right;
    }
    .risk-badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .risk-low {
      background: rgba(102, 187, 106, 0.12);
      color: #66bb6a;
    }
    .risk-medium {
      background: rgba(255, 167, 38, 0.12);
      color: #ffa726;
    }
    .risk-high {
      background: rgba(239, 83, 80, 0.12);
      color: #ef5350;
    }
    .risk-very_high {
      background: rgba(211, 47, 47, 0.15);
      color: #d32f2f;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px;
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
    .text-muted {
      color: #8c8c8c;
    }
  `],
})
export default class SecuritiesListComponent implements OnInit {
  readonly securitiesService = inject(SecuritiesService);
  private readonly router = inject(Router);

  searchQuery = '';
  selectedType = '';
  selectedSector = '';

  displayedColumns = ['symbol', 'security_type', 'sector', 'exchange', 'last_price', 'change_pct', 'risk'];

  securityTypes = [
    { value: SecurityType.EQUITY, label: 'Equity' },
    { value: SecurityType.ETF, label: 'ETF' },
    { value: SecurityType.INDEX, label: 'Index' },
    { value: SecurityType.MUTUAL_FUND, label: 'Mutual Fund' },
    { value: SecurityType.BOND, label: 'Bond' },
    { value: SecurityType.COMMODITY, label: 'Commodity' },
  ];

  sectors = [
    { value: Sector.TECHNOLOGY, label: 'Technology' },
    { value: Sector.FINANCIAL_SERVICES, label: 'Financial Services' },
    { value: Sector.HEALTHCARE, label: 'Healthcare' },
    { value: Sector.CONSUMER_CYCLICAL, label: 'Consumer Cyclical' },
    { value: Sector.INDUSTRIALS, label: 'Industrials' },
    { value: Sector.ENERGY, label: 'Energy' },
    { value: Sector.UTILITIES, label: 'Utilities' },
    { value: Sector.REAL_ESTATE, label: 'Real Estate' },
    { value: Sector.COMMUNICATION_SERVICES, label: 'Communication' },
    { value: Sector.BASIC_MATERIALS, label: 'Basic Materials' },
  ];

  ngOnInit(): void {
    this.securitiesService.loadSecurities(1);
  }

  onSearch(): void {
    this.securitiesService.loadSecurities(1, this.buildFilters());
  }

  onFilterChange(): void {
    this.securitiesService.loadSecurities(1, this.buildFilters());
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.securitiesService.loadSecurities(1, this.buildFilters());
  }

  onPageChange(event: PageEvent): void {
    this.securitiesService.loadSecurities(event.pageIndex + 1, this.buildFilters());
  }

  onRowClick(row: any): void {
    this.router.navigate(['/securities', row.id]);
  }

  formatSector(sector: string | null): string {
    if (!sector) return '--';
    return sector.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private buildFilters(): SecurityFilters {
    return {
      security_type: this.selectedType || undefined,
      sector: this.selectedSector || undefined,
      search: this.searchQuery || undefined,
    };
  }
}
