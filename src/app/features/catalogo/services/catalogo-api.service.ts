import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { BienNormalizadoDTO, EmisorVehicularDto, EntidadReguladoraDTO, PaisDto, TipoDocumentoDTO, TipoEstablecimientoDTO, UnidadMedidaDTO } from "../models/catalogo.model";

@Injectable({
  providedIn: 'root'
})
export class CatalogoApiService {
  private baseUrl = `${environment.apiUrl}/catalogos`;

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

  getTiposDocumento(tipoRegimen: string | 'natural' | 'juridico' | null): Observable<TipoDocumentoDTO[]>{
    let httpParams = new HttpParams();
    httpParams = tipoRegimen 
      ? httpParams.set('tipoRegimen', tipoRegimen) 
      : httpParams;
    return this.http.get<TipoDocumentoDTO[]>(`${this.baseUrl}/tipos-documento`,{
      params: httpParams
    }).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    )
  }

  getEntidadesReguladoras(): Observable<EntidadReguladoraDTO[]>{
    return this.http.get<EntidadReguladoraDTO[]>(`${this.baseUrl}/entidades-reguladoras`).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    )
  }

  getUnidadesMedida(tipo: string | 'peso' | 'volumen' | 'longitud' | 'conteo' | null): Observable<UnidadMedidaDTO[]>{
    let httpParams = new HttpParams();
    httpParams = tipo 
      ? httpParams.set('tipo', tipo) 
      : httpParams;
    return this.http.get<UnidadMedidaDTO[]>(`${this.baseUrl}/unidades-medida`,{
      params: httpParams
    }).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    )
  }

  getBienesNormalizados(): Observable<BienNormalizadoDTO[]>{
    return this.http.get<BienNormalizadoDTO[]>(`${this.baseUrl}/bienes-normalizados`).pipe(
      map(response => response),
      catchError(error => {
        return throwError(() => error);
      })
    )
  }

}
