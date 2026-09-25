import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { EditarProveedorRequestDto, EliminarProveedorResponseDto, ProveedorDto, ProveedorSugeridoDto, RegistrarProveedorRequestDto, RegistrarProveedorResponseDto } from "../models/proveedor";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoResponseDto, ResponseDTO } from "@features/shared/models/shared";
import { ToggleActiveRequestDto } from "app/shared/models/request";

/**
 * Servicio para consumir los endpoints de proveedores.
 *
 * Base: `{apiUrl}/proveedores`
 */
@Injectable({
  providedIn: 'root'
})
export class ProveedorApiService {
  private baseUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

  /**
   * Lista los proveedores de forma paginada.
   *
   * `GET /proveedores/listar/{pageNumber}/{pageSize}?search=`
   *
   * @param pageNumber Número de página.
   * @param pageSize Cantidad de registros por página.
   * @param search Texto para filtrar; si es `null` no se filtra.
   * @returns Página de proveedores, con fechas como `Date` y los flags `ld_estado` / `ld_update` en `false`.
   */
  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<ProveedorDto[]>> {

    let httpParams = new HttpParams();

    if(search) httpParams = httpParams.set('search',search);

    return this.http.get<TableData<ProveedorDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map((response: TableData<ProveedorDto[]>) => ({  
        ...response,
        data: response.data.map((x: ProveedorDto) => ({
          ...x,
          fecha_registro: new Date(x.fecha_registro),
          fecha_modifico: x.fecha_modifico ? new Date(x.fecha_modifico) : null,
          ld_estado: false,
          ld_update: false
        }))
      }) )
    );
  }

  /**
   * Registra un nuevo proveedor.
   *
   * `POST /proveedores`
   *
   * @param request Datos del proveedor a registrar.
   * @returns Respuesta de la API con el resultado del registro.
   */
  registrar(request: RegistrarProveedorRequestDto): Observable<RegistrarProveedorResponseDto> {
    return this.http.post<RegistrarProveedorResponseDto>(`${this.baseUrl}`, request);
  }

  /**
   * Obtiene un proveedor por su id.
   *
   * `GET /proveedores/buscar-por-id/{id}`
   *
   * @param id Id del proveedor.
   * @returns Datos del proveedor.
   */
  obtenerPorId(id: number): Observable<ProveedorDto> {
    return this.http.get<ProveedorDto>(`${this.baseUrl}/buscar-por-id/${id}`);
  }

  /**
   * Actualiza los datos de un proveedor.
   *
   * `PUT /proveedores/{request.id}`
   *
   * @param request Datos actualizados; `request.id` indica el proveedor a editar.
   * @returns El proveedor actualizado, con `fecha_registro` y `fecha_modifico` como `Date`.
   */
  editar(request: EditarProveedorRequestDto): Observable<ResponseDTO<ProveedorDto>> {
    return this.http.put<ResponseDTO<ProveedorDto>>(`${this.baseUrl}/${request.id}`, request).pipe(
      map((response: ResponseDTO<ProveedorDto>) =>({ 
        ...response, 
        data:{
          ...response.data,
          fecha_registro: new Date(response.data.fecha_registro),
          fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
        }
      }))
    );
  }

  /**
   * Elimina un proveedor.
   *
   * `DELETE /proveedores/{id}`
   *
   * @param id Id del proveedor a eliminar.
   * @returns Respuesta de la API con el resultado de la eliminación.
   */
  eliminar(id: number): Observable<EliminarProveedorResponseDto> {
    return this.http.delete<EliminarProveedorResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Activa o desactiva un proveedor.
   *
   * `PUT /proveedores/{id}/actualizar-estado`
   *
   * @param id Id del proveedor.
   * @param request Nuevo estado (activo/inactivo).
   * @returns El estado actualizado, con `fecha_modifico` como `Date`.
   */
  actualizarEstado(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ActualizarEstadoResponseDto>> {
    return this.http.put<ResponseDTO<ActualizarEstadoResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>({ 
        ...response,
        data: {
          ...response.data,
          fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
        }
      }))
    );
  }

  /**
   * Busca proveedores sugeridos (autocompletado).
   *
   * `GET /proveedores/listar-sugerido?numeroDoc=`
   *
   * @param texto Texto a buscar; si es `null` se envía sin filtro.
   * @returns Lista de proveedores que coinciden con la búsqueda.
   */
  buscarSugerido(texto: string | null): Observable<ProveedorSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<ProveedorSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params });
  }

}
