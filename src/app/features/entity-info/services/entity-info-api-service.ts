import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { CompanyInfoDto, PersonInfoDto } from "../models/entity-info";
import { Observable } from "rxjs";

/**
 * Servicio para consultar datos de personas (DNI) y empresas (RUC) en fuentes externas.
 *
 * Base: `{apiUrl}/entity-info`
 */
@Injectable({
    providedIn: "root"
})

export class EntityInfoApiService{

    private readonly http = inject(HttpClient);
    private baseUrl = '';

    constructor(){
        this.baseUrl = `${environment.apiUrl}/entity-info`;
    }

    /**
     * Consulta los datos de una persona por su DNI.
     *
     * `GET /entity-info/dni/{documentNumber}`
     *
     * @param documentNumber Número de DNI.
     * @returns Datos de la persona.
     */
    getPersonInfo(documentNumber: string): Observable<PersonInfoDto>{
        return this.http.get<PersonInfoDto>(`${this.baseUrl}/dni/${documentNumber}`)
    }

    /**
     * Consulta los datos de una empresa por su RUC.
     *
     * `GET /entity-info/ruc/{documentNumber}`
     *
     * @param documentNumber Número de RUC.
     * @returns Datos de la empresa.
     */
    getCompanyInfo(documentNumber: string): Observable<CompanyInfoDto>{
        return this.http.get<CompanyInfoDto>(`${this.baseUrl}/ruc/${documentNumber}`)
    }

}