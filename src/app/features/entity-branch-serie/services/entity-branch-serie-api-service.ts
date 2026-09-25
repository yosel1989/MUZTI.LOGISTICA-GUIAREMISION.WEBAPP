import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TableData } from "@core/models/table";
import { ResponseDTO } from "@features/shared/models/shared";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { EntityBranchSerieCreateDto, EntityBranchSerieDto, EntityBranchSerieToSelectDto, EntityBranchSerieUpdateDto } from "../models/entity-branch-serie";

/**
 * Servicio para consumir los endpoints de series de comprobantes por establecimiento.
 *
 * Base: `{apiUrl}/entity-branch-series`
 */
@Injectable({
    providedIn: "root"
})

export class EntityBranchSerieApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/entity-branch-series`
    }

    /**
     * Obtiene una serie por su id.
     *
     * `GET /entity-branch-series/{id}`
     *
     * @param id Id de la serie.
     * @returns Datos de la serie.
     */
    getById(id: number): Observable<EntityBranchSerieDto>{
        return this.http.get<EntityBranchSerieDto>(`${this.baseUrl}/${id}`);
    }

    /**
     * Lista las series de un establecimiento de forma paginada.
     *
     * `GET /entity-branch-series/branch/{entityBranchId}/list/{pageNumber}/{pageSize}?search=`
     *
     * @param entityBranchId Id del establecimiento.
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de series con el total de registros.
     */
    getAll(entityBranchId: number, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityBranchSerieDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<EntityBranchSerieDto[]>>(`${this.baseUrl}/branch/${entityBranchId}/list/${pageNumber}/${pageSize}`, {
            params: httpParams
        });
    }


    /**
     * Lista las series de un establecimiento para usarlas en un select.
     *
     * `GET /entity-branch-series/branch/{entityBranchId}/to-select?search=`
     *
     * @param entityBranchId Id del establecimiento.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Lista de series en formato para select.
     */
    getToSelect(entityBranchId: number, search: string | null): Observable<EntityBranchSerieToSelectDto[]>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<EntityBranchSerieToSelectDto[]>(`${this.baseUrl}/branch/${entityBranchId}/to-select`,{
            params: httpParams
        });
    }

    /**
     * Elimina una serie.
     *
     * `DELETE /entity-branch-series/{id}`
     *
     * @param id Id de la serie a eliminar.
     * @returns Respuesta de la API con el resultado de la eliminación.
     */
    delete(id: number): Observable<ResponseDTO<DeleteResponseDto>> {
        return this.http.delete<ResponseDTO<DeleteResponseDto>>(`${this.baseUrl}/${id}`);
    }

    /**
     * Activa o desactiva una serie.
     *
     * `PUT /entity-branch-series/{id}/toggle-active`
     *
     * @param id Id de la serie.
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
     * Registra una nueva serie.
     *
     * `POST /entity-branch-series`
     *
     * @param request Datos de la serie a registrar.
     * @returns La serie registrada.
     */
    create(request: EntityBranchSerieCreateDto): Observable<EntityBranchSerieDto> {
        return this.http.post<EntityBranchSerieDto>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza los datos de una serie.
     *
     * `PUT /entity-branch-series/{id}`
     *
     * @param id Id de la serie a editar.
     * @param request Datos actualizados de la serie.
     * @returns La serie actualizada, con `created_at` y `updated_at` como `Date`.
     */
    update(id: number, request: EntityBranchSerieUpdateDto): Observable<EntityBranchSerieDto> {
        return this.http.put<EntityBranchSerieDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as EntityBranchSerieDto )
        );
    }

}