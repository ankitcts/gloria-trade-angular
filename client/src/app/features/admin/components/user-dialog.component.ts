import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AdminService } from '../services/admin.service';
import { UserRole, AccountStatus } from '../../../models/user.model';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name?: string;
    phone?: string;
    role: string;
    account_status: string;
    email_verified?: boolean;
  };
}

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="user-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.mode === 'create' ? 'person_add' : 'edit' }}</mat-icon>
        {{ data.mode === 'create' ? 'Add New User' : 'Edit User' }}
      </h2>

      <mat-dialog-content>
        <form class="dialog-form">
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput [(ngModel)]="form.first_name" name="firstName" required />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="form.last_name" name="lastName" required />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput [(ngModel)]="form.email" name="email" type="email" required
                   [disabled]="data.mode === 'edit'" />
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          @if (data.mode === 'create') {
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput [(ngModel)]="form.password" name="password" type="text" required />
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="generatePassword()">
                <mat-icon>autorenew</mat-icon>
              </button>
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput [(ngModel)]="form.phone" name="phone" type="tel" />
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Display Name</mat-label>
            <input matInput [(ngModel)]="form.display_name" name="displayName" />
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Role</mat-label>
              <mat-select [(ngModel)]="form.role" name="role">
                @for (r of roles; track r.value) {
                  <mat-option [value]="r.value">{{ r.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (data.mode === 'edit') {
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="form.account_status" name="status">
                  @for (s of statuses; track s.value) {
                    <mat-option [value]="s.value">{{ s.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            }
          </div>

          @if (data.mode === 'edit') {
            <mat-slide-toggle [(ngModel)]="form.email_verified" name="emailVerified">
              Email Verified
            </mat-slide-toggle>
          }

          @if (error()) {
            <div class="error-msg">{{ error() }}</div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-raised-button color="primary" (click)="onSubmit()"
                [disabled]="saving() || !form.first_name || !form.last_name || !form.email">
          @if (saving()) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            {{ data.mode === 'create' ? 'Create User' : 'Save Changes' }}
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-dialog { min-width: 480px; }
    h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    h2 mat-icon { color: var(--gt-primary, #2962ff); }
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .row { display: flex; gap: 12px; }
    .row mat-form-field { flex: 1; }
    mat-form-field { width: 100%; }
    .error-msg { background: var(--gt-loss-bg, rgba(239,83,80,0.12)); color: var(--gt-loss, #ef5350); padding: 8px 12px; border-radius: 6px; font-size: 13px; }
  `],
})
export class UserDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  readonly data: UserDialogData = inject(MAT_DIALOG_DATA);
  private readonly adminService = inject(AdminService);

  saving = signal(false);
  error = signal('');

  form = {
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    password: '',
    role: 'trader',
    account_status: 'active',
    email_verified: false,
  };

  roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'trader', label: 'Trader' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'viewer', label: 'Viewer' },
  ];

  statuses = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'pending_verification', label: 'Pending Verification' },
    { value: 'deactivated', label: 'Deactivated' },
  ];

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      const u = this.data.user;
      this.form.email = u.email;
      this.form.first_name = u.first_name;
      this.form.last_name = u.last_name;
      this.form.display_name = u.display_name || '';
      this.form.phone = u.phone || '';
      this.form.role = u.role;
      this.form.account_status = u.account_status;
      this.form.email_verified = u.email_verified || false;
    }
  }

  generatePassword(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    this.form.password = pwd;
  }

  onSubmit(): void {
    this.saving.set(true);
    this.error.set('');

    if (this.data.mode === 'create') {
      this.adminService.createUser({
        email: this.form.email,
        first_name: this.form.first_name,
        last_name: this.form.last_name,
        password: this.form.password,
        role: this.form.role,
        phone: this.form.phone || undefined,
      }).subscribe({
        next: () => { this.saving.set(false); this.dialogRef.close(true); },
        error: (err) => { this.saving.set(false); this.error.set(err.error?.detail || 'Failed to create user'); },
      });
    } else {
      const updates: Record<string, unknown> = {};
      const u = this.data.user!;
      if (this.form.first_name !== u.first_name) updates['first_name'] = this.form.first_name;
      if (this.form.last_name !== u.last_name) updates['last_name'] = this.form.last_name;
      if (this.form.display_name !== (u.display_name || '')) updates['display_name'] = this.form.display_name;
      if (this.form.phone !== (u.phone || '')) updates['phone'] = this.form.phone;
      if (this.form.role !== u.role) updates['role'] = this.form.role;
      if (this.form.account_status !== u.account_status) updates['account_status'] = this.form.account_status;
      if (this.form.email_verified !== (u.email_verified || false)) updates['email_verified'] = this.form.email_verified;

      if (Object.keys(updates).length === 0) {
        this.dialogRef.close(false);
        return;
      }

      this.adminService.updateUser(u.id, updates).subscribe({
        next: () => { this.saving.set(false); this.dialogRef.close(true); },
        error: (err) => { this.saving.set(false); this.error.set(err.error?.detail || 'Failed to update user'); },
      });
    }
  }
}
