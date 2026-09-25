import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { IntegrationCredentialCreateDto, IntegrationCredentialDto, IntegrationCredentialTableDto, IntegrationCredentialUpdateDto } from "../models/integration-credential.model";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { ResponseDTO } from "@features/shared/models/shared";

/**
 * Servicio para consumir los endpoints de credenciales de integración con proveedores externos.
 *
 * Base: `{apiUrl}/integration-credentials`
 */
@Injectable({
    providedIn: "root"
})

export class IntegrationCredentialApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/integration-credentials`
    }


    /**
     * Obtiene una credencial de integración por su id.
     *
     * `GET /integration-credentials/{id}`
     *
     * @param id Id de la credencial.
     * @returns Datos de la credencial.
     */
    getById(id: number): Observable<IntegrationCredentialDto>{
        return this.http.get<IntegrationCredentialDto>(`${this.baseUrl}/${id}`);
    }


    /**
     * Lista las credenciales de integración de forma paginada.
     *
     * `GET /integration-credentials/collection/{pageNumber}/{pageSize}?search=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de credenciales, con `created_at` y `updated_at` como `Date`.
     */
    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<IntegrationCredentialTableDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<IntegrationCredentialTableDto[]>>(`${this.baseUrl}/collection/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map((response: TableData<IntegrationCredentialTableDto[]>) => {return {
                ...response,
                data: response.data.map((item: IntegrationCredentialTableDto) => ({
                    ...item,
                    created_at: new Date(item.created_at),
                    updated_at: item.updated_at ? new Date(item.updated_at) : null
                }) as IntegrationCredentialTableDto)            
            } as TableData<IntegrationCredentialTableDto[]> })
        );
    }

    /**
     * Activa o desactiva una credencial de integración.
     *
     * `PUT /integration-credentials/{id}/toggle-active`
     *
     * @param id Id de la credencial.
     * @param request Nuevo estado (activo/inactivo).
     * @returns Respuesta de la API con el estado actualizado.
     */
    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/toggle-active`, request);
    }

    /**
     * Registra una nueva credencial de integración.
     *
     * `POST /integration-credentials`
     *
     * @param request Datos de la credencial a registrar.
     * @returns La credencial registrada.
     */
    create(request: IntegrationCredentialCreateDto): Observable<IntegrationCredentialDto> {
        return this.http.post<IntegrationCredentialDto>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza una credencial de integración.
     *
     * `PUT /integration-credentials/{id}`
     *
     * @param id Id de la credencial a editar.
     * @param request Datos actualizados de la credencial.
     * @returns La credencial actualizada, con `created_at` y `updated_at` como `Date`.
     */
    update(id: number, request: IntegrationCredentialUpdateDto): Observable<IntegrationCredentialDto> {
        return this.http.put<IntegrationCredentialDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(( response: IntegrationCredentialDto) => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as IntegrationCredentialDto )
        );
    }

    /**
     * Lista los proveedores de integración disponibles para usarlos en un select.
     *
     * `GET /integration-credentials/provider-to-select`
     *
     * @returns Lista de proveedores como `{ label, value }`.
     */
    getProviderToSelect(): Observable<{label: string, value:string}[]>{
        return this.http.get<{label: string, value:string}[]>(`${this.baseUrl}/provider-to-select`);
    }

    /**
     * Elimina una credencial de integración.
     *
     * `DELETE /integration-credentials/{id}`
     *
     * @param id Id de la credencial a eliminar.
     * @returns Respuesta de la API con el resultado de la eliminación.
     */
    eliminar(id: number): Observable<DeleteResponseDto> {
        return this.http.delete<DeleteResponseDto>(`${this.baseUrl}/${id}`);
    }
}