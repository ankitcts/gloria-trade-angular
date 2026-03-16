import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav mode="side" opened class="shell-sidenav">
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content class="shell-content">
        <app-header />
        <main class="main-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container {
      height: 100vh;
    }
    .shell-sidenav {
      width: 220px;
      background: var(--gt-bg-card) !important;
      border-right: 1px solid var(--gt-border) !important;
    }
    .shell-content {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .main-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
  `],
})
export class AppShellComponent {}
