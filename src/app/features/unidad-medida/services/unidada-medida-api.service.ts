import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { UnidadMedidaToSelectDto } from "../models/unidad-medida.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class UnidadMedidaApiService{

    private baseUrl = `${environment.apiUrl}/unidad-medida`;

    constructor(private http: HttpClient) {}

    getAllToSelect(): Observable<UnidadMedidaToSelectDto[]> {
        return this.http.get<any>(`${this.baseUrl}/listar-para-select`).pipe(
            map(response =>{ return response as UnidadMedidaToSelectDto[]}),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }

}