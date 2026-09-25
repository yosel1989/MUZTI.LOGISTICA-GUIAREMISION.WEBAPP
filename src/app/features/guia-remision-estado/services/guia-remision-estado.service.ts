import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { EstadoAsignarPermisosDTO, GuiaRemisionEstadoDTO, GuiaRemisionEstadoWithPermisosDTO } from "../models/guia-remision-estado.model";
import { environment } from "environments/environment";

/**
 * Servicio para consumir los endpoints de estados de la guía de remisión y sus permisos.
 *
 * Base: `{apiUrl}/guia-remision-estados`
 */
@Injectable({
    providedIn: "root",
})

export class GuiaRemisionEstadoApiService {

    private baseUrl = "";

    constructor(
        private http: HttpClient
    ) {
        this.baseUrl = `${environment.apiUrl}/guia-remision-estados`;
    }   
    
    /**
     * Lista los estados de la guía de remisión.
     *
     * `GET /guia-remision-estados`
     *
     * @returns Lista de estados (vacía si la API no devuelve datos).
     */
    getAll(): Observable<GuiaRemisionEstadoDTO[]>{
        return this.http.get<any>(`${this.baseUrl}`).pipe(
            map((response: GuiaRemisionEstadoDTO[]) => response || [])
        )
    }

    /**
     * Lista los estados de la guía de remisión con los permisos asignados a cada uno.
     *
     * `GET /guia-remision-estados/permisos`
     *
     * @returns Lista de estados con sus permisos (vacía si la API no devuelve datos).
     */
    getAllWithPermisos(): Observable<GuiaRemisionEstadoWithPermisosDTO[]>{
        return this.http.get<any>(`${this.baseUrl}/permisos`).pipe(
            map((response: GuiaRemisionEstadoWithPermisosDTO[]) => response || [])
        )
    }

    /**
     * Asigna permisos a los estados de la guía de remisión.
     *
     * `POST /guia-remision-estados/asignar-permisos`
     *
     * @param permisos Lista de estados con los ids de permisos a asignar.
     * @returns `true` si se guardaron los permisos.
     */
    postAsignarPermisos(permisos: EstadoAsignarPermisosDTO[]): Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/asignar-permisos`, permisos).pipe(
            map((response: boolean) => response || false)
        )
    }
}