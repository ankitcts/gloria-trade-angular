import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ENDPOINTS } from '../api/endpoints';
import { AuthState } from './auth.state';
import { LoginRequest, RegisterRequest, TokenResponse } from '../../models/auth.model';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  login(credentials: LoginRequest): Observable<User> {
    return this.api.post<TokenResponse>(ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((tokens) => this.authState.setTokens(tokens.access_token, tokens.refresh_token)),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.api.post<TokenResponse>(ENDPOINTS.AUTH.REGISTER, data).pipe(
      tap((tokens) => this.authState.setTokens(tokens.access_token, tokens.refresh_token)),
      switchMap(() => this.fetchCurrentUser())
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.api.get<User>(ENDPOINTS.AUTH.ME).pipe(
      tap((user) => this.authState.setUser(user))
    );
  }

  refreshToken(): Observable<TokenResponse | null> {
    const refreshToken = this.authState.refreshToken();
    if (!refreshToken) {
      this.authState.clear();
      return of(null);
    }
    return this.api
      .post<TokenResponse>(ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken })
      .pipe(
        tap((tokens) => this.authState.setTokens(tokens.access_token, tokens.refresh_token)),
        catchError(() => {
          this.authState.clear();
          this.router.navigate(['/login']);
          return of(null);
        })
      );
  }

  logout(): void {
    const refreshToken = this.authState.refreshToken();
    if (refreshToken) {
      this.api.post(ENDPOINTS.AUTH.LOGOUT, { refresh_token: refreshToken }).subscribe();
    }
    this.authState.clear();
    this.router.navigate(['/login']);
  }

  initialize(): Observable<User | null> {
    if (!this.authState.accessToken()) {
      this.authState.markInitialized();
      return of(null);
    }
    return this.fetchCurrentUser().pipe(
      catchError(() => {
        this.authState.clear();
        return of(null);
      })
    );
  }
}
