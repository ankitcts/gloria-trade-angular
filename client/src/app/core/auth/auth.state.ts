import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../../models/user.model';

const ACCESS_TOKEN_KEY = 'gloria_access_token';
const REFRESH_TOKEN_KEY = 'gloria_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly _user = signal<User | null>(null);
  private readonly _accessToken = signal<string | null>(
    localStorage.getItem(ACCESS_TOKEN_KEY)
  );
  private readonly _refreshToken = signal<string | null>(
    localStorage.getItem(REFRESH_TOKEN_KEY)
  );
  private readonly _initialized = signal(false);

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();
  readonly initialized = this._initialized.asReadonly();

  readonly isAuthenticated = computed(() => !!this._accessToken());
  readonly isAdmin = computed(() => this._user()?.role === UserRole.ADMIN);
  readonly displayName = computed(() => {
    const u = this._user();
    return u ? u.display_name || `${u.first_name} ${u.last_name}` : '';
  });

  setTokens(accessToken: string, refreshToken: string): void {
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  setUser(user: User): void {
    this._user.set(user);
    this._initialized.set(true);
  }

  clear(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._initialized.set(true);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  markInitialized(): void {
    this._initialized.set(true);
  }
}
