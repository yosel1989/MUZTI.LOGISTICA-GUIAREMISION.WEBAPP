import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { UbigeoDepartamentoDto, UbigeoDistritoDto, UbigeoDto, UbigeoProvinciaDto } from "../models/ubigeo.model";

@Injectable({
  providedIn: 'root'
})
export class UbigeoApiService {
  private baseUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<UbigeoDepartamentoDto[]> {
    return this.http.get<any>(`${this.baseUrl}/departamentos`).pipe(
      map(response =>{ return response as UbigeoDepartamentoDto[]})
    );
  }

  getProvinciasByDepartamento(ubigeoDepartamento: string): Observable<UbigeoProvinciaDto[]> {
    return this.http.get<any>(`${this.baseUrl}/provincias-by-departamento/${ubigeoDepartamento}`).pipe(
      map(response =>{ return response as UbigeoProvinciaDto[]})
    );
  }

  getDistritosByProvincia(ubigeoProvincia: string): Observable<UbigeoDistritoDto[]> {
    return this.http.get<any>(`${this.baseUrl}/distritos-by-provincia/${ubigeoProvincia}`).pipe(
      map(response =>{ return response as UbigeoDistritoDto[]})
    );
  }

  findUbigeoById(ubigeoId: string): Observable<UbigeoDto> {
    return this.http.get<any>(`${this.baseUrl}/${ubigeoId}`).pipe(
      map(response =>{ return response as UbigeoDto})
    );  
  }
  

}
