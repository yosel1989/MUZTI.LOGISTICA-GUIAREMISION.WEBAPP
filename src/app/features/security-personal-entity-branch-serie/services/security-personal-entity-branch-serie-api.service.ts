import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { TableData } from "@core/models/table";
import { SecurityPersonalEntityBranchSerieCreateDto, SecurityPersonalEntityBranchSerieDto } from "../models/security-personal-entity-branch-serie";

/**
 * Servicio para consumir los endpoints que asignan series de establecimiento al personal de seguridad.
 *
 * Base: `{apiUrl}/security-personal-entity-branch-series`
 */
@Injectable({
    providedIn: 'root',
})

export class SecurityPersonalEntityBranchSerieApiService {
    private baseUrl = environment.apiUrl + '/security-personal-entity-branch-series';
    constructor(private httpClient: HttpClient) { }

    /**
     * Asigna una serie a un personal de seguridad.
     *
     * `POST /security-personal-entity-branch-series`
     *
     * @param request Personal y serie a asignar.
     * @returns Id de la asignación registrada.
     */
    create(request: SecurityPersonalEntityBranchSerieCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request);

    }

    /**
     * Lista las series asignadas a un personal de forma paginada.
     *
     * `GET /security-personal-entity-branch-series/{securityPersonalId}/{pageNumber}/{pageSize}?search=`
     *
     * @param securityPersonalId Id del personal.
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de series asignadas con el total de registros.
     */
    getCollection(securityPersonalId: number, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<SecurityPersonalEntityBranchSerieDto[]>>{

        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<SecurityPersonalEntityBranchSerieDto[]>>(`${this.baseUrl}/${securityPersonalId}/${pageNumber}/${pageSize}`, { params: httpParams })

    }

    /**
     * Quita una serie asignada a un personal de seguridad.
     *
     * `DELETE /security-personal-entity-branch-series/{securityPersonalId}/{entityBranchSerieId}`
     *
     * @param securityPersonalId Id del personal.
     * @param entityBranchSerieId Id de la serie a quitar.
     * @returns `true` si se eliminó la asignación.
     */
    delete(securityPersonalId: number, entityBranchSerieId: number): Observable<boolean>{

        return this.httpClient.delete<boolean>(`${this.baseUrl}/${securityPersonalId}/${entityBranchSerieId}`);
    }

}