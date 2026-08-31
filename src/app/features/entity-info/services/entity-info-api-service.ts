import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { CompanyInfoDto, PersonInfoDto } from "../models/entity-info";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: "root"
})

export class EntityInfoApiService{

    private readonly http = inject(HttpClient);
    private baseUrl = '';

    constructor(){
        this.baseUrl = `${environment.apiUrl}/entity-info`;
    }

    getPersonInfo(documentNumber: string): Observable<PersonInfoDto>{
        return this.http.get<PersonInfoDto>(`${this.baseUrl}/dni/${documentNumber}`)
        .pipe(
            map((res) => res),
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        )
    }

    getCompanyInfo(documentNumber: string): Observable<CompanyInfoDto>{
        return this.http.get<CompanyInfoDto>(`${this.baseUrl}/ruc/${documentNumber}`)
        .pipe(
            map((res) => res),
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        )
    }

}