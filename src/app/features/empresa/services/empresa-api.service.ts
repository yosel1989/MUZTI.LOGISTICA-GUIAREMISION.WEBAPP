import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { EmpresaToSelectDto } from "../models/empresa.model";

/**
 * Servicio para consumir los endpoints de empresas.
 *
 * Base: `{apiUrl}/Empresa`
 */
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

    /**
     * Lista las empresas para usarlas en un select.
     *
     * `GET /Empresa`
     *
     * @returns Lista de empresas en formato para select.
     */
    loadAllToSelect(): Observable<EmpresaToSelectDto[]>{
        return this.http.get<EmpresaToSelectDto[]>(`${this.baseUrl}`)
    }
}