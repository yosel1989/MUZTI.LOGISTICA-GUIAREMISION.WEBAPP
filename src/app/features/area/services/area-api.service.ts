import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TableData } from "@core/models/table";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { AreaCreateDto, AreaDto, AreaToSelectDto, AreaUpdateDto } from "../models/area";

/**
 * Servicio para consumir los endpoints de area.
 *
 * Base: `{apiUrl}/areas`
 */
@Injectable({
    providedIn: 'root',
})

export class AreaApiService {
    private baseUrl = environment.apiUrl + '/areas';
    constructor(private httpClient: HttpClient) { }

    /**
     * Registra un nuevo area.
     *
     * `POST /areas`
     *
     * @param request Datos del area a registrar.
     * @returns Id del area registrado.
     */
    create(request: AreaCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request);
    }

    /**
     * Actualiza los datos de un area.
     *
     * `PUT /areas/{request.id}`
     *
     * @param request Datos actualizados; `request.id` indica el area a editar.
     * @returns El area actualizado.
     */
    update(request: AreaUpdateDto): Observable<AreaDto>{

        return this.httpClient.put<AreaDto>(`${this.baseUrl}/${request.id}`, request);
    }

    /**
     * Lista el area de forma paginada.
     *
     * `GET /areas/{pageNumber}/{pageSize}?search=`
     *
     * @param pageNumber Número de página.
     * @param pageSize Cantidad de registros por página.
     * @param search Texto para filtrar; si es `null` no se filtra.
     * @returns Página de area con el total de registros.
     */
    getCollection(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<AreaDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<AreaDto[]>>(`${this.baseUrl}/to-table/${pageNumber}/${pageSize}`, { params: httpParams })
    }

    /**
     * Obtiene un area por su id.
     *
     * `GET /areas/{area_id}`
     *
     * @param area_id Id del area.
     * @returns Datos del area.
     */
    getById(area_id: number): Observable<AreaDto>{

        return this.httpClient.get<AreaDto>(`${this.baseUrl}/${area_id}`);
    }

    /**
     * Cambia el estado activo o inactivo de un area por su id.
     *
     * `GET /areas/{area_id}/toggle-active`
     *
     * @param area_id Id del area.
     * @param active boolean true = activo y false = inactivo.
     * @returns Datos del area.
     */
    toogleActive(area_id: number, active: boolean): Observable<AreaDto>{

        return this.httpClient.put<AreaDto>(`${this.baseUrl}/${area_id}/toggle-active`,{active});
    }

    /**
     * Lista el area para seleccionar.
     *
     * `GET /areas/to-select?level=`
     *
     * @param level Número para filtrar; si es `null` no se filtra.
     * @returns Listado de area con el total de registros.
     */
    getToSelect(level: number | null): Observable<AreaToSelectDto[]>{
        let httpParams = new HttpParams();
        httpParams = level 
        ? httpParams.set('level', level) 
        : httpParams;
        
        return this.httpClient.get<AreaToSelectDto[]>(`${this.baseUrl}/to-select`, { params: httpParams })
    }

}