import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { ActualizarEstadoPerfilRequestDTO, ActualizarEstadoPerfilResponseDTO, EditarPerfilRequestDTO, EliminarPerfilResponseDTO, PerfilDTO, PerfilListToSelectDTO, RegistrarPerfilRequestDTO } from "../models/perfil.model";

/**
 * Servicio para consumir los endpoints de perfiles de usuario.
 *
 * Base: `{apiUrl}/perfiles`
 */
@Injectable({
    providedIn: "root"
})

export class PerfilApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/perfiles`
    }


    /**
     * Obtiene un perfil por su id.
     *
     * `GET /perfiles/buscar-por-id/{id}`
     *
     * @param id Id del perfil.
     * @returns Datos del perfil.
     */
    getById(id: number): Observable<PerfilDTO>{
        return this.http.get<PerfilDTO>(`${this.baseUrl}/buscar-por-id/${id}`);
    }


    /**
     * Lista los perfiles de forma paginada.
     *
     * `GET /perfiles/listar/{pageNumber}/{pageSize}?search=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de perfiles, con `fecha_registro` y `fecha_modifico` como `Date`.
     */
    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<PerfilDTO[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map((response: any) => {return {
                ...response,
                data: response.data.map((item: any) => ({
                    ...item,
                    fecha_registro: new Date(item.fecha_registro),
                    fecha_modifico: item.fecha_modifico ? new Date(item.fecha_modifico) : null
                }) as PerfilDTO)            
            } as TableData<PerfilDTO[]> })
        );
    }

    /**
     * Elimina un perfil.
     *
     * `DELETE /perfiles/{id}`
     *
     * @param id Id del perfil a eliminar.
     * @returns Respuesta de la API con el resultado de la eliminación.
     */
    delete(id: number): Observable<EliminarPerfilResponseDTO> {
        return this.http.delete<EliminarPerfilResponseDTO>(`${this.baseUrl}/${id}`);
    }

    /**
     * Activa o desactiva un perfil.
     *
     * `PUT /perfiles/{id}/actualizar-estado`
     *
     * @param id Id del perfil.
     * @param request Nuevo estado (activo/inactivo).
     * @returns Respuesta de la API con el estado actualizado.
     */
    actualizarEstado(id: number, request: ActualizarEstadoPerfilRequestDTO ): Observable<ActualizarEstadoPerfilResponseDTO> {
        return this.http.put<ActualizarEstadoPerfilResponseDTO>(`${this.baseUrl}/${id}/actualizar-estado`, request);
    }

    /**
     * Registra un nuevo perfil.
     *
     * `POST /perfiles`
     *
     * @param request Datos del perfil a registrar.
     * @returns Respuesta de la API con el perfil registrado.
     */
    registrar(request: RegistrarPerfilRequestDTO): Observable<RegistrarPerfilRequestDTO> {
        return this.http.post<RegistrarPerfilRequestDTO>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza los datos de un perfil.
     *
     * `PUT /perfiles/{id}`
     *
     * @param id Id del perfil a editar.
     * @param request Datos actualizados del perfil.
     * @returns El perfil actualizado, con `fecha_creacion` y `fecha_edicion` como `Date`.
     */
    editar(id: number, request: EditarPerfilRequestDTO): Observable<PerfilDTO> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                fecha_creacion: new Date(response.fecha_creacion),
                fecha_edicion: response.fecha_edicion ? new Date(response.fecha_edicion) : null
            }) as PerfilDTO )
        );
    }

    /**
     * Lista los perfiles para usarlos en un select.
     *
     * `GET /perfiles/listar-para-select`
     *
     * @returns Lista de perfiles en formato para select.
     */
    getAllToSelect(): Observable<PerfilListToSelectDTO[]>{
        return this.http.get<PerfilListToSelectDTO[]>(`${this.baseUrl}/listar-para-select`);
    }
}