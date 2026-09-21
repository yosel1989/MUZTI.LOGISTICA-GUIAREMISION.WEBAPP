import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { SecurityPersonalCreateDto, SecurityPersonalDto, SecurityPersonalUpdateDto } from "../models/security-personal";
import { TableData } from "@core/models/table";

@Injectable({
    providedIn: 'root',
})

export class SecurityPersonalApiService {
    private baseUrl = environment.apiUrl + '/security-personal';
    constructor(private httpClient: HttpClient) { }

    create(request: SecurityPersonalCreateDto): Observable<number>{

        return this.httpClient.post<number>(`${this.baseUrl}`, request).pipe(
            map(response => response),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        );
    }

    updated(request: SecurityPersonalUpdateDto): Observable<SecurityPersonalDto>{

        return this.httpClient.put<SecurityPersonalDto>(`${this.baseUrl}/${request.id}`, request).pipe(
            map(response => response),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        );
    }

    getCollection(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<SecurityPersonalDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.httpClient.get<TableData<SecurityPersonalDto[]>>(`${this.baseUrl}/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getPersonalPorId(securityPersonalId: number): Observable<SecurityPersonalDto>{

        return this.httpClient.get<SecurityPersonalDto>(`${this.baseUrl}/${securityPersonalId}`).pipe(
            map(response => response as SecurityPersonalDto),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        );
    }

}