import { HttpErrorResponse } from '@angular/common/http';

/**
 * Error que emite el interceptor cuando la sesión expiró y no se pudo renovar el token.
 *
 * El interceptor ya avisa al usuario y lo envía al login, por eso
 * `ErrorHandlerService` lo ignora para no mostrar un segundo mensaje.
 */
export class SessionExpiredError extends HttpErrorResponse {
  constructor(url: string | null) {
    super({
      status: 401,
      statusText: 'Session Expired',
      url: url ?? undefined,
      error: { detalle: 'Tu sesión expiró. Vuelve a iniciar sesión.' }
    });
  }
}
