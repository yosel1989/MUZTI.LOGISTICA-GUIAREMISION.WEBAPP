import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { ConductorByNumeroDocumento, ConductorDto, ConductorSugeridoDto, EditarConductorRequestDto, EliminarConductorResponseDto, RegistrarConductorRequestDto, RegistrarConductorResponseDto } from "../models/conductor.model";
import { TableData } from "app/core/models/table";
import { ResponseDTO } from '@features/shared/models/shared';
import { ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";

/**
 * Servicio para consumir los endpoints de conductores.
 *
 * Base: `{apiUrl}/conductores`
 */
@Injectable({
  providedIn: 'root'
})
export class ConductorApiService {
  private baseUrl = `${environment.apiUrl}/conductores`;

  constructor(private http: HttpClient) {}

  /**
   * Lista los conductores de forma paginada.
   *
   * `GET /conductores/listar/{pageNumber}/{pageSize}?search=`
   *
   * @param pageNumber Número de página.
   * @param pageSize Cantidad de registros por página.
   * @param search Texto para filtrar; si es `null` no se filtra.
   * @returns Página de conductores con el total de registros.
   */
  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<ConductorDto[]>> {

    let httpParams = new HttpParams();
    httpParams = search 
      ? httpParams.set('search', search) 
      : httpParams;

    return this.http.get<TableData<ConductorDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams });
  }
 
  /**
   * Registra un nuevo conductor.
   *
   * `POST /conductores`
   *
   * @param request Datos del conductor a registrar.
   * @returns Respuesta de la API con el resultado del registro.
   */
  registrar(request: RegistrarConductorRequestDto): Observable<RegistrarConductorResponseDto> {
    return this.http.post<RegistrarConductorResponseDto>(`${this.baseUrl}`, request);
  }

  /**
   * Obtiene un conductor por su id.
   *
   * `GET /conductores/buscar-por-id/{id}`
   *
   * @param id Id del conductor.
   * @returns Datos del conductor.
   */
  buscarPorId(id: number): Observable<ConductorDto> {
    return this.http.get<ConductorDto>(`${this.baseUrl}/buscar-por-id/${id}`);
  }

  /**
   * Actualiza los datos de un conductor.
   *
   * `PUT /conductores/{request.id}`
   *
   * @param request Datos actualizados; `request.id` indica el conductor a editar.
   * @returns El conductor actualizado, con `fecha_registro` y `fecha_modifico` como `Date`.
   */
  editar(request: EditarConductorRequestDto): Observable<ResponseDTO<ConductorDto>> {
    return this.http.put<ResponseDTO<ConductorDto>>(`${this.baseUrl}/${request.id}`, request).pipe(
      map(response =>({
        ...response,
        data: {
          ...response.data,
          fecha_registro: new Date(response.data.fecha_registro),
          fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
        }
      }))
    );
  }

  /**
   * Busca un conductor por su número de documento.
   *
   * `GET /conductores/buscar-por-numero-documento/{numeroDocumento}`
   *
   * @param numeroDocumento DNI u otro documento del conductor.
   * @returns Datos del conductor, con `fecha_registro` como `Date`.
   */
  getByNumeroDocumento(numeroDocumento: string): Observable<ConductorByNumeroDocumento> {
    return this.http.get<ConductorByNumeroDocumento>(`${this.baseUrl}/buscar-por-numero-documento/${numeroDocumento}`).pipe(
      map(response => { 
        return { 
          ...response, 
          fecha_registro: new Date(response.fecha_registro) 
        } as ConductorByNumeroDocumento; }
      )
    );
  }

  /**
   * Elimina un conductor.
   *
   * `DELETE /conductores/{id}`
   *
   * @param id Id del conductor a eliminar.
   * @returns Respuesta de la API con el resultado de la eliminación.
   */
  eliminar(id: number): Observable<EliminarConductorResponseDto> {
    return this.http.delete<EliminarConductorResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activa o desactiva un conductor.
   *
   * `PUT /conductores/{id}/actualizar-estado`
   *
   * @param id Id del conductor.
   * @param request Nuevo estado (activo/inactivo).
   * @returns El estado actualizado, con `fecha_modifico` como `Date`.
   */
  actualizarEstado(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
    return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>({ 
        ...response,
        data: {
          ...response.data,
          fecha_modifico: response.data.updated_at ? new Date(response.data.updated_at) : null
        }
      }))
    );
  }

  /**
   * Busca conductores sugeridos (autocompletado).
   *
   * `GET /conductores/listar-sugerido?numeroDoc=`
   *
   * @param texto Texto a buscar; si es `null` se envía sin filtro.
   * @returns Lista de conductores que coinciden con la búsqueda.
   */
  buscarSugerido(texto: string | null): Observable<ConductorSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<ConductorSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params });
  }
    
}
