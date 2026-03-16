import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthState } from '../../core/auth/auth.state';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar class="header-toolbar">
      <span class="logo-text">Gloria Trade</span>
      <span class="spacer"></span>

      <button mat-icon-button (click)="themeService.toggle()" aria-label="Toggle theme">
        <mat-icon>{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</mat-icon>
      </button>

      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
        <mat-icon>account_circle</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <div class="user-info">
          <strong>{{ authState.displayName() }}</strong>
          <small>{{ authState.user()?.email }}</small>
        </div>
        <mat-divider></mat-divider>
        <button mat-menu-item (click)="authService.logout()">
          <mat-icon>logout</mat-icon>
          <span>Logout</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      background: transparent;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      height: 56px;
      padding: 0 16px;
    }
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #ffb300;
      letter-spacing: 0.5px;
    }
    .spacer {
      flex: 1;
    }
    .user-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .user-info small {
      color: #8c8c8c;
      font-size: 12px;
    }
  `],
})
export class HeaderComponent {
  readonly authState = inject(AuthState);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
}
