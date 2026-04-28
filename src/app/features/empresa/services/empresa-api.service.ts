import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EmpresaToSelectDto } from "../models/empresa.model";

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

    loadAllToSelect(): Observable<EmpresaToSelectDto[]>{
        return this.http.get(`${this.baseUrl}`).pipe(
            map((res) => {
                return res as EmpresaToSelectDto[];
            }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }
}