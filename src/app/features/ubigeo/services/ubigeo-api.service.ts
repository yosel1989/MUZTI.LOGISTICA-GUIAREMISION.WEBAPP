import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { UbigeoDepartamentoDto, UbigeoDistritoDto, UbigeoDto, UbigeoProvinciaDto } from "../models/ubigeo.model";

/**
 * Servicio para consumir los endpoints de ubigeo (departamentos, provincias y distritos).
 *
 * Base: `{apiUrl}/ubigeo`
 */
@Injectable({
  providedIn: 'root'
})
export class UbigeoApiService {
  private baseUrl = `${environment.apiUrl}/ubigeo`;

  constructor(private http: HttpClient) {}

  /**
   * Lista los departamentos.
   *
   * `GET /ubigeo/departamentos`
   *
   * @returns Lista de departamentos.
   */
  getDepartamentos(): Observable<UbigeoDepartamentoDto[]> {
    return this.http.get<UbigeoDepartamentoDto[]>(`${this.baseUrl}/departamentos`);
  }

  /**
   * Lista las provincias de un departamento.
   *
   * `GET /ubigeo/provincias-by-departamento/{ubigeoDepartamento}`
   *
   * @param ubigeoDepartamento Código de ubigeo del departamento.
   * @returns Lista de provincias del departamento.
   */
  getProvinciasByDepartamento(ubigeoDepartamento: string): Observable<UbigeoProvinciaDto[]> {
    return this.http.get<UbigeoProvinciaDto[]>(`${this.baseUrl}/provincias-by-departamento/${ubigeoDepartamento}`);
  }

  /**
   * Lista los distritos de una provincia.
   *
   * `GET /ubigeo/distritos-by-provincia/{ubigeoProvincia}`
   *
   * @param ubigeoProvincia Código de ubigeo de la provincia.
   * @returns Lista de distritos de la provincia.
   */
  getDistritosByProvincia(ubigeoProvincia: string): Observable<UbigeoDistritoDto[]> {
    return this.http.get<UbigeoDistritoDto[]>(`${this.baseUrl}/distritos-by-provincia/${ubigeoProvincia}`);
  }

  /**
   * Obtiene un ubigeo por su código.
   *
   * `GET /ubigeo/{ubigeoId}`
   *
   * @param ubigeoId Código de ubigeo.
   * @returns Datos del ubigeo (departamento, provincia y distrito).
   */
  findUbigeoById(ubigeoId: string): Observable<UbigeoDto> {
    return this.http.get<UbigeoDto>(`${this.baseUrl}/${ubigeoId}`);  
  }
  

}
