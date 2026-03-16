import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../../core/auth/auth.state';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      @for (item of visibleItems(); track item.route) {
        <a mat-list-item
           [routerLink]="item.route"
           routerLinkActive="active-link"
           [routerLinkActiveOptions]="{ exact: item.route === '/' }">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      }
    </mat-nav-list>
  `,
  styles: [`
    :host {
      display: block;
      padding-top: 8px;
    }
    .active-link {
      background: rgba(41, 98, 255, 0.1);
      border-right: 3px solid var(--gt-primary, #2962ff);
    }
    mat-icon {
      color: var(--gt-text-secondary, #787b86);
    }
    .active-link mat-icon {
      color: var(--gt-primary, #2962ff);
    }
  `],
})
export class SidebarComponent {
  private readonly authState = inject(AuthState);

  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Securities', icon: 'trending_up', route: '/securities' },
    { label: 'Trading', icon: 'swap_horiz', route: '/trading' },
    { label: 'Portfolio', icon: 'account_balance_wallet', route: '/portfolio' },
    { label: 'Predictions', icon: 'insights', route: '/predictions' },
    { label: 'Watchlist', icon: 'visibility', route: '/watchlist' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Admin', icon: 'admin_panel_settings', route: '/admin', adminOnly: true },
  ];

  readonly visibleItems = () => {
    const isAdmin = this.authState.isAdmin();
    return this.navItems.filter((item) => !item.adminOnly || isAdmin);
  };
}
