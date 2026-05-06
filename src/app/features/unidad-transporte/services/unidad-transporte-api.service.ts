import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoUnidadTransporteRequestDto, EditarUnidadTransporteRequestDto, EliminarUnidadTransporteResponseDto, RegistrarUnidadTransporteRequestDto, RegistrarUnidadTransporteResponseDto, UnidadTransporteDto, UnidadTransporteSugeridoDto } from "../models/unidad-transporte.model";
import { ColumnsFilterDto } from "app/core/models/filter";
import { ActualizarEstadoResponseDto } from "@features/shared/models/shared";

@Injectable({
  providedIn: 'root'
})
export class UnidadTransporteApiService {
  private baseUrl = `${environment.apiUrl}/unidad-transporte`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<UnidadTransporteDto[]>> {
    
    let httpParams = new HttpParams();
    if (search) {
      httpParams = httpParams.set('search', search);
    }
    
    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<UnidadTransporteDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarUnidadTransporteRequestDto): Observable<RegistrarUnidadTransporteResponseDto> {
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarUnidadTransporteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<UnidadTransporteDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ 
        return {
          ...response,
          fecha_registro: new Date(response.fecha_registro),
          fecha_modifico: response.fecha_modifico ? new Date(response.fecha_modifico) : null
        } as UnidadTransporteDto 
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(id: number, request: EditarUnidadTransporteRequestDto): Observable<UnidadTransporteDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
      map(response =>{ return ({
        ...response,
        fecha_registro: new Date(response.fecha_registro),
        fecha_modifico: response.fecha_modifico ? new Date(response.fecha_modifico) : null,
        ld_estado: false,
        ld_update: false
      } as UnidadTransporteDto )  }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarUnidadTransporteResponseDto> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarUnidadTransporteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoUnidadTransporteRequestDto ): Observable<ActualizarEstadoResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>{ return response as ActualizarEstadoResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
  buscar(texto: string | null): Observable<UnidadTransporteSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<any>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as UnidadTransporteSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }
}
