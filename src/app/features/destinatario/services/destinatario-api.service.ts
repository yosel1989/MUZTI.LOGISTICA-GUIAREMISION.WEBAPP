import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { DestinatarioBusqueda } from "../models/destinatario";
import { catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class DestinatarioApiService{
    private baseUrl = `${environment.apiUrl}/Destinatario`;

    constructor(private http: HttpClient) {}

    buscar(texto: string): Observable<DestinatarioBusqueda[]> {
        return this.http.get<any>(`${this.baseUrl}/listar-sugerido/${texto}`).pipe(
            map(response =>{ return response as DestinatarioBusqueda[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}