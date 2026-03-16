import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Portfolio, Holding, Transaction } from '../../../models/portfolio.model';
import { PaginatedResponse } from '../../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly api = inject(ApiService);

  private readonly _portfolios = signal<Portfolio[]>([]);
  private readonly _selectedPortfolio = signal<Portfolio | null>(null);
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _loading = signal(false);
  private readonly _transactionsTotal = signal(0);

  readonly portfolios = this._portfolios.asReadonly();
  readonly selectedPortfolio = this._selectedPortfolio.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly transactionsTotal = this._transactionsTotal.asReadonly();

  loadPortfolios(): void {
    this._loading.set(true);
    this.api.get<Portfolio[]>(ENDPOINTS.PORTFOLIO.LIST).subscribe({
      next: (portfolios) => {
        this._portfolios.set(portfolios);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadPortfolioDetail(id: string): void {
    this._loading.set(true);
    this.api.get<Portfolio>(ENDPOINTS.PORTFOLIO.DETAIL(id)).subscribe({
      next: (portfolio) => {
        this._selectedPortfolio.set(portfolio);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadTransactions(portfolioId: string, page = 1): void {
    this.api
      .get<PaginatedResponse<Transaction>>(ENDPOINTS.PORTFOLIO.TRANSACTIONS(portfolioId), { page, page_size: 20 })
      .subscribe({
        next: (res) => {
          this._transactions.set(res.items);
          this._transactionsTotal.set(res.total);
        },
      });
  }

  clearSelection(): void {
    this._selectedPortfolio.set(null);
    this._transactions.set([]);
  }
}
