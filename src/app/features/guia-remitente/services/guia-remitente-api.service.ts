import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { GR_EmitirGuiaRemisionResponseDto, GR_EnviarGuiaRemisionResponseDto, GuiaRemisionRemitenteRequestDto } from "app/features/guia-remision/models/guia-remision.model";

/**
 * Servicio para registrar y aprobar guías de remisión remitente.
 *
 * Base: `{apiUrl}/GuiaRemision`
 */
@Injectable({
  providedIn: 'root'
})
export class GuiaRemitenteApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemision`;

  constructor(private http: HttpClient) {}

  /**
   * Registra una guía de remisión remitente.
   *
   * `POST /GuiaRemision/registrar-remitente/{ruc}`
   *
   * @param request Datos de la guía de remisión.
   * @param ruc RUC del remitente.
   * @returns Respuesta de la API con los datos de la guía registrada.
   */
  saveRemisionRemitente(request: GuiaRemisionRemitenteRequestDto, ruc: string): Observable<GR_EnviarGuiaRemisionResponseDto> {
    return this.http.post<GR_EnviarGuiaRemisionResponseDto>(`${this.baseUrl}/registrar-remitente/${ruc}`, request);
  }

  /**
   * Aprueba una guía de remisión para su emisión.
   *
   * `POST /GuiaRemision/{guiaId}/aprobar`
   *
   * @param guiaId Id de la guía de remisión.
   * @returns Respuesta de la API con el resultado de la emisión.
   */
  aprobarGuiaRemision(guiaId: number): Observable<GR_EmitirGuiaRemisionResponseDto> {
    return this.http.post<GR_EmitirGuiaRemisionResponseDto>(`${this.baseUrl}/${guiaId}/aprobar`,{});
  }

}
