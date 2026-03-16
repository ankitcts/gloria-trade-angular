import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UpperCasePipe } from '@angular/common';
import { AuthState } from '../../core/auth/auth.state';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, UpperCasePipe],
  template: `
    <mat-toolbar class="header-toolbar">
      <div class="logo-section">
        <mat-icon class="logo-icon">show_chart</mat-icon>
        <span class="logo-text">Gloria Trade</span>
      </div>
      <span class="spacer"></span>

      <!-- User greeting -->
      @if (authState.user()) {
        <span class="user-greeting">
          <span class="greeting-name">{{ authState.displayName() }}</span>
          <span class="greeting-role">{{ authState.user()!.role | uppercase }}</span>
        </span>
      }

      <button mat-icon-button (click)="themeService.toggle()" aria-label="Toggle theme" class="toolbar-btn">
        <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu" class="toolbar-btn avatar-btn">
        <div class="avatar">{{ getInitials() }}</div>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-info">
          <div class="user-avatar-lg">{{ getInitials() }}</div>
          <div class="user-details">
            <strong>{{ authState.displayName() }}</strong>
            <small>{{ authState.user()?.email }}</small>
            <span class="role-chip">{{ authState.user()?.role }}</span>
          </div>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="authService.logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: var(--gt-bg-card) !important;
      border-bottom: 1px solid var(--gt-border);
      height: 52px;
      padding: 0 16px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .logo-icon {
      color: var(--gt-primary);
      font-size: 22px;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--gt-text-primary);
      letter-spacing: 0.3px;
    }
    .spacer { flex: 1; }
    .user-greeting {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-right: 8px;
      line-height: 1.2;
    }
    .greeting-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--gt-text-primary);
    }
    .greeting-role {
      font-size: 10px;
      color: var(--gt-primary);
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .toolbar-btn {
      color: var(--gt-text-secondary);
    }
    .avatar-btn {
      padding: 0;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--gt-primary);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-info {
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar-lg {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--gt-primary);
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .user-details strong {
      font-size: 14px;
      color: var(--gt-text-primary);
    }
    .user-details small {
      color: var(--gt-text-secondary);
      font-size: 12px;
    }
    .role-chip {
      font-size: 10px;
      color: var(--gt-primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
  `],
})
export class HeaderComponent {
  readonly authState = inject(AuthState);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  getInitials(): string {
    const u = this.authState.user();
    if (!u) return '?';
    return `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
  }
}
