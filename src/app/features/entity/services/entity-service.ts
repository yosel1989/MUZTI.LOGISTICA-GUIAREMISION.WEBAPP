import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { EntityBySerieAssignedDto, EntityCreateDto, EntityDto, EntityListDto, EntityUpdateDto } from "../models/entity";
import { map, Observable } from "rxjs";
import { TableData } from "@core/models/table";
import { ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { ResponseDTO } from "@features/shared/models/shared";

/**
 * Servicio para consumir los endpoints de entidades (empresas y personas).
 *
 * Base: `{apiUrl}/entities`
 */
@Injectable({
    providedIn: 'root'
})

export class EntityApiService {

    private http = inject(HttpClient);
    private baseUrl = '';

    constructor() {
        this.baseUrl = `${environment.apiUrl}/entities`;
    }

    /**
     * Registra una nueva entidad.
     *
     * `POST /entities`
     *
     * @param request Datos de la entidad a registrar.
     * @returns La entidad registrada.
     */
    postCreate(request: EntityCreateDto): Observable<EntityDto>{
        return this.http.post<EntityDto>(`${this.baseUrl}`, request)
    }

    /**
     * Actualiza los datos de una entidad.
     *
     * `PUT /entities/{request.id}`
     *
     * @param request Datos actualizados; `request.id` indica la entidad a editar.
     * @returns La entidad actualizada.
     */
    putUpdate(request: EntityUpdateDto): Observable<EntityDto>{
        return this.http.put<EntityDto>(`${this.baseUrl}/${request.id}`, request)
    }

    /**
     * Activa o desactiva una entidad.
     *
     * `PUT /entities/{id}/actualizar-estado`
     *
     * @param id Id de la entidad.
     * @param request Nuevo estado (activo/inactivo).
     * @returns El estado actualizado, con `fecha_modifico` como `Date`.
     */
    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
          map(response =>({ 
            ...response,
            data: {
              ...response.data,
              fecha_modifico: response.data.updated_at ? new Date(response.data.updated_at) : null
            }
          }))
        );
      }

    /**
     * Lista las entidades de un rol de forma paginada.
     *
     * `GET /entities/collection/{role}/{pageNumber}/{pageSize}?search=`
     *
     * @param role Rol de la entidad.
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de entidades con el total de registros.
     */
    getCollection(role: string, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.http.get<TableData<EntityDto[]>>(`${this.baseUrl}/collection/${role}/${pageNumber}/${pageSize}`, { params: httpParams })
    }

    /**
     * Lista las entidades filtradas por rol de forma paginada.
     *
     * `GET /entities/collection-by-role/{role}/{pageNumber}/{pageSize}?search=`
     *
     * @param role Rol por el que se filtra.
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de entidades con el total de registros.
     */
    getCollectionByRole(role: string, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.http.get<TableData<EntityDto[]>>(`${this.baseUrl}/collection-by-role/${role}/${pageNumber}/${pageSize}`, { params: httpParams })
    }

    /**
     * Lista entidades de forma paginada con filtros opcionales.
     *
     * `GET /entities/list/{pageNumber}/{pageSize}?search=&type=&roles=&isInternal=&excludeId=&hasBranch=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @param type `empresa` o `persona`; si es `null` no se filtra.
     * @param roles Roles por los que filtrar; si es `null` no se filtra.
     * @param isInternal Solo entidades internas cuando es `true`.
     * @param excludeId Id de una entidad a excluir del resultado.
     * @param hasBranch Solo entidades con establecimientos cuando es `true`.
     * @returns Página de entidades con el total de registros.
     */
    getList(pageNumber: number, pageSize: number, search: string | null, type: 'empresa' | 'persona' | null, roles: string | null, isInternal: boolean | null, excludeId: number | null, hasBranch: boolean | null): Observable<TableData<EntityListDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search ? httpParams.set('search', search) : httpParams;
        httpParams = type ? httpParams.set('type', type) : httpParams;
        httpParams = roles ? httpParams.set('roles', roles) : httpParams;
        httpParams = isInternal ? httpParams.set('isInternal', isInternal) : httpParams;
        httpParams = excludeId ? httpParams.set('excludeId', excludeId) : httpParams;
        httpParams = hasBranch ? httpParams.set('hasBranch', hasBranch) : httpParams;

        return this.http.get<TableData<EntityListDto[]>>(`${this.baseUrl}/list/${pageNumber}/${pageSize}`, { params: httpParams })
    }

    /**
     * Obtiene una entidad por su id.
     *
     * `GET /entities/{id}`
     *
     * @param id Id de la entidad.
     * @returns Datos de la entidad.
     */
    getById(id: number): Observable<EntityDto>{
        return this.http.get<EntityDto>(`${this.baseUrl}/${id}`)
    }


    /**
     * Lista las entidades que tienen series asignadas.
     *
     * `GET /entities/list-by-assigned-series`
     *
     * @returns Lista de entidades con series asignadas.
     */
    getListBySeriesAssigned(): Observable<EntityBySerieAssignedDto[]>{
        return this.http.get<EntityBySerieAssignedDto[]>(`${this.baseUrl}/list-by-assigned-series`)
    }
}   