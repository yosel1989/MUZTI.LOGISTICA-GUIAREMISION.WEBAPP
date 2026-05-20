import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { SunatMotivoTrasladoDto } from "../models/sunat-catalogo.model";

@Injectable({
  providedIn: 'root'
})
export class SunatCatalogoApiService {
  private baseUrl = `${environment.apiUrl}/sunat-catalogo`;

  constructor(private http: HttpClient) {}

  loadMotivosTraslado(): Observable<SunatMotivoTrasladoDto[]> {
    return this.http.get<any>(`${this.baseUrl}/motivos-traslado`).pipe(
      map(response =>{ return response as SunatMotivoTrasladoDto[]}),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}
