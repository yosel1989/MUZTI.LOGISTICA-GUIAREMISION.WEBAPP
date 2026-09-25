import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { SunatMotivoTrasladoDto } from "../models/sunat-catalogo.model";
import { InvoiceTypeToSelectDto } from "../models/catalogo.model";

/**
 * Servicio para consumir los catálogos de SUNAT.
 *
 * Base: `{apiUrl}/sunat-catalogo`
 */
@Injectable({
  providedIn: 'root'
})

export class SunatCatalogoApiService {
  private baseUrl = `${environment.apiUrl}/sunat-catalogo`;

  constructor(private http: HttpClient) {}

  /**
   * Lista los motivos de traslado de SUNAT.
   *
   * `GET /sunat-catalogo/motivos-traslado`
   *
   * @returns Lista de motivos de traslado.
   */
  loadMotivosTraslado(): Observable<SunatMotivoTrasladoDto[]> {
    return this.http.get<SunatMotivoTrasladoDto[]>(`${this.baseUrl}/motivos-traslado`);
  }

  /**
   * Lista los tipos de comprobante de SUNAT.
   *
   * `GET /sunat-catalogo/invoice-types`
   *
   * @returns Lista de tipos de comprobante en formato para select.
   */
  loadInvoiceTypes(): Observable<InvoiceTypeToSelectDto[]> {
    return this.http.get<InvoiceTypeToSelectDto[]>(`${this.baseUrl}/invoice-types`);
  }
  
}
