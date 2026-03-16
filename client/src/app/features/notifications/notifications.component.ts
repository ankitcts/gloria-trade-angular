import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationsService } from './services/notifications.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { NotificationType } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    RelativeTimePipe,
  ],
  template: `
    <div class="notifications-page">
      <div class="page-header">
        <h1 class="page-title">
          Notifications
          @if (notificationsService.unreadCount() > 0) {
            <span class="unread-count">{{ notificationsService.unreadCount() }}</span>
          }
        </h1>
        @if (notificationsService.unreadCount() > 0) {
          <button mat-button color="primary" (click)="notificationsService.markAllAsRead()">
            Mark all as read
          </button>
        }
      </div>

      @if (notificationsService.loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (notificationsService.notifications().length === 0) {
        <mat-card>
          <mat-card-content class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <p>No notifications</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="notifications-list">
          @for (notif of notificationsService.notifications(); track notif.id) {
            <mat-card class="notification-card" [class.unread]="!notif.is_read"
                      (click)="onNotificationClick(notif.id, notif.is_read)">
              <mat-card-content>
                <div class="notif-row">
                  <mat-icon class="notif-icon" [class]="'type-' + notif.type">{{ getIcon(notif.type) }}</mat-icon>
                  <div class="notif-content">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="notif-message">{{ notif.message }}</span>
                  </div>
                  <span class="notif-time">{{ notif.created_at | relativeTime }}</span>
                  @if (!notif.is_read) {
                    <span class="unread-dot"></span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page { max-width: 800px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 24px; font-weight: 600; margin: 0; display: flex; align-items: center; gap: 8px; }
    .unread-count { font-size: 13px; background: #ffb300; color: #0a0e14; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
    .loading-container { display: flex; justify-content: center; padding: 64px; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px; color: #8c8c8c; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; margin-bottom: 8px; }
    .notifications-list { display: flex; flex-direction: column; gap: 8px; }
    .notification-card { cursor: pointer; transition: background 0.15s; }
    .notification-card.unread { border-left: 3px solid #ffb300; }
    .notification-card:hover { background: rgba(255,255,255,0.03); }
    .notif-row { display: flex; align-items: center; gap: 12px; }
    .notif-icon { color: #8c8c8c; }
    .type-order_filled { color: #66bb6a; }
    .type-order_cancelled { color: #8c8c8c; }
    .type-order_rejected { color: #ef5350; }
    .type-price_alert { color: #ffb300; }
    .type-prediction_ready { color: #42a5f5; }
    .type-system { color: #8c8c8c; }
    .notif-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .notif-title { font-weight: 500; font-size: 14px; }
    .notif-message { font-size: 13px; color: #8c8c8c; }
    .notif-time { font-size: 12px; color: #666; white-space: nowrap; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffb300; }
  `],
})
export default class NotificationsComponent implements OnInit {
  readonly notificationsService = inject(NotificationsService);

  ngOnInit(): void {
    this.notificationsService.loadNotifications();
  }

  onNotificationClick(id: string, isRead: boolean): void {
    if (!isRead) {
      this.notificationsService.markAsRead(id);
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      order_filled: 'check_circle',
      order_cancelled: 'cancel',
      order_rejected: 'error',
      price_alert: 'notifications_active',
      prediction_ready: 'insights',
      system: 'info',
    };
    return icons[type] || 'notifications';
  }
}
