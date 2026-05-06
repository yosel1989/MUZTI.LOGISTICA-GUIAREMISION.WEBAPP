import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "app/core/models/table";
import { ColumnsFilterDto } from "app/core/models/filter";
import { ActualizarEstadoDto, ActualizarEstadoResponseDto, EliminarResponseDto } from "@features/shared/models/shared";
import { EditarTransportistaRequestDto, RegistrarTransportistaRequestDto, RegistrarTransportistaResponseDto, TransportistaDto } from "../models/transportista";

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

  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<TransportistaDto[]>> {
    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
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
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarTransportistaResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtener(id: number): Observable<TransportistaDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as TransportistaDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(id: number, request: EditarTransportistaRequestDto): Observable<TransportistaDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
      map(response => ({ 
        ...response,
        fecha_creacion: new Date(response.fecha_creacion),
        fecha_ultima_edicion: new Date(response.fecha_ultima_edicion)
      }) as TransportistaDto ),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarResponseDto> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoDto ): Observable<ActualizarEstadoResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(res =>{ 
        return {
          ...res,
          fecha_modificacion: res.fecha_modificacion ? new Date(res.fecha_modificacion) : null
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

}
