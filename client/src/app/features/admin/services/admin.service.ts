import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { ENDPOINTS } from '../../../core/api/endpoints';
import { AdminUserDetail, UserRole, AccountStatus } from '../../../models/user.model';
import { PaginatedResponse } from '../../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  private readonly _users = signal<any[]>([]);
  private readonly _loading = signal(false);
  private readonly _totalUsers = signal(0);

  readonly users = this._users.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly totalUsers = this._totalUsers.asReadonly();

  loadUsers(page = 1, role?: string): void {
    this._loading.set(true);
    const params: Record<string, string | number> = { page, page_size: 20 };
    if (role) params['role'] = role;

    this.api.get<PaginatedResponse<any>>(ENDPOINTS.ADMIN.USERS, params).subscribe({
      next: (res) => {
        this._users.set(res.items);
        this._totalUsers.set(res.total);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  updateRole(userId: string, role: UserRole): void {
    this.api.put(ENDPOINTS.ADMIN.USER_ROLE(userId), { role }).subscribe({
      next: () => this.loadUsers(),
    });
  }

  updateStatus(userId: string, status: AccountStatus): void {
    this.api.put(ENDPOINTS.ADMIN.USER_STATUS(userId), { status }).subscribe({
      next: () => this.loadUsers(),
    });
  }

  resetPassword(userId: string): import('rxjs').Observable<{ id: string; email: string; email_sent: boolean; message: string }> {
    return this.api.post<{ id: string; email: string; email_sent: boolean; message: string }>(
      ENDPOINTS.ADMIN.RESET_PASSWORD(userId)
    );
  }
}
