import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { GuiaRemisionDto } from "app/features/guia-remision/models/guia-remision.model";
import { TableData } from "app/core/models/table";
import { ColumnsFilterDto } from "app/core/models/filter";
import { getFilenameFromHeaders } from "@core/utils/download.util";

/**
 * Servicio para consumir los endpoints de guías de remisión (listado, exportación, cambios de estado y PDF).
 *
 * Base: `{apiUrl}/GuiaRemision`
 */
@Injectable({
  providedIn: 'root'
})

export class GuiaRemisionApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemision`;

  constructor(private http: HttpClient) {}

  /**
   * Convierte los filtros por columna al formato `columns[i][...]` que espera la API.
   *
   * `HttpParams` es inmutable: cada `set()` devuelve una copia, por eso se reasigna.
   */
  private buildFilterParams(filters: ColumnsFilterDto[]): HttpParams {
    let params = new HttpParams();

    filters.forEach((col, i) => {
      params = params
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value ?? '');

      if (col.search.regex) {
        params = params.set(`columns[${i}][search][regex]`, String(col.search.regex));
      }
      if (col.search.match) {
        params = params.set(`columns[${i}][search][match]`, col.search.match);
      }
    });

    return params;
  }

  /**
   * Lista las guías de remisión de forma paginada, aplicando filtros por columna.
   *
   * `GET /GuiaRemision/listar/{pageNumber}/{pageSize}?columns[i][data]=&columns[i][search][value]=`
   *
   * @param pageNumber Número de página.
   * @param pageSize Cantidad de registros por página.
   * @param filters Filtros por columna; cada uno se envía como `columns[i][...]`.
   * @returns Página de guías de remisión con el total de registros.
   */
  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<GuiaRemisionDto[]>> {
    const httpParams = this.buildFilterParams(filters);

    return this.http.get<TableData<GuiaRemisionDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams });
  }

  /**
   * Obtiene una guía de remisión por su UUID.
   *
   * `GET /GuiaRemision/buscar-por-uuid/{uuid}`
   *
   * @param uuid UUID de la guía de remisión.
   * @returns Datos de la guía de remisión.
   */
  buscarPorUuid(uuid: string): Observable<GuiaRemisionDto> {
    return this.http.get<GuiaRemisionDto>(`${this.baseUrl}/buscar-por-uuid/${uuid}`);
  }

  /**
   * Exporta a Excel las guías de remisión que cumplen los filtros.
   *
   * `GET /GuiaRemision/exportar?columns[i][data]=&columns[i][search][value]=`
   *
   * @param filters Filtros por columna; los mismos que usa `obtenerTodo`.
   * @returns Archivo generado como `Blob`.
   */
  exportarTodo(filters: ColumnsFilterDto[]): Observable<Blob> {
    const httpParams = this.buildFilterParams(filters);

    return this.http.get(`${this.baseUrl}/exportar`, {
      params: httpParams,
      responseType: 'blob'
    });

  }

  /**
   * Confirma una guía de remisión.
   *
   * `PUT /GuiaRemision/{id}/confirmar`
   *
   * @param id Id de la guía de remisión.
   * @returns La guía de remisión con su estado actualizado.
   */
  confirmar(id: number): Observable<GuiaRemisionDto> {
    return this.http.put<GuiaRemisionDto>(`${this.baseUrl}/${id}/confirmar`,{});
  }

  /**
   * Rechaza una guía de remisión.
   *
   * `PUT /GuiaRemision/{id}/rechazar`
   *
   * @param id Id de la guía de remisión.
   * @param descripcion Motivo del rechazo (opcional).
   * @returns La guía de remisión con su estado actualizado.
   */
  rechazar(id: number, descripcion: string | null): Observable<GuiaRemisionDto> {
    return this.http.put<GuiaRemisionDto>(`${this.baseUrl}/${id}/rechazar`,{id, descripcion});
  }

  /**
   * Anula una guía de remisión.
   *
   * `PUT /GuiaRemision/{id}/anular`
   *
   * @param id Id de la guía de remisión.
   * @param descripcion Motivo de la anulación (opcional).
   * @returns La guía de remisión con su estado actualizado.
   */
  anular(id: number, descripcion: string | null): Observable<GuiaRemisionDto> {
    return this.http.put<GuiaRemisionDto>(`${this.baseUrl}/${id}/anular`,{id, descripcion});
  }

  /**
   * Solicita el documento PDF de una guía de remisión.
   *
   * `GET /GuiaRemision/pdf/{guiaRemisionId}/{entityId}`
   *
   * @param guiaRemisionId Id de la guía de remisión.
   * @param entityId Id de la entidad (empresa) emisora.
   * @returns Respuesta de la API con el documento.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDocument(guiaRemisionId: string, entityId: string): Observable<any> {
    return this.http.get<GuiaRemisionDto>(`${this.baseUrl}/pdf/${guiaRemisionId}/${entityId}`);
  }


  /**
   * Descarga el PDF interno de una guía de remisión.
   *
   * `GET /GuiaRemision/pdf-internal/{guiaRemisionId}/{entityId}`
   *
   * @param guiaRemisionId Id de la guía de remisión.
   * @param entityId Id de la entidad (empresa) emisora.
   * @returns El PDF como `Blob` y el nombre de archivo tomado de `Content-Disposition`
   * (por defecto `guia-remision.pdf`).
   */
  getDocumentPdfInternal(guiaRemisionId: number, entityId: number): Observable<{ blob: Blob; filename: string }> {
    return this.http.get(`${this.baseUrl}/pdf-internal/${guiaRemisionId}/${entityId}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(res => ({
        blob: res.body as Blob,
        filename: getFilenameFromHeaders(res.headers, 'guia-remision.pdf')
      }))
    );
  }
}
