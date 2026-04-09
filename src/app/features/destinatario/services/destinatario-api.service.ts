import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { DestinatarioDto, DestinatarioSugeridoDto } from "../models/destinatario";
import { catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class DestinatarioApiService{
    private baseUrl = `${environment.apiUrl}/Destinatario`;

    constructor(private http: HttpClient) {}

    buscar(texto: string | null): Observable<DestinatarioSugeridoDto[]> {

        let params = new HttpParams();
        if (texto) {
            params = params.set('numeroDoc', texto);
        }

        return this.http.get<any>(`${this.baseUrl}/listar-sugerido`, { params }).pipe(
            map(response =>{ return response as DestinatarioSugeridoDto[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getById(id: number): Observable<DestinatarioDto> {
        return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
            map(response =>{ return response as DestinatarioDto }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}