import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoConductorRequestDto, ActualizarEstadoConductorResponseDto, ConductorByNumeroDocumento, ConductorDto, ConductorSugeridoDto, EditarConductorRequestDto, EliminarConductorResponseDto, RegistrarConductorRequestDto, RegistrarConductorResponseDto } from "../models/conductor.model";
import { TableData } from "app/core/models/table";
import { ResponseDTO } from '@features/shared/models/shared';

@Injectable({
  providedIn: 'root'
})
export class ConductorApiService {
  private baseUrl = `${environment.apiUrl}/conductores`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<ConductorDto[]>> {

    let httpParams = new HttpParams();
    httpParams = search 
      ? httpParams.set('search', search) 
      : httpParams;

    return this.http.get<TableData<ConductorDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<ConductorDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
 
  registrar(request: RegistrarConductorRequestDto): Observable<RegistrarConductorResponseDto> {
    return this.http.post<RegistrarConductorResponseDto>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  buscarPorId(id: number): Observable<ConductorDto> {
    return this.http.get<ConductorDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as ConductorDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(request: EditarConductorRequestDto): Observable<ResponseDTO<ConductorDto>> {
    return this.http.put<ResponseDTO<ConductorDto>>(`${this.baseUrl}/${request.id}`, request).pipe(
      map(response =>({
        ...response,
        data: {
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

  eliminar(id: number): Observable<EliminarConductorResponseDto> {
    return this.http.delete<EliminarConductorResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoConductorRequestDto ): Observable<ResponseDTO<ActualizarEstadoConductorResponseDto>> {
    return this.http.put<ResponseDTO<ActualizarEstadoConductorResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
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

  buscarSugerido(texto: string | null): Observable<ConductorSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<ConductorSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as ConductorSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }
    
}
