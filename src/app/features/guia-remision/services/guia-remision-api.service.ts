import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { GuiaRemisionDto } from "app/features/guia-remision/models/guia-remision.model";
import { TableData } from "app/core/models/table";

@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemision`;

  constructor(private http: HttpClient) {}

  obtenerTodo(pageNumber: number, pageSize: number): Observable<TableData<GuiaRemisionDto[]>> {
    return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`).pipe(
      map(response =>{ return response as TableData<GuiaRemisionDto[]> }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

}
