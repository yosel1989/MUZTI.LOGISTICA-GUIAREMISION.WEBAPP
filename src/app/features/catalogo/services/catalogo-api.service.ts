import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EmisorVehicularDto, PaisDto } from "../models/catalogo.model";

@Injectable({
  providedIn: 'root'
})
export class CatalogoApiService {
  private baseUrl = `${environment.apiUrl}/Catalogo`;

  constructor(private http: HttpClient) {}

  getPaises(): Observable<PaisDto[]> {
    return this.http.get<any>(`${this.baseUrl}/paises`).pipe(
      map(response =>{ return response as PaisDto[]}),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  getEmisorVehicular(): Observable<EmisorVehicularDto[]> {
    return this.http.get<any>(`${this.baseUrl}/emisor-vehicular`).pipe(
      map(response =>{ return response as EmisorVehicularDto[]}),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}
