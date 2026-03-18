import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EmpresaDto } from "../models/empresa.model";

@Injectable({
    providedIn: "root"
})
export class EmpresaApiService{

    baseUrl: string = '';

    constructor(
        private http: HttpClient
    ){
        this.baseUrl = `${environment.apiUrl}/Empresa`;
    }

    obtenerTodo(): Observable<EmpresaDto[]>{
        return this.http.get(`${this.baseUrl}`).pipe(
            map((res) => {
                return res as EmpresaDto[];
            }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }
}