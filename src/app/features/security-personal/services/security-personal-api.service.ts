import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { SecurityPersonalCreateDto, SecurityPersonalDto, SecurityPersonalUpdateDto } from "../models/security-personal";
import { TableData } from "@core/models/table";

/**
 * Servicio para consumir los endpoints de personal de seguridad (usuarios con acceso al sistema).
 *
 * Base: `{apiUrl}/security-personal`
 */
@Injectable({
    providedIn: 'root',
})

export class SecurityPersonalApiService {
    private baseUrl = environment.apiUrl + '/security-personal';
    constructor(private httpClient: HttpClient) { }

    /**
     * Registra un nuevo personal de seguridad.
     *
     * `POST /security-personal`
     *
     * @param request Datos del personal a registrar.
     * @returns Id del personal registrado.
     */
    create(request: SecurityPersonalCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza los datos de un personal de seguridad.
     *
     * `PUT /security-personal/{request.id}`
     *
     * @param request Datos actualizados; `request.id` indica el personal a editar.
     * @returns El personal actualizado.
     */
    updated(request: SecurityPersonalUpdateDto): Observable<SecurityPersonalDto>{

        return this.httpClient.put<SecurityPersonalDto>(`${this.baseUrl}/${request.id}`, request);
    }

    /**
     * Lista el personal de seguridad de forma paginada.
     *
     * `GET /security-personal/{pageNumber}/{pageSize}?search=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de personal con el total de registros.
     */
    getCollection(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<SecurityPersonalDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<SecurityPersonalDto[]>>(`${this.baseUrl}/${pageNumber}/${pageSize}`, { params: httpParams })
    }

    /**
     * Obtiene un personal de seguridad por su id.
     *
     * `GET /security-personal/{securityPersonalId}`
     *
     * @param securityPersonalId Id del personal.
     * @returns Datos del personal.
     */
    getPersonalPorId(securityPersonalId: number): Observable<SecurityPersonalDto>{

        return this.httpClient.get<SecurityPersonalDto>(`${this.baseUrl}/${securityPersonalId}`);
    }

}