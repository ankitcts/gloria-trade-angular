import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { Notification } from '../../../models/notification.model';
import { PaginatedResponse } from '../../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiService);

  private readonly _notifications = signal<Notification[]>([]);
  private readonly _loading = signal(false);
  private readonly _total = signal(0);

  readonly notifications = this._notifications.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly total = this._total.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.is_read).length);

  loadNotifications(page = 1): void {
    this._loading.set(true);
    this.api.get<PaginatedResponse<Notification>>(ENDPOINTS.NOTIFICATIONS.LIST, { page, page_size: 20 }).subscribe({
      next: (res) => {
        this._notifications.set(res.items);
        this._total.set(res.total);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  markAsRead(id: string): void {
    this.api.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id)).subscribe({
      next: () => {
        this._notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      },
    });
  }

  markAllAsRead(): void {
    this.api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ).subscribe({
      next: () => {
        this._notifications.update((list) => list.map((n) => ({ ...n, is_read: true })));
      },
    });
  }
}
