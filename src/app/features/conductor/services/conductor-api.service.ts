import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoConductorResponseDto, ConductorByNumeroDocumento, ConductorDto, EditarConductorRequestDto, EditarConductorResponseDto, EliminarConductorResponseDto, RegistrarConductorRequestDto, RegistrarConductorResponseDto } from "../models/conductor.model";
import { TableData } from "app/core/models/table";

@Injectable({
  providedIn: 'root'
})
export class ConductorApiService {
  private baseUrl = `${environment.apiUrl}/Conductor`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number): Observable<TableData<ConductorDto[]>> {
    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`).pipe(
      map(response =>{ return response as TableData<ConductorDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarConductorRequestDto): Observable<RegistrarConductorResponseDto> {
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtener(id: number): Observable<ConductorDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as ConductorDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(request: EditarConductorRequestDto): Observable<EditarConductorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}?id=${request.id}`, request).pipe(
      map(response =>{ return response as EditarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getByNumeroDocumento(numeroDocumento: string): Observable<ConductorByNumeroDocumento> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-numero-documento/${numeroDocumento}`).pipe(
      map(response => { 
        return { 
          ...response, 
          fechaCreacion: new Date(response.fechaCreacion) 
        } as ConductorByNumeroDocumento; }
      )
    );
  }

  eliminar(id: number): Observable<EliminarConductorResponseDto> {
    return this.http.delete<any>(`${this.baseUrl}?id=${id}`).pipe(
      map(response =>{ return response as EliminarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, status: 0 | 1 | number ): Observable<ActualizarEstadoConductorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`,status).pipe(
      map(response =>{ return response as ActualizarEstadoConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
}
