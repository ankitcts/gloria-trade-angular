import { Component, inject, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AdminService } from './services/admin.service';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { UserRole, AccountStatus } from '../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    UpperCasePipe,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule,
    RelativeTimePipe,
  ],
  template: `
    <div class="admin-page">
      <h1 class="page-title">Admin Panel</h1>

      <!-- User Management -->
      <mat-card>
        <mat-card-header>
          <div class="card-header-row">
            <div>
              <mat-card-title>User Management</mat-card-title>
              <mat-card-subtitle>{{ adminService.totalUsers() }} total users</mat-card-subtitle>
            </div>
            <button mat-raised-button color="primary" (click)="openAddUser()">
              <mat-icon>person_add</mat-icon>
              Add User
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          @if (adminService.loading()) {
            <div class="loading-container">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="adminService.users()" class="users-table">
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let row">
                  <div class="user-cell">
                    <span class="user-name">{{ row.first_name }} {{ row.last_name }}</span>
                    <span class="user-email">{{ row.email }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let row">
                  <span class="role-badge" [class]="'role-' + row.role">{{ row.role | uppercase }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="status-badge" [class]="'status-' + row.account_status">
                    {{ row.account_status.replace('_', ' ') }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="kyc">
                <th mat-header-cell *matHeaderCellDef>KYC</th>
                <td mat-cell *matCellDef="let row">{{ row.kyc_status?.replace('_', ' ') || '--' }}</td>
              </ng-container>

              <ng-container matColumnDef="last_login">
                <th mat-header-cell *matHeaderCellDef>Last Login</th>
                <td mat-cell *matCellDef="let row">{{ row.last_login_at | relativeTime }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="openEditUser(row)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit User</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="changeRole(row.id, 'admin')">Set Admin</button>
                    <button mat-menu-item (click)="changeRole(row.id, 'trader')">Set Trader</button>
                    <button mat-menu-item (click)="changeRole(row.id, 'analyst')">Set Analyst</button>
                    <button mat-menu-item (click)="changeRole(row.id, 'viewer')">Set Viewer</button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="changeStatus(row.id, 'active')">Activate</button>
                    <button mat-menu-item (click)="changeStatus(row.id, 'suspended')">Suspend</button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="resetPassword(row.id, row.email)">
                      <mat-icon>lock_reset</mat-icon>
                      <span>Reset Password</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1100px; }
    .card-header-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .page-title { font-size: 24px; font-weight: 600; margin-bottom: 20px; }
    .loading-container { display: flex; justify-content: center; padding: 32px; }
    .users-table { width: 100%; }
    .user-cell { display: flex; flex-direction: column; }
    .user-name { font-weight: 500; }
    .user-email { font-size: 12px; color: #8c8c8c; }
    .role-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .role-admin { background: rgba(255,179,0,0.15); color: #ffb300; }
    .role-trader { background: rgba(66,165,245,0.12); color: #42a5f5; }
    .role-analyst { background: rgba(171,71,188,0.12); color: #ab47bc; }
    .role-viewer { background: rgba(140,140,140,0.1); color: #8c8c8c; }
    .status-badge { font-size: 12px; text-transform: capitalize; }
    .status-active { color: #66bb6a; }
    .status-suspended { color: #ef5350; }
    .status-pending_verification { color: #ffa726; }
    .status-deactivated { color: #8c8c8c; }
  `],
})
export default class AdminComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  displayedColumns = ['email', 'role', 'status', 'kyc', 'last_login', 'actions'];

  ngOnInit(): void {
    this.adminService.loadUsers();
  }

  changeRole(userId: string, role: string): void {
    this.adminService.updateRole(userId, role as UserRole);
  }

  changeStatus(userId: string, status: string): void {
    this.adminService.updateStatus(userId, status as AccountStatus);
  }

  openAddUser(): void {
    import('./components/user-dialog.component').then((m) => {
      const ref = this.dialog.open(m.UserDialogComponent, {
        data: { mode: 'create' },
        width: '520px',
      });
      ref.afterClosed().subscribe((created) => {
        if (created) {
          this.snackBar.open('User created. Welcome email sent.', 'OK', { duration: 3000 });
          this.adminService.loadUsers();
        }
      });
    });
  }

  openEditUser(user: any): void {
    import('./components/user-dialog.component').then((m) => {
      const ref = this.dialog.open(m.UserDialogComponent, {
        data: { mode: 'edit', user },
        width: '520px',
      });
      ref.afterClosed().subscribe((updated) => {
        if (updated) {
          this.snackBar.open('User updated.', 'OK', { duration: 3000 });
          this.adminService.loadUsers();
        }
      });
    });
  }

  resetPassword(userId: string, email: string): void {
    if (!confirm(`Reset password for ${email}? A new password will be sent to their email.`)) {
      return;
    }
    this.adminService.resetPassword(userId).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'OK', { duration: 5000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.detail || 'Failed to reset password', 'OK', { duration: 3000 });
      },
    });
  }
}
