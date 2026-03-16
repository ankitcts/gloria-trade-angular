import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import {
  SecuritySummary,
  SecurityDetail,
  PriceDataPoint,
} from '../../../models/security.model';
import { PaginatedResponse } from '../../../models/auth.model';

export interface SecurityFilters {
  security_type?: string;
  sector?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class SecuritiesService {
  private readonly api = inject(ApiService);

  private readonly _securities = signal<SecuritySummary[]>([]);
  private readonly _selectedSecurity = signal<SecurityDetail | null>(null);
  private readonly _priceHistory = signal<PriceDataPoint[]>([]);
  private readonly _loading = signal(false);
  private readonly _totalCount = signal(0);
  private readonly _currentPage = signal(1);
  private readonly _pageSize = signal(20);

  readonly securities = this._securities.asReadonly();
  readonly selectedSecurity = this._selectedSecurity.asReadonly();
  readonly priceHistory = this._priceHistory.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalPages = computed(() => Math.ceil(this._totalCount() / this._pageSize()));

  loadSecurities(page: number = 1, filters?: SecurityFilters): void {
    this._loading.set(true);
    this._currentPage.set(page);

    const params: Record<string, string | number> = {
      page,
      page_size: this._pageSize(),
    };
    if (filters?.security_type) params['security_type'] = filters.security_type;
    if (filters?.sector) params['sector'] = filters.sector;

    this.api
      .get<PaginatedResponse<SecuritySummary>>(ENDPOINTS.SECURITIES.LIST, params)
      .subscribe({
        next: (res) => {
          this._securities.set(res.items);
          this._totalCount.set(res.total);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      });
  }

  searchSecurities(query: string): Observable<SecuritySummary[]> {
    return this.api.get<SecuritySummary[]>(ENDPOINTS.SECURITIES.SEARCH, { q: query });
  }

  loadSecurityDetail(id: string): void {
    this._loading.set(true);
    this._selectedSecurity.set(null);

    this.api.get<SecurityDetail>(ENDPOINTS.SECURITIES.DETAIL(id)).subscribe({
      next: (security) => {
        this._selectedSecurity.set(security);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadPriceHistory(id: string, period: string = '1y'): void {
    this.api
      .get<PriceDataPoint[]>(ENDPOINTS.SECURITIES.HISTORY(id), { period })
      .subscribe({
        next: (data) => this._priceHistory.set(data),
        error: () => this._priceHistory.set([]),
      });
  }

  clearSelection(): void {
    this._selectedSecurity.set(null);
    this._priceHistory.set([]);
  }
}
