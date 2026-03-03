import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { ConductorByNumeroDocumento } from "../models/conductor.model";

@Injectable({
  providedIn: 'root'
})
export class ConductorApiService {
  private baseUrl = `${environment.apiUrl}/Conductor`;

  constructor(private http: HttpClient) {}

  getByNumeroDocumento(numeroDocumento: string): Observable<ConductorByNumeroDocumento> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-numero-documento/${numeroDocumento}`).pipe(
      map(response => { 
        return { 
          ...response, 
          fechaCreacion: new Date(response.fechaCreacion) 
        } as ConductorByNumeroDocumento; }
      )
    );
  }


}
