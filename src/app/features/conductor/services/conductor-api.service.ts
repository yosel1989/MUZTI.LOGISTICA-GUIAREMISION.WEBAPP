import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoConductorRequestDto, ActualizarEstadoConductorResponseDto, ConductorByNumeroDocumento, ConductorDto, ConductorSugeridoDto, EditarConductorRequestDto, EditarConductorResponseDto, EliminarConductorResponseDto, RegistrarConductorRequestDto, RegistrarConductorResponseDto } from "../models/conductor.model";
import { TableData } from "app/core/models/table";
import { ColumnsFilterDto } from "app/core/models/filter";

@Injectable({
  providedIn: 'root'
})
export class ConductorApiService {
  private baseUrl = `${environment.apiUrl}/Conductor`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<ConductorDto[]>> {

    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
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

  buscarPorId(id: number): Observable<ConductorDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as ConductorDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(request: EditarConductorRequestDto): Observable<EditarConductorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${request.id}`, request).pipe(
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
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarConductorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoConductorRequestDto ): Observable<ActualizarEstadoConductorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>{ return response as ActualizarEstadoConductorResponseDto }),
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

      return this.http.get<any>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as ConductorSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }
    
}
