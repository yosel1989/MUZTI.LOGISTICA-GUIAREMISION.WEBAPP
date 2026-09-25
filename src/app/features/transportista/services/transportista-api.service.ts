import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoResponseDto, EliminarResponseDto, ResponseDTO } from "@features/shared/models/shared";
import { EditarTransportistaRequestDto, RegistrarTransportistaRequestDto, RegistrarTransportistaResponseDto, TransportistaDto, TransportistaSugeridoDto } from "../models/transportista";
import { ToggleActiveRequestDto } from "app/shared/models/request";

/**
 * Servicio para consumir los endpoints de transportistas.
 *
 * Base: `{apiUrl}/transportista`
 */
@Injectable({
  providedIn: 'root'
})
export class TransportistaApiService {
  private baseUrl = `${environment.apiUrl}/transportista`;

  constructor(private http: HttpClient) {}

  /*getToSelect(): Observable<RemitenteToSelect[]> {
    return this.http.get<RemitenteToSelect[]>(`${this.baseUrl}/listar-select`);
  }

  getToFilter(): Observable<RemitenteNombre[]> {
    return this.http.get<RemitenteNombre[]>(`${this.baseUrl}/listar-nombres`);
  }

  getByIdToGuia(idRemitente: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<RemitenteByIdToGuia> {
    return this.http.get<RemitenteByIdToGuia>(`${this.baseUrl}/buscar-por-id-para-guia/${idRemitente}/${tipoGuia}`);
  }*/

  /**
   * Lista los transportistas de forma paginada.
   *
   * `GET /transportista/listar/{pageNumber}/{pageSize}?search=`
   *
   * @param pageNumber Número de página.
   * @param pageSize Cantidad de registros por página.
   * @param search Texto para filtrar; si es `null` no se filtra.
   * @returns Página de transportistas, con fechas como `Date` y los flags `ld_estado` / `ld_update` en `false`.
   */
  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<TransportistaDto[]>> {
    let httpParams = new HttpParams();

    if(search){
      httpParams = httpParams.set('search', search);
    }

    return this.http.get<TableData<TransportistaDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map((response: TableData<TransportistaDto[]>) => ({ 
        ...response,
        data: response.data.map((x: TransportistaDto) => ({
          ...x,
          fecha_registro: new Date(x.fecha_registro),
          fecha_modifico: x.fecha_modifico ? new Date(x.fecha_modifico) : null,
          ld_estado: false,
          ld_update: false
        }))
      }))
    );
  }

  /**
   * Registra un nuevo transportista.
   *
   * `POST /transportista`
   *
   * @param request Datos del transportista a registrar.
   * @returns Respuesta de la API con el resultado del registro.
   */
  registrar(request: RegistrarTransportistaRequestDto): Observable<RegistrarTransportistaResponseDto> {
    return this.http.post<RegistrarTransportistaResponseDto>(`${this.baseUrl}`, request);
  }

  /**
   * Obtiene un transportista por su id.
   *
   * `GET /transportista/buscar-por-id/{id}`
   *
   * @param id Id del transportista.
   * @returns Datos del transportista.
   */
  obtenerPorId(id: number): Observable<TransportistaDto> {
    return this.http.get<TransportistaDto>(`${this.baseUrl}/buscar-por-id/${id}`);
  }

  /**
   * Actualiza los datos de un transportista.
   *
   * `PUT /transportista/{id}`
   *
   * @param id Id del transportista a editar.
   * @param request Datos actualizados del transportista.
   * @returns El transportista actualizado, con `fecha_modifico` como `Date`.
   */
  editar(id: number, request: EditarTransportistaRequestDto): Observable<TransportistaDto> {
    return this.http.put<TransportistaDto>(`${this.baseUrl}/${id}`, request).pipe(
      map(response => ({ 
        ...response,
        fecha_modifico: response.fecha_modifico ? new Date(response.fecha_modifico) : null
      }) as TransportistaDto )
    );
  }

  /**
   * Elimina un transportista.
   *
   * `DELETE /transportista/{id}`
   *
   * @param id Id del transportista a eliminar.
   * @returns Respuesta de la API con el resultado de la eliminación.
   */
  eliminar(id: number): Observable<EliminarResponseDto> {
    return this.http.delete<EliminarResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activa o desactiva un transportista.
   *
   * `PUT /transportista/{id}/actualizar-estado`
   *
   * @param id Id del transportista.
   * @param request Nuevo estado (activo/inactivo).
   * @returns El estado actualizado, con `fecha_modifico` como `Date`.
   */
  actualizarEstado(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ActualizarEstadoResponseDto>> {
    return this.http.put<ResponseDTO<ActualizarEstadoResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(res =>{ 
        return {
          ...res,
          data: {
            ...res.data,
            fecha_modifico: res.data.fecha_modifico ? new Date(res.data.fecha_modifico) : null
          } 
        };
      })
    );
  }

  /**
   * Busca transportistas sugeridos (autocompletado).
   *
   * `GET /transportista/listar-sugerido?numeroDoc=`
   *
   * @param texto Texto a buscar; si es `null` se envía sin filtro.
   * @returns Lista de transportistas que coinciden con la búsqueda.
   */
  buscarSugerido(texto: string | null): Observable<TransportistaSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<TransportistaSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params });
  }

}
