import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { TableData } from "@core/models/table";
import { SecurityPersonalEntityBranchCreateDto, SecurityPersonalEntityBranchDto } from "../models/security-personal-entity-branch";

/**
 * Servicio para consumir los endpoints que asignan establecimientos al personal de seguridad.
 *
 * Base: `{apiUrl}/security-personal-entity-branchs`
 */
@Injectable({
    providedIn: 'root',
})

export class SecurityPersonalEntityBranchApiService {
    private baseUrl = environment.apiUrl + '/security-personal-entity-branchs';
    constructor(private httpClient: HttpClient) { }

    /**
     * Asigna un establecimiento a un personal de seguridad.
     *
     * `POST /security-personal-entity-branchs`
     *
     * @param request Personal y establecimiento a asignar.
     * @returns Id de la asignación registrada.
     */
    create(request: SecurityPersonalEntityBranchCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request);

    }

    /**
     * Lista los establecimientos asignados a un personal de forma paginada.
     *
     * `GET /security-personal-entity-branchs/{securityPersonalId}/{pageNumber}/{pageSize}?search=`
     *
     * @param securityPersonalId Id del personal.
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de establecimientos asignados con el total de registros.
     */
    getCollection(securityPersonalId: number, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<SecurityPersonalEntityBranchDto[]>>{

        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<SecurityPersonalEntityBranchDto[]>>(`${this.baseUrl}/${securityPersonalId}/${pageNumber}/${pageSize}`, { params: httpParams })

    }

    /**
     * Quita un establecimiento asignado a un personal de seguridad.
     *
     * `DELETE /security-personal-entity-branchs/{securityPersonalId}/{entityBranchId}`
     *
     * @param securityPersonalId Id del personal.
     * @param entityBranchId Id del establecimiento a quitar.
     * @returns `true` si se eliminó la asignación.
     */
    delete(securityPersonalId: number, entityBranchId: number): Observable<boolean>{

        return this.httpClient.delete<boolean>(`${this.baseUrl}/${securityPersonalId}/${entityBranchId}`);
    }

}