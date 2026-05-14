import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment.development";
import { catchError, map, Observable, throwError } from "rxjs";
import { EstadoAsignarPermisosDTO, GuiaRemisionEstadoDTO, GuiaRemisionEstadoWithPermisosDTO } from "../models/guia-remision-estado.model";

@Injectable({
    providedIn: "root",
})

export class GuiaRemisionEstadoApiService {

    private readonly API_URL = environment.apiUrl + "/guia-remision-estados";

    constructor(
        private http: HttpClient
    ) {}   
    
    getAll(): Observable<GuiaRemisionEstadoDTO[]>{
        return this.http.get<any>(`${this.API_URL}`).pipe(
            map((response: GuiaRemisionEstadoDTO[]) => response || []),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }

    getAllWithPermisos(): Observable<GuiaRemisionEstadoWithPermisosDTO[]>{
        return this.http.get<any>(`${this.API_URL}/permisos`).pipe(
            map((response: GuiaRemisionEstadoWithPermisosDTO[]) => response || []),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }

    postAsignarPermisos(permisos: EstadoAsignarPermisosDTO[]): Observable<boolean>{
        return this.http.post<boolean>(`${this.API_URL}/asignar-permisos`, permisos).pipe(
            map((response: boolean) => response || false),
            catchError((error) => {
                return throwError(() => error);
            })
        )
    }
}