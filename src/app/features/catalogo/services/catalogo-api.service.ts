import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EmisorVehicularDto, PaisDto, TipoEstablecimientoDTO } from "../models/catalogo.model";

@Injectable({
  providedIn: 'root'
})
export class CatalogoApiService {
  private baseUrl = `${environment.apiUrl}/catalogo`;

  constructor(private http: HttpClient) {}

  getPaises(): Observable<PaisDto[]> {
    return this.http.get<PaisDto[]>(`${this.baseUrl}/paises`).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getEmisorVehicular(): Observable<EmisorVehicularDto[]> {
    return this.http.get<EmisorVehicularDto[]>(`${this.baseUrl}/emisor-vehicular`).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getTipoEstablecimiento(): Observable<TipoEstablecimientoDTO[]> {
    return this.http.get<TipoEstablecimientoDTO[]>(`${this.baseUrl}/tipo-establecimiento`).pipe(
      map( response => response ),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}
