import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { AuthState } from './auth.state';
import { AuthService } from './auth.service';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authState = inject(AuthState);
  const authService = inject(AuthService);

  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = authState.accessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = new Promise<boolean>((resolve) => {
            authService.refreshToken().subscribe({
              next: (result) => {
                isRefreshing = false;
                refreshPromise = null;
                resolve(!!result);
              },
              error: () => {
                isRefreshing = false;
                refreshPromise = null;
                resolve(false);
              },
            });
          });
        }

        return from(refreshPromise!).pipe(
          switchMap((success) => {
            if (!success) {
              return throwError(() => error);
            }
            const newToken = authState.accessToken();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next(retryReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
