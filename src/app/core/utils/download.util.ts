import { HttpHeaders } from '@angular/common/http';

/**
 * Obtiene el nombre de archivo del header `Content-Disposition` de una descarga.
 *
 * Prioriza `filename*=UTF-8''...` (admite tildes y ñ) sobre `filename=...`,
 * y quita las comillas si el nombre viene entre ellas.
 *
 * @param headers Headers de la respuesta (`observe: 'response'`).
 * @param fallback Nombre a usar si el header no viene o no trae nombre.
 *
 * @example
 * // Content-Disposition: attachment; filename=guia.pdf; filename*=UTF-8''gu%C3%ADa.pdf
 * getFilenameFromHeaders(res.headers, 'archivo.pdf'); // 'guía.pdf'
 */
export function getFilenameFromHeaders(headers: HttpHeaders, fallback: string): string {
  const header = headers.get('content-disposition');
  if (!header) return fallback;

  const utf8 = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8) return decodeURIComponent(utf8[1].trim());

  const plain = header.match(/filename\s*=\s*"?([^";]+)"?/i);
  return plain ? plain[1].trim() : fallback;
}
