import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PermisoDTO } from "../models/permiso.model";
import { catchError, map, Observable, throwError } from "rxjs";
import { PermisoAsignarPerfilesDTO } from '@features/permiso/models/permiso.model';
import { environment } from "environments/environment";

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
    
    getPermisos(): Observable<PermisoDTO[]>{
        return this.http.get<PermisoDTO[]>(`${this.baseUrl}/listar`).pipe(
            map((response: PermisoDTO[]) => response || []),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }

    postAsignarPerfiles(permisos: PermisoAsignarPerfilesDTO[]): Observable<boolean>{
        return this.http.post<boolean>(`${this.baseUrl}/asignar-perfiles`, permisos).pipe(
            map((response: boolean) => response || false),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }
}