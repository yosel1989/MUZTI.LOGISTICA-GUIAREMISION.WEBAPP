import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { GuiaRemisionIndicadorTrasladoToSelectDto } from './../models/guia-remision-indicador-traslado';

@Injectable({
    providedIn: 'root'
})

export class GuiaRemisionIndicadorTrasladoService {
    http = inject(HttpClient);
    urlBase = '';

    constructor(){
        this.urlBase = `${environment.apiUrl}/guia-remision-indicadores-traslado`
    }

    getToSelect(): Observable<GuiaRemisionIndicadorTrasladoToSelectDto[]>{
        return this.http.get<GuiaRemisionIndicadorTrasladoToSelectDto[]>(`${this.urlBase}/to-select`).pipe(
            map((res: GuiaRemisionIndicadorTrasladoToSelectDto[]) => (res)),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }
}