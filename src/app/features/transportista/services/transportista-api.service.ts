import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoResponseDto, EliminarResponseDto, ResponseDTO } from "@features/shared/models/shared";
import { EditarTransportistaRequestDto, RegistrarTransportistaRequestDto, RegistrarTransportistaResponseDto, TransportistaDto, TransportistaSugeridoDto } from "../models/transportista";
import { ToggleActiveRequestDto } from "app/shared/models/request";

@Injectable({
  providedIn: 'root'
})
export class TransportistaApiService {
  private baseUrl = `${environment.apiUrl}/transportista`;

  constructor(private http: HttpClient) {}

  /*getToSelect(): Observable<RemitenteToSelect[]> {
    return this.http.get<any>(`${this.baseUrl}/listar-select`).pipe(
      map(response =>{ return response as RemitenteToSelect[]})
    );
  }

  getToFilter(): Observable<RemitenteNombre[]> {
    return this.http.get<any>(`${this.baseUrl}/listar-nombres`).pipe(
      map(response =>{ return response as RemitenteNombre[]})
    );
  }

  getByIdToGuia(idRemitente: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<RemitenteByIdToGuia> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id-para-guia/${idRemitente}/${tipoGuia}`).pipe(
      map(response =>{ return response as RemitenteByIdToGuia})
    );
  }*/

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
      })),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarTransportistaRequestDto): Observable<RegistrarTransportistaResponseDto> {
    return this.http.post<RegistrarTransportistaResponseDto>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarTransportistaResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtenerPorId(id: number): Observable<TransportistaDto> {
    return this.http.get<TransportistaDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as TransportistaDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(id: number, request: EditarTransportistaRequestDto): Observable<TransportistaDto> {
    return this.http.put<TransportistaDto>(`${this.baseUrl}/${id}`, request).pipe(
      map(response => ({ 
        ...response,
        fecha_modifico: response.fecha_modifico ? new Date(response.fecha_modifico) : null
      }) as TransportistaDto ),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarResponseDto> {
    return this.http.delete<EliminarResponseDto>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

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
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  buscarSugerido(texto: string | null): Observable<TransportistaSugeridoDto[]> {
      let params = new HttpParams();
      if (texto) {
          params = params.set('numeroDoc', texto);
      }

      return this.http.get<TransportistaSugeridoDto[]>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
          map(response =>{ return response as TransportistaSugeridoDto[] }),
          catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
          })
      );
  }

}
