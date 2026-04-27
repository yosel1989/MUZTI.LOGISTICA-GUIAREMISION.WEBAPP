import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EstablecimientoDTO, EstablecimientoListToModalDTO } from "../models/establecimiento.model";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})

export class EstablecimientoApiService{

    private urlBase = "";

    constructor( private http: HttpClient){
        this.urlBase = `${environment.apiUrl}/establecimientos`
    }

    getAllToModalByRuc(ruc: string, search: string | null): Observable<EstablecimientoListToModalDTO[]>{
        const httpHeaders = new HttpHeaders();
        if(search){
            httpHeaders.append('search', search);
        }

        return this.http.get<any>(`${this.urlBase}/listar-sugerido/${ruc}`, {
            headers: httpHeaders
        }).pipe(
            map(response =>{ return response as EstablecimientoListToModalDTO[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getById(id: number): Observable<EstablecimientoDTO>{
        return this.http.get<any>(`${this.urlBase}/buscar-por-id/${id}`).pipe(
            map(response =>{ return response as EstablecimientoDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

}