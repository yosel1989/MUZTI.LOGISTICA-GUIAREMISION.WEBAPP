import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { GuiaRemisionHistorialListDTO } from './../models/guia-remision-historial.model';

/**
 * Servicio para consultar el historial de cambios de una guía de remisión.
 *
 * Base: `{apiUrl}/guia-remision-historial`
 */
@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionHistorialApiService {
  private baseUrl = `${environment.apiUrl}/guia-remision-historial`;

  constructor(private http: HttpClient) {}

  /**
   * Lista el historial de una guía de remisión.
   *
   * `GET /guia-remision-historial/{guiaRemisionId}`
   *
   * @param guiaRemisionId Id de la guía de remisión.
   * @returns Lista de eventos del historial de la guía.
   */
  obtenerTodoPorGuia(guiaRemisionId: number): Observable<GuiaRemisionHistorialListDTO[]> {
    return this.http.get<GuiaRemisionHistorialListDTO[]>(`${this.baseUrl}/${guiaRemisionId}`);
  }
  
}
