import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoUnidadTransporteRequestDto, ActualizarEstadoUnidadTransporteResponseDto, EditarUnidadTransporteRequestDto, EditarUnidadTransporteResponseDto, EliminarUnidadTransporteResponseDto, RegistrarUnidadTransporteRequestDto, RegistrarUnidadTransporteResponseDto, UnidadTransporteDto } from "../models/unidad-transporte.model";

@Injectable({
  providedIn: 'root'
})
export class UnidadTransporteApiService {
  private baseUrl = `${environment.apiUrl}/Transporte`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number): Observable<TableData<UnidadTransporteDto[]>> {
    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`).pipe(
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

  obtener(id: number): Observable<UnidadTransporteDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as UnidadTransporteDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(id: number, request: EditarUnidadTransporteRequestDto): Observable<EditarUnidadTransporteResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
      map(response =>{ return response as EditarUnidadTransporteResponseDto }),
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

  actualizarEstado(id: number, request: ActualizarEstadoUnidadTransporteRequestDto ): Observable<ActualizarEstadoUnidadTransporteResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>{ return response as ActualizarEstadoUnidadTransporteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
}
