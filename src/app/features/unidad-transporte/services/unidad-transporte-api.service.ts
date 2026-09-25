import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { TableData } from "app/core/models/table";
import { EditarUnidadTransporteRequestDto, EliminarUnidadTransporteResponseDto, RegistrarUnidadTransporteRequestDto, RegistrarUnidadTransporteResponseDto, UnidadTransporteDto, UnidadTransporteSugeridoDto } from "../models/unidad-transporte.model";
import { ResponseDTO } from "@features/shared/models/shared";
import { ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";

/**
 * Servicio para consumir los endpoints de unidades de transporte (vehículos).
 *
 * Base: `{apiUrl}/unidad-transporte`
 */
@Injectable({
  providedIn: 'root'
})
export class UnidadTransporteApiService {
  private baseUrl = `${environment.apiUrl}/unidad-transporte`;

  constructor(private http: HttpClient) {}

  /**
   * Lista las unidades de transporte de forma paginada.
   *
   * `GET /unidad-transporte/listar/{pageNumber}/{pageSize}?search=`
   *
   * @param pageNumber Número de página.
   * @param pageSize Cantidad de registros por página.
   * @param search Texto para filtrar; si es `null` no se filtra.
   * @returns Página de unidades de transporte con el total de registros.
   */
  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<UnidadTransporteDto[]>> {
    
    let httpParams = new HttpParams();
    if (search) {
      httpParams = httpParams.set('search', search);
    }
    
    return this.http.get<TableData<UnidadTransporteDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams });
  }

  /**
   * Registra una nueva unidad de transporte.
   *
   * `POST /unidad-transporte`
   *
   * @param request Datos de la unidad a registrar.
   * @returns Respuesta de la API con el resultado del registro.
   */
  registrar(request: RegistrarUnidadTransporteRequestDto): Observable<RegistrarUnidadTransporteResponseDto> {
    return this.http.post<RegistrarUnidadTransporteResponseDto>(`${this.baseUrl}`, request);
  }

  /**
   * Obtiene una unidad de transporte por su id.
   *
   * `GET /unidad-transporte/buscar-por-id/{id}`
   *
   * @param id Id de la unidad de transporte.
   * @returns La unidad con `created_at` y `updated_at` convertidos a `Date`.
   */
  getById(id: number): Observable<UnidadTransporteDto> {
    return this.http.get<UnidadTransporteDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ 
        return {
          ...response,
          created_at: new Date(response.created_at),
          updated_at: response.updated_at ? new Date(response.updated_at) : null
        } as UnidadTransporteDto 
      })
    );
  }

  /**
   * Actualiza los datos de una unidad de transporte.
   *
   * `PUT /unidad-transporte/{id}`
   *
   * @param id Id de la unidad a editar.
   * @param request Datos actualizados de la unidad.
   * @returns La unidad actualizada, con fechas como `Date` y los flags
   * `loading_active` / `loading_update` en `false` para usarla en la tabla.
   */
  editar(id: number, request: EditarUnidadTransporteRequestDto): Observable<ResponseDTO<UnidadTransporteDto>> {
    return this.http.put<ResponseDTO<UnidadTransporteDto>>(`${this.baseUrl}/${id}`, request).pipe(
      map((response: ResponseDTO<UnidadTransporteDto>) => ({
        ...response,
        data: {
          ...response.data,
          created_at: new Date(response.data.created_at),
          updated_at: response.data.updated_at ? new Date(response.data.updated_at) : null,
          loading_active: false,
          loading_update: false
        }
      }) )
    );
  }

  /**
   * Elimina una unidad de transporte.
   *
   * `DELETE /unidad-transporte/{id}`
   *
   * @param id Id de la unidad a eliminar.
   * @returns Respuesta de la API con el resultado de la eliminación.
   */
  eliminar(id: number): Observable<EliminarUnidadTransporteResponseDto> {
    return this.http.delete<EliminarUnidadTransporteResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activa o desactiva una unidad de transporte.
   *
   * `PUT /unidad-transporte/{id}/actualizar-estado`
   *
   * @param id Id de la unidad.
   * @param request Nuevo estado de la unidad.
   * @returns El estado actualizado, con `updated_at` como `Date`.
   */
  toogleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
    return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>({
        ...response,
        data: {
          ...response.data,
          updated_at: response.data.updated_at ? new Date(response.data.updated_at) : null
        }
      }))
    );
  }
  
  /**
   * Busca unidades de transporte sugeridas (autocompletado).
   *
   * `GET /unidad-transporte/listar-sugerido?numeroDoc=`
   *
   * @param texto Texto a buscar; si es `null` se envía sin filtro.
   * @returns Lista de unidades que coinciden con la búsqueda.
   */
  buscar(texto: string | null): Observable<UnidadTransporteSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<UnidadTransporteSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params });
  }
}
