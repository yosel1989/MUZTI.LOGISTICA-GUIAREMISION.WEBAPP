import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { BienNormalizadoDTO, DocumentoRelacionadoDTO, EmisorVehicularDto, EntidadReguladoraDTO, PaisDto, TipoDocumentoDTO, TipoEstablecimientoDTO, UnidadMedidaDTO } from "../models/catalogo.model";

/**
 * Servicio para consumir los catálogos generales (países, tipos de documento, unidades de medida, etc.).
 *
 * Base: `{apiUrl}/catalogos`
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogoApiService {
  private baseUrl = `${environment.apiUrl}/catalogos`;

  constructor(private http: HttpClient) {}

  /**
   * Lista los países.
   *
   * `GET /catalogos/paises`
   *
   * @returns Lista de países.
   */
  getPaises(): Observable<PaisDto[]> {
    return this.http.get<PaisDto[]>(`${this.baseUrl}/paises`);
  }

  /**
   * Lista las entidades emisoras de autorizaciones vehiculares.
   *
   * `GET /catalogos/emisor-vehicular`
   *
   * @returns Lista de emisores vehiculares.
   */
  getEmisorVehicular(): Observable<EmisorVehicularDto[]> {
    return this.http.get<EmisorVehicularDto[]>(`${this.baseUrl}/emisor-vehicular`);
  }

  /**
   * Lista los tipos de establecimiento.
   *
   * `GET /catalogos/tipo-establecimiento`
   *
   * @returns Lista de tipos de establecimiento.
   */
  getTipoEstablecimiento(): Observable<TipoEstablecimientoDTO[]> {
    return this.http.get<TipoEstablecimientoDTO[]>(`${this.baseUrl}/tipo-establecimiento`);
  }

  /**
   * Lista los tipos de documento de identidad.
   *
   * `GET /catalogos/tipos-documento?tipoRegimen=`
   *
   * @param tipoRegimen Filtra por régimen (`natural` o `juridico`); si es `null` trae todos.
   * @returns Lista de tipos de documento.
   */
  getTiposDocumento(tipoRegimen: string | 'natural' | 'juridico' | null): Observable<TipoDocumentoDTO[]>{
    let httpParams = new HttpParams();
    httpParams = tipoRegimen 
      ? httpParams.set('tipoRegimen', tipoRegimen) 
      : httpParams;
    return this.http.get<TipoDocumentoDTO[]>(`${this.baseUrl}/tipos-documento`,{
      params: httpParams
    })
  }

  /**
   * Lista las entidades reguladoras.
   *
   * `GET /catalogos/entidades-reguladoras`
   *
   * @returns Lista de entidades reguladoras.
   */
  getEntidadesReguladoras(): Observable<EntidadReguladoraDTO[]>{
    return this.http.get<EntidadReguladoraDTO[]>(`${this.baseUrl}/entidades-reguladoras`)
  }

  /**
   * Lista las unidades de medida.
   *
   * `GET /catalogos/unidades-medida?tipo=`
   *
   * @param tipo Filtra por tipo (`peso`, `volumen`, `longitud`, `conteo`); si es `null` trae todas.
   * @returns Lista de unidades de medida.
   */
  getUnidadesMedida(tipo: string | 'peso' | 'volumen' | 'longitud' | 'conteo' | null): Observable<UnidadMedidaDTO[]>{
    let httpParams = new HttpParams();
    httpParams = tipo 
      ? httpParams.set('tipo', tipo) 
      : httpParams;
    return this.http.get<UnidadMedidaDTO[]>(`${this.baseUrl}/unidades-medida`,{
      params: httpParams
    })
  }

  /**
   * Lista los bienes normalizados.
   *
   * `GET /catalogos/bienes-normalizados`
   *
   * @returns Lista de bienes normalizados.
   */
  getBienesNormalizados(): Observable<BienNormalizadoDTO[]>{
    return this.http.get<BienNormalizadoDTO[]>(`${this.baseUrl}/bienes-normalizados`)
  }

  /**
   * Lista los tipos de documento relacionado que se pueden asociar a una guía.
   *
   * `GET /catalogos/documentos-relacionados?tipo=`
   *
   * @param tipo Tipo de guía (`REMITENTE` o `TRANSPORTISTA`); si es `null` trae todos.
   * @returns Lista de tipos de documento relacionado.
   */
  getDocumentoRelacionados(tipo: string | 'REMITENTE' | 'TRANSPORTISTA' | null): Observable<DocumentoRelacionadoDTO[]>{
    let httpParams = new HttpParams();
    httpParams = tipo 
      ? httpParams.set('tipo', tipo) 
      : httpParams;

    return this.http.get<DocumentoRelacionadoDTO[]>(`${this.baseUrl}/documentos-relacionados`,{
      params: httpParams
    })
  }

}
