import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoRemitenteResponseDto, EditarRemitenteRequestDto, EditarRemitenteResponseDto, EliminarRemitenteResponseDto, RegistrarRemitenteRequestDto, RegistrarRemitenteResponseDto, RemitenteByIdToGuia, RemitenteDto, RemitenteNombre, RemitenteToSelect } from "../models/remitente";
import { TableData } from "app/core/models/table";
import { ActualizarEstadoProveedorRequestDto } from "@features/proveedor/models/proveedor";
import { ColumnsFilterDto } from "app/core/models/filter";

@Injectable({
  providedIn: 'root'
})
export class RemitenteApiService {
  private baseUrl = `${environment.apiUrl}/Remitente`;

  constructor(private http: HttpClient) {}

  getToSelect(): Observable<RemitenteToSelect[]> {
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
  }

  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<RemitenteDto[]>> {
    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<RemitenteDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarRemitenteRequestDto): Observable<RegistrarRemitenteResponseDto> {
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarRemitenteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtener(id: number): Observable<RemitenteDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as RemitenteDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(id: number, request: EditarRemitenteRequestDto): Observable<EditarRemitenteResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
      map(response =>{ return response as EditarRemitenteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarRemitenteResponseDto> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarRemitenteResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoProveedorRequestDto ): Observable<ActualizarEstadoRemitenteResponseDto> {
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
