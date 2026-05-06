import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment.development";
import { PermisoDTO } from "../models/permiso.model";
import { catchError, map, Observable, throwError } from "rxjs";
import { PermisoAsignarPerfilesDTO } from '@features/permiso/models/permiso.model';

@Injectable({
    providedIn: "root",
})

export class PermisoApiService {

    private readonly API_URL = environment.apiUrl + "/permisos";

    constructor(
        private http: HttpClient
    ) {}   
    
    getPermisos(): Observable<PermisoDTO[]>{
        return this.http.get<PermisoDTO[]>(`${this.API_URL}/listar`).pipe(
            map((response: PermisoDTO[]) => response || []),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }

    postAsignarPerfiles(permisos: PermisoAsignarPerfilesDTO[]): Observable<boolean>{
        return this.http.post<boolean>(`${this.API_URL}/asignar-perfiles`, permisos).pipe(
            map((response: boolean) => response || false),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }
}