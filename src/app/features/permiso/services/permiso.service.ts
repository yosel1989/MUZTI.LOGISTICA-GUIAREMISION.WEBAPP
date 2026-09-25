import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PermisoDTO } from "../models/permiso.model";
import { map, Observable } from "rxjs";
import { PermisoAsignarPerfilesDTO } from '@features/permiso/models/permiso.model';
import { environment } from "environments/environment";

/**
 * Servicio para consumir los endpoints de permisos.
 *
 * Base: `{apiUrl}/permisos`
 */
@Injectable({
    providedIn: "root",
})

export class PermisoApiService {

    private baseUrl = "";

    constructor(
        private http: HttpClient
    ) {
        this.baseUrl = `${environment.apiUrl}/permisos`;
    }   
    
    /**
     * Lista los permisos del sistema.
     *
     * `GET /permisos/listar`
     *
     * @returns Lista de permisos (vacía si la API no devuelve datos).
     */
    getPermisos(): Observable<PermisoDTO[]>{
        return this.http.get<PermisoDTO[]>(`${this.baseUrl}/listar`).pipe(
            map((response: PermisoDTO[]) => response || [])
        )
    }

    /**
     * Asigna perfiles a los permisos.
     *
     * `POST /permisos/asignar-perfiles`
     *
     * @param permisos Lista de permisos con los ids de perfiles a asignar.
     * @returns `true` si se guardaron las asignaciones.
     */
    postAsignarPerfiles(permisos: PermisoAsignarPerfilesDTO[]): Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/asignar-perfiles`, permisos).pipe(
            map((response: boolean) => response || false)
        )
    }
}