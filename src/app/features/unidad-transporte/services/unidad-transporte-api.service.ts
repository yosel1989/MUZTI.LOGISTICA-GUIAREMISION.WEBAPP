import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "app/core/models/table";
import { EditarUnidadTransporteRequestDto, EliminarUnidadTransporteResponseDto, RegistrarUnidadTransporteRequestDto, RegistrarUnidadTransporteResponseDto, UnidadTransporteDto, UnidadTransporteSugeridoDto } from "../models/unidad-transporte.model";
import { ResponseDTO } from "@features/shared/models/shared";
import { ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";

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
    
    return this.http.get<TableData<UnidadTransporteDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<UnidadTransporteDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarUnidadTransporteRequestDto): Observable<RegistrarUnidadTransporteResponseDto> {
    return this.http.post<RegistrarUnidadTransporteResponseDto>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarUnidadTransporteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<UnidadTransporteDto> {
    return this.http.get<UnidadTransporteDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ 
        return {
          ...response,
          created_at: new Date(response.created_at),
          updated_at: response.updated_at ? new Date(response.updated_at) : null
        } as UnidadTransporteDto 
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

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
      }) ),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarUnidadTransporteResponseDto> {
    return this.http.delete<EliminarUnidadTransporteResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarUnidadTransporteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  toogleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
    return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>({
        ...response,
        data: {
          ...response.data,
          updated_at: response.data.updated_at ? new Date(response.data.updated_at) : null
        }
      })),
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

      return this.http.get<UnidadTransporteSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as UnidadTransporteSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }
}
