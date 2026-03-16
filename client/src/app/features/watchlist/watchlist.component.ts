import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { WatchlistService } from './services/watchlist.service';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatListModule,
    CurrencyFormatPipe,
    RelativeTimePipe,
  ],
  template: `
    <div class="watchlist-page">
      <div class="page-header">
        <h1 class="page-title">Watchlists</h1>
        <button mat-raised-button color="primary" (click)="showCreateForm.set(!showCreateForm())">
          <mat-icon>add</mat-icon>
          New Watchlist
        </button>
      </div>

      @if (showCreateForm()) {
        <mat-card class="create-card">
          <mat-card-content>
            <form (ngSubmit)="onCreateWatchlist()" class="create-form">
              <mat-form-field appearance="outline">
                <mat-label>Watchlist Name</mat-label>
                <input matInput [(ngModel)]="newWatchlistName" name="name" required />
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" [disabled]="!newWatchlistName">
                Create
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (watchlistService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (watchlistService.watchlists().length === 0) {
        <mat-card>
          <mat-card-content class="empty-state">
            <mat-icon>visibility</mat-icon>
            <p>No watchlists yet</p>
            <p class="sub-text">Create a watchlist to track your favorite securities</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="watchlists-grid">
          @for (wl of watchlistService.watchlists(); track wl.id) {
            <mat-card class="watchlist-card" (click)="onSelectWatchlist(wl.id)">
              <mat-card-header>
                <mat-card-title>
                  {{ wl.name }}
                  @if (wl.is_default) {
                    <span class="default-badge">Default</span>
                  }
                </mat-card-title>
                <mat-card-subtitle>{{ wl.securities_count }} securities</mat-card-subtitle>
              </mat-card-header>
            </mat-card>
          }
        </div>

        <!-- Selected Watchlist Detail -->
        @if (watchlistService.selectedWatchlist(); as wl) {
          <h2 class="section-title">{{ wl.name }}</h2>
          <mat-card>
            <mat-card-content>
              @if (wl.securities.length === 0) {
                <div class="empty-state small">
                  <p>No securities in this watchlist</p>
                </div>
              } @else {
                <div class="securities-list">
                  @for (sec of wl.securities; track sec.security_id) {
                    <div class="security-item">
                      <div class="sec-info">
                        <span class="sec-symbol">{{ sec.symbol }}</span>
                        @if (sec.security_name) {
                          <span class="sec-name">{{ sec.security_name }}</span>
                        }
                      </div>
                      <div class="sec-alerts">
                        @if (sec.alert_above) {
                          <span class="alert-badge above">Above {{ sec.alert_above }}</span>
                        }
                        @if (sec.alert_below) {
                          <span class="alert-badge below">Below {{ sec.alert_below }}</span>
                        }
                      </div>
                      <span class="sec-added">{{ sec.added_at | relativeTime }}</span>
                      <button mat-icon-button (click)="onRemoveSecurity(wl.id, sec.security_id); $event.stopPropagation()">
                        <mat-icon>delete_outline</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    .watchlist-page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0; }
    .create-card { margin-bottom: 16px; }
    .create-form { display: flex; gap: 12px; align-items: flex-start; }
    .create-form mat-form-field { flex: 1; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px; color: #8c8c8c; }
    .empty-state.small { padding: 24px; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
    .sub-text { font-size: 13px; color: #666; }
    .watchlists-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .watchlist-card { cursor: pointer; transition: transform 0.15s; }
    .watchlist-card:hover { transform: translateY(-2px); }
    .default-badge { font-size: 10px; padding: 2px 6px; border-radius: 3px; background: rgba(102,187,106,0.15); color: #66bb6a; margin-left: 8px; }
    .section-title { font-size: 18px; font-weight: 600; margin: 8px 0 12px; }
    .securities-list { display: flex; flex-direction: column; }
    .security-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .sec-info { flex: 1; display: flex; flex-direction: column; }
    .sec-symbol { font-weight: 600; color: #ffb300; }
    .sec-name { font-size: 12px; color: #8c8c8c; }
    .sec-alerts { display: flex; gap: 6px; }
    .alert-badge { font-size: 11px; padding: 2px 6px; border-radius: 3px; }
    .alert-badge.above { background: rgba(102,187,106,0.12); color: #66bb6a; }
    .alert-badge.below { background: rgba(239,83,80,0.12); color: #ef5350; }
    .sec-added { font-size: 12px; color: #666; }
  `],
})
export default class WatchlistComponent implements OnInit {
  readonly watchlistService = inject(WatchlistService);
  showCreateForm = signal(false);
  newWatchlistName = '';

  ngOnInit(): void {
    this.watchlistService.loadWatchlists();
  }

  onCreateWatchlist(): void {
    if (!this.newWatchlistName) return;
    this.watchlistService.createWatchlist(this.newWatchlistName);
    this.newWatchlistName = '';
    this.showCreateForm.set(false);
  }

  onSelectWatchlist(id: string): void {
    this.watchlistService.loadWatchlist(id);
  }

  onRemoveSecurity(watchlistId: string, securityId: string): void {
    this.watchlistService.removeSecurity(watchlistId, securityId);
  }
}
