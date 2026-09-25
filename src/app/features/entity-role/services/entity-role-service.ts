import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { EntityRoleDto, EntityRolesSyncDto, EntityRolesToSelectDto } from "../models/entity-role";

/**
 * Servicio para consumir los endpoints de roles de entidad (remitente, transportista, proveedor, etc.).
 *
 * Base: `{apiUrl}/entity-roles`
 */
@Injectable({
    providedIn: 'root'
})

export class EntityRoleApiService {

    private http = inject(HttpClient);
    private baseUrl = '';

    constructor() {
        this.baseUrl = `${environment.apiUrl}/entity-roles`;
    }

    /**
     * Sincroniza los roles de una entidad: reemplaza sus roles por los enviados.
     *
     * `PUT /entity-roles/sync-to-entity/{request.id}`
     *
     * @param request Roles a asignar; `request.id` indica la entidad.
     * @returns `true` si se sincronizaron los roles.
     */
    putRolesSync(request: EntityRolesSyncDto): Observable<boolean>{
        return this.http.put<boolean>(`${this.baseUrl}/sync-to-entity/${request.id}`, request)
    }

    /**
     * Lista los roles asignados a una entidad.
     *
     * `GET /entity-roles/list-by-entity/{entityId}`
     *
     * @param entityId Id de la entidad.
     * @returns Lista de roles de la entidad.
     */
    getRolesByEntity(entityId: number): Observable<EntityRoleDto[]>{
        return this.http.get<EntityRoleDto[]>(`${this.baseUrl}/list-by-entity/${entityId}`)
    }

    /**
     * Lista los roles disponibles para usarlos en un select.
     *
     * `GET /entity-roles/to-select`
     *
     * @returns Lista de roles en formato para select.
     */
    getRolesToSelect(): Observable<EntityRolesToSelectDto[]>{
        return this.http.get<EntityRolesToSelectDto[]>(`${this.baseUrl}/to-select`)
    }

}