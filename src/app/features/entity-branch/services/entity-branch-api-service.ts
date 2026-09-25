import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TableData } from "@core/models/table";
import { ResponseDTO } from "@features/shared/models/shared";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { EntityBranchCreateDto, EntityBranchDto, EntityBranchListToModalDTO, EntityBranchListToSelectDTO, EntityBranchUpdateDto, EstablecimientoRemitenteGuiaDTO } from "../models/entity-branch";

/**
 * Servicio para consumir los endpoints de establecimientos (sucursales) de una entidad.
 *
 * Base: `{apiUrl}/entity-branchs`
 */
@Injectable({
    providedIn: "root"
})

export class EntityBranchApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/entity-branchs`
    }

    /**
     * Lista los establecimientos de una entidad para mostrarlos en un modal de selección.
     *
     * `GET /entity-branchs/listar-sugerido/{entityId}?search=`
     *
     * @param entityId Id de la entidad.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Lista de establecimientos de la entidad.
     */
    getAllToModalByRuc(entityId: number, search: string | null): Observable<EntityBranchListToModalDTO[]>{
        let httpParams = new HttpParams();
        if (search) {
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<EntityBranchListToModalDTO[]>(`${this.baseUrl}/listar-sugerido/${entityId}`, { params: httpParams });
    }


    /**
     * Obtiene un establecimiento por su id.
     *
     * `GET /entity-branchs/buscar-por-id/{id}`
     *
     * @param id Id del establecimiento.
     * @returns Datos del establecimiento.
     */
    getById(id: number): Observable<EntityBranchDto>{
        return this.http.get<EntityBranchDto>(`${this.baseUrl}/buscar-por-id/${id}`);
    }


    /**
     * Lista los establecimientos de forma paginada.
     *
     * `GET /entity-branchs/listar/{pageNumber}/{pageSize}?search=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de establecimientos con el total de registros.
     */
    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityBranchDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<EntityBranchDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, {
            params: httpParams
        });
    }

    /**
     * Elimina un establecimiento.
     *
     * `DELETE /entity-branchs/{id}`
     *
     * @param id Id del establecimiento a eliminar.
     * @returns Respuesta de la API con el resultado de la eliminación.
     */
    delete(id: number): Observable<ResponseDTO<DeleteResponseDto>> {
        return this.http.delete<ResponseDTO<DeleteResponseDto>>(`${this.baseUrl}/${id}`);
    }

    /**
     * Activa o desactiva un establecimiento.
     *
     * `PUT /entity-branchs/{id}/toggle-active`
     *
     * @param id Id del establecimiento.
     * @param request Nuevo estado (activo/inactivo).
     * @returns El estado actualizado, con `updated_at` como `Date` y el usuario que lo modificó.
     */
    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/toggle-active`, request).pipe(
            map(response => ({  
                ...response,
                data: {
                    ...response.data,
                    updated_at: response.data.updated_at ? new Date(response.data.updated_at) : null,
                    updated_at_user: response.data.updated_at_user,
                    updated_at_user_name: response.data.updated_at_user_name
                }

            }) as ResponseDTO<ToggleActiveResponseDto>)
        );
    }

    /**
     * Registra un nuevo establecimiento.
     *
     * `POST /entity-branchs`
     *
     * @param request Datos del establecimiento a registrar.
     * @returns El establecimiento registrado.
     */
    create(request: EntityBranchCreateDto): Observable<EntityBranchDto> {
        return this.http.post<EntityBranchDto>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza los datos de un establecimiento.
     *
     * `PUT /entity-branchs/{id}`
     *
     * @param id Id del establecimiento a editar.
     * @param request Datos actualizados del establecimiento.
     * @returns El establecimiento actualizado, con `created_at` y `updated_at` como `Date`.
     */
    update(id: number, request: EntityBranchUpdateDto): Observable<EntityBranchDto> {
        return this.http.put<EntityBranchDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as EntityBranchDto )
        );
    }

    /**
     * Obtiene los datos de un establecimiento listos para usarlos en una guía de remisión.
     *
     * `GET /entity-branchs/buscar-por-id-para-guia/{entityBranchId}/{tipoGuia}`
     *
     * @param entityBranchId Id del establecimiento.
     * @param tipoGuia Tipo de guía: `REMITENTE` o `TRANSPORTISTA`.
     * @returns Datos del establecimiento para la guía.
     */
    getByIdToGuia(entityBranchId: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<EstablecimientoRemitenteGuiaDTO> {
        return this.http.get<EstablecimientoRemitenteGuiaDTO>(`${this.baseUrl}/buscar-por-id-para-guia/${entityBranchId}/${tipoGuia}`);
    }


    /**
     * Lista los establecimientos de una entidad por RUC, para usarlos en un select.
     *
     * `GET /entity-branchs/listar-select/por-ruc/{ruc}`
     *
     * @param ruc RUC de la entidad.
     * @returns Lista de establecimientos en formato para select.
     */
    getAllToSelectByRuc(ruc: string): Observable<EntityBranchListToSelectDTO[]>{
        return this.http.get<EntityBranchListToSelectDTO[]>(`${this.baseUrl}/listar-select/por-ruc/${ruc}`);
    }
}