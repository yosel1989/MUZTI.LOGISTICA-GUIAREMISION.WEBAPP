import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { EntityCreateDto, EntityDto, EntityListDto } from "../models/entity";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "@core/models/table";

@Injectable({
    providedIn: 'root'
})

export class EntityApiService {

    private http = inject(HttpClient);
    private baseUrl = '';

    constructor() {
        this.baseUrl = `${environment.apiUrl}/entities`;
    }

    postCreate(request: EntityCreateDto): Observable<EntityDto>{
        return this.http.post<EntityDto>(`${this.baseUrl}`, request).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getCollection(role: string, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.http.get<TableData<EntityDto[]>>(`${this.baseUrl}/collection/${role}/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getList(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityListDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search 
        ? httpParams.set('search', search) 
        : httpParams;
        
        return this.http.get<TableData<EntityListDto[]>>(`${this.baseUrl}/list/${pageNumber}/${pageSize}`, { params: httpParams }).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getById(id: number): Observable<EntityDto>{
        return this.http.get<EntityDto>(`${this.baseUrl}/${id}`).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }
}   