import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { GuiaRemisionHistorialListDTO } from './../models/guia-remision-historial.model';

@Injectable({
  providedIn: 'root'
})
export class GuiaRemisionHistorialApiService {
  private baseUrl = `${environment.apiUrl}/guia-remision-historial`;

  constructor(private http: HttpClient) {}

  obtenerTodoPorGuia(guiaRemisionId: number): Observable<GuiaRemisionHistorialListDTO[]> {
    return this.http.get<any>(`${this.baseUrl}/${guiaRemisionId}`).pipe(
      map(response =>{ return response as GuiaRemisionHistorialListDTO[] }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
  
}
