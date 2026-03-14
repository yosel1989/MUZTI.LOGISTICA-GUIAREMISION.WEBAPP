import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { PaisDto } from "../models/pais.model";

@Injectable({
  providedIn: 'root'
})
export class PaisApiService {
  private baseUrl = `${environment.apiUrl}/Pais`;

  constructor(private http: HttpClient) {}

  getPaises(): Observable<PaisDto[]> {
    return this.http.get<any>(`${this.baseUrl}/paises`).pipe(
      map(response =>{ return response as PaisDto[]}),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}
