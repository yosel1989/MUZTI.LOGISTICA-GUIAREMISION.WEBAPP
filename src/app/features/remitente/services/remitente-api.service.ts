import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { RemitenteByIdToGuia, RemitenteToSelect } from "../models/remitente";

@Injectable({
  providedIn: 'root'
})
export class RemitenteApiService {
  private baseUrl = `${environment.apiUrl}/Remitente`;

  constructor(private http: HttpClient) {}

  getToSelect(): Observable<RemitenteToSelect[]> {
    return this.http.get<any>(`${this.baseUrl}/listar`).pipe(
      map(response =>{ return response as RemitenteToSelect[]})
    );
  }

  getByIdToGuia(idRemitente: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<RemitenteByIdToGuia> {
    return this.http.get<any>(`${this.baseUrl}/buscar-por-id-para-guia/${idRemitente}/${tipoGuia}`).pipe(
      map(response =>{ return response as RemitenteByIdToGuia})
    );
  }


}
