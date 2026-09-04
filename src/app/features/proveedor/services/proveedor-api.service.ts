import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EditarProveedorRequestDto, EliminarProveedorResponseDto, ProveedorDto, ProveedorSugeridoDto, RegistrarProveedorRequestDto, RegistrarProveedorResponseDto } from "../models/proveedor";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoResponseDto, ResponseDTO } from "@features/shared/models/shared";
import { ToggleActiveRequestDto } from "app/shared/models/request";

@Injectable({
  providedIn: 'root'
})
export class ProveedorApiService {
  private baseUrl = `${environment.apiUrl}/proveedores`;

  constructor(private http: HttpClient) {}

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
      }) ),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarProveedorRequestDto): Observable<RegistrarProveedorResponseDto> {
    return this.http.post<RegistrarProveedorResponseDto>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtenerPorId(id: number): Observable<ProveedorDto> {
    return this.http.get<ProveedorDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as ProveedorDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(request: EditarProveedorRequestDto): Observable<ResponseDTO<ProveedorDto>> {
    return this.http.put<ResponseDTO<ProveedorDto>>(`${this.baseUrl}/${request.id}`, request).pipe(
      map((response: ResponseDTO<ProveedorDto>) =>({ 
        ...response, 
        data:{
          ...response.data,
          fecha_registro: new Date(response.data.fecha_registro),
          fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
        }
      })),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarProveedorResponseDto> {
    return this.http.delete<EliminarProveedorResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ActualizarEstadoResponseDto>> {
    return this.http.put<ResponseDTO<ActualizarEstadoResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>({ 
        ...response,
        data: {
          ...response.data,
          fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
        }
      })),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  buscarSugerido(texto: string | null): Observable<ProveedorSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<ProveedorSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as ProveedorSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }

}
