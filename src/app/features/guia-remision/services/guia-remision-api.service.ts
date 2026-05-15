import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { GuiaRemisionDto } from "app/features/guia-remision/models/guia-remision.model";
import { TableData } from "app/core/models/table";
import { ColumnsFilterDto } from "app/core/models/filter";

@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemision`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number, filters: ColumnsFilterDto[]): Observable<TableData<GuiaRemisionDto[]>> {

    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
      map(response =>{ return response as TableData<GuiaRemisionDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  buscarPorUuid(uuid: string): Observable<GuiaRemisionDto> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-uuid/${uuid}`).pipe(
      map(response =>{ return response as GuiaRemisionDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  exportarTodo(filters: ColumnsFilterDto[]): Observable<Blob> {
    let httpParams = new HttpParams();

    filters.forEach((col, i) => {
      httpParams = httpParams
        .set(`columns[${i}][data]`, col.data)
        .set(`columns[${i}][search][value]`, col.search.value!);
        col.search.regex && httpParams.set(`columns[${i}][search][regex]`, col.search.regex.toString());
        col.search.match && httpParams.set(`columns[${i}][search][match]`, col.search.match ?? '');
    });

    return this.http.get(`${this.baseUrl}/exportar`, {
      params: httpParams,
      responseType: 'blob'
    });

  }

  confirmar(id: number): Observable<GuiaRemisionDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/confirmar`,{}).pipe(
      map(response =>{ return response as GuiaRemisionDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  rechazar(id: number, descripcion: string | null): Observable<GuiaRemisionDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/rechazar`,{id, descripcion}).pipe(
      map(response =>{ return response as GuiaRemisionDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  anular(id: number, descripcion: string | null): Observable<GuiaRemisionDto> {
    return this.http.put<any>(`${this.baseUrl}/${id}/anular`,{id, descripcion}).pipe(
      map(response =>{ return response as GuiaRemisionDto }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
