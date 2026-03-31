import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoProveedorRequestDto, ActualizarEstadoProveedorResponseDto, EditarProveedorRequestDto, EditarProveedorResponseDto, EliminarProveedorResponseDto, ProveedorDto, RegistrarProveedorRequestDto, RegistrarProveedorResponseDto } from "../models/proveedor";
import { TableData } from "app/core/models/table";
import { ColumnsFilterDto } from "app/core/models/filter";

@Injectable({
  providedIn: 'root'
})
export class ProveedorApiService {
  private baseUrl = `${environment.apiUrl}/Proveedor`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<ProveedorDto[]>> {

    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<ProveedorDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  registrar(request: RegistrarProveedorRequestDto): Observable<RegistrarProveedorResponseDto> {
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  obtener(id: number): Observable<ProveedorDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
      map(response =>{ return response as ProveedorDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  editar(request: EditarProveedorRequestDto): Observable<EditarProveedorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${request.id}`, request).pipe(
      map(response =>{ return response as EditarProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  eliminar(id: number): Observable<EliminarProveedorResponseDto> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      map(response =>{ return response as EliminarProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  actualizarEstado(id: number, request: ActualizarEstadoProveedorRequestDto ): Observable<ActualizarEstadoProveedorResponseDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
      map(response =>{ return response as ActualizarEstadoProveedorResponseDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

}
