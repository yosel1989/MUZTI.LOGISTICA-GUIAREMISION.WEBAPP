import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AlertService } from '@core/services/alert.service';
import { SessionExpiredError } from '@core/models/session-expired-error';

/**
 * Centraliza la notificación de errores al usuario.
 *
 * Úsalo dentro del bloque `error` de un `subscribe` en lugar de llamar
 * directamente a `AlertService.showToast`. La lógica propia del componente
 * (loaders, limpiar datos, habilitar formularios) se mantiene en el componente.
 *
 * @example
 * private errorHandler = inject(ErrorHandlerService);
 *
 * this.api.getAll().subscribe({
 *   next: (res) => this.data.set(res),
 *   error: (err: HttpErrorResponse) => {
 *     this.loading.set(false);
 *     this.errorHandler.handle(err);
 *   }
 * });
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private alertService = inject(AlertService);

  private readonly defaultMessage = 'Ocurrió un error, intente nuevamente.';
  private readonly offlineMessage = 'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.';

  /**
   * Muestra un toast con el mensaje de error devuelto por la API.
   *
   * El mensaje se toma, en este orden, de:
   * 1. `err.error.detalle`
   * 2. `err.error.error`
   * 3. Mensaje de conexión, si no hubo respuesta del servidor (`status 0`)
   * 4. `fallback` (o el mensaje por defecto si no se envía)
   *
   * No muestra nada si la sesión expiró (`SessionExpiredError`),
   * porque el interceptor ya avisó al usuario y lo envió al login.
   *
   * @param err Error recibido en el bloque `error` del `subscribe`.
   * @param fallback Mensaje a mostrar si la API no envía `detalle` ni `error`
   * (por ejemplo, errores de red o de timeout).
   *
   * @example
   * this.errorHandler.handle(err);
   * this.errorHandler.handle(err, 'No se pudo cargar las guías');
   */
  handle(err: HttpErrorResponse, fallback: string = this.defaultMessage): void {
    if (err instanceof SessionExpiredError) return;

    const offline = err?.status === 0 ? this.offlineMessage : null;
    this.showError(err?.error?.detalle ?? err?.error?.error ?? offline ?? fallback);
  }

  /**
   * Muestra un toast de error con un mensaje fijo, sin leer la respuesta HTTP.
   *
   * Útil cuando el mensaje no viene en `HttpErrorResponse`, por ejemplo al
   * leer un error que llega como `Blob` en descargas de archivos.
   *
   * @param message Texto que se mostrará en el toast.
   *
   * @example
   * this.errorHandler.showError('No se pudo obtener las entidades');
   */
  showError(message: string): void {
    this.alertService.error(message);
  }

}
