import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AlertService } from '../services/alert.service';
import { SessionExpiredError } from '../models/session-expired-error';
import { environment } from 'environments/environment';
import { catchError, finalize, Observable, retry, shareReplay, switchMap, throwError, timer } from 'rxjs';
import { AuthApiService } from 'app/features/auth/services/auth-api.service';

/** Reintentos del refresh cuando falla por red o por el servidor. */
const REFRESH_MAX_RETRIES = 2;
/** Espera antes del primer reintento; se duplica en cada intento (1 s, 2 s). */
const REFRESH_RETRY_DELAY_MS = 1000;

/** Refresh en curso, compartido por todas las peticiones que reciben 401 al mismo tiempo. */
let refresh$: Observable<string> | null = null;

/** Sin conexión o error del servidor: la sesión puede seguir siendo válida. */
const isTransientError = (err: HttpErrorResponse): boolean => err.status === 0 || err.status >= 500;

/**
 * Agrega el token y los headers comunes a cada petición.
 *
 * Si una petición recibe 401, renueva el token y la repite:
 * - Si el refresh falla por red o servidor, lo reintenta hasta `REFRESH_MAX_RETRIES` veces.
 *   Si aun así falla, propaga el error sin cerrar la sesión.
 * - Si el refresh es rechazado (sesión expirada), cierra la sesión y envía al login
 *   con `returnUrl` para volver a la misma pantalla.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthApiService);
  const alertService = inject(AlertService);
  const router = inject(Router);

  const ignoredUrls = [
    'https://via.placeholder.com/',
    `${environment.apiAuthUrl}/refreshToken`,
    `${environment.apiAuthUrl}/logout`
  ];

  if (ignoredUrls.some(url => req.url.startsWith(url))) {
    return next(req);
  }

  const withAuth = (token: string | null) => req.clone({
    setHeaders: {
      Authorization: token ? `Bearer ${token}` : '',
      AppId: environment.appId.toString(),
      ...(req.body instanceof FormData ? {} : { 'Content-Type': 'application/json' })
    }
  });

  return next(withAuth(storageService.getToken())).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = req.url.startsWith(`${environment.apiAuthUrl}/login`);
      if (error.status !== 401 || isLogin) {
        return throwError(() => error);
      }

      // La sesión ya se cerró (por ejemplo, otra petición falló antes): no hay nada que renovar.
      if (!storageService.getRefreshToken()) {
        return throwError(() => new SessionExpiredError(req.url));
      }

      refresh$ ??= authService.refreshToken().pipe(
        retry({
          count: REFRESH_MAX_RETRIES,
          delay: (err: HttpErrorResponse, retryCount: number) => isTransientError(err)
            ? timer(REFRESH_RETRY_DELAY_MS * 2 ** (retryCount - 1))
            : throwError(() => err)
        }),
        catchError((refreshError: HttpErrorResponse) => {
          if (isTransientError(refreshError)) {
            return throwError(() => refreshError);
          }
          alertService.warning('Tu sesión expiró. Vuelve a iniciar sesión.');
          authService.endSession(router.url);
          return throwError(() => new SessionExpiredError(req.url));
        }),
        finalize(() => refresh$ = null),
        shareReplay(1)
      );

      return refresh$.pipe(
        switchMap(token => next(withAuth(token)))
      );
    })
  );
};
