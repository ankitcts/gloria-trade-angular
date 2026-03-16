import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Watchlist } from '../../../models/watchlist.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly api = inject(ApiService);

  private readonly _watchlists = signal<any[]>([]);
  private readonly _selectedWatchlist = signal<Watchlist | null>(null);
  private readonly _loading = signal(false);

  readonly watchlists = this._watchlists.asReadonly();
  readonly selectedWatchlist = this._selectedWatchlist.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadWatchlists(): void {
    this._loading.set(true);
    this.api.get<any[]>(ENDPOINTS.WATCHLIST.LIST).subscribe({
      next: (watchlists) => {
        this._watchlists.set(watchlists);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadWatchlist(id: string): void {
    this.api.get<Watchlist>(ENDPOINTS.WATCHLIST.DETAIL(id)).subscribe({
      next: (watchlist) => this._selectedWatchlist.set(watchlist),
    });
  }

  createWatchlist(name: string, description?: string): void {
    this.api.post(ENDPOINTS.WATCHLIST.LIST, { name, description }).subscribe({
      next: () => this.loadWatchlists(),
    });
  }

  addSecurity(watchlistId: string, securityId: string, symbol: string, securityName?: string): void {
    this.api
      .post(ENDPOINTS.WATCHLIST.ADD_SECURITY(watchlistId), {
        security_id: securityId,
        symbol,
        security_name: securityName,
      })
      .subscribe({
        next: () => this.loadWatchlist(watchlistId),
      });
  }

  removeSecurity(watchlistId: string, securityId: string): void {
    this.api.delete(ENDPOINTS.WATCHLIST.REMOVE_SECURITY(watchlistId, securityId)).subscribe({
      next: () => this.loadWatchlist(watchlistId),
    });
  }
}
