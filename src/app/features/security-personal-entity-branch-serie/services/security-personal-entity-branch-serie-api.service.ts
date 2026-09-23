import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "@core/models/table";
import { SecurityPersonalEntityBranchSerieCreateDto, SecurityPersonalEntityBranchSerieDto } from "../models/security-personal-entity-branch-serie";

@Injectable({
    providedIn: 'root',
})

export class SecurityPersonalEntityBranchSerieApiService {
    private baseUrl = environment.apiUrl + '/security-personal-entity-branch-series';
    constructor(private httpClient: HttpClient) { }

    create(request: SecurityPersonalEntityBranchSerieCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request).pipe(
            map(response => response),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        );

    }

    getCollection(securityPersonalId: number, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<SecurityPersonalEntityBranchSerieDto[]>>{

        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<SecurityPersonalEntityBranchSerieDto[]>>(`${this.baseUrl}/${securityPersonalId}/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )

    }

    delete(securityPersonalId: number, entityBranchSerieId: number): Observable<boolean>{

        return this.httpClient.delete<boolean>(`${this.baseUrl}/${securityPersonalId}/${entityBranchSerieId}`).pipe(
            map(response => response ),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        );
    }

}