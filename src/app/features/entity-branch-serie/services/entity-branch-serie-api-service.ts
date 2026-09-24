import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TableData } from "@core/models/table";
import { ResponseDTO } from "@features/shared/models/shared";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EntityBranchSerieCreateDto, EntityBranchSerieDto, EntityBranchSerieToSelectDto, EntityBranchSerieUpdateDto } from "../models/entity-branch-serie";

@Injectable({
    providedIn: "root"
})

export class EntityBranchSerieApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/entity-branch-series`
    }

    getById(id: number): Observable<EntityBranchSerieDto>{
        return this.http.get<EntityBranchSerieDto>(`${this.baseUrl}/${id}`).pipe(
            map(response => response ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getAll(entityBranchId: number, pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityBranchSerieDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<EntityBranchSerieDto[]>>(`${this.baseUrl}/branch/${entityBranchId}/list/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map(response =>{ return response as TableData<EntityBranchSerieDto[]> }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getToSelect(entityBranchId: number, search: string | null): Observable<EntityBranchSerieToSelectDto[]>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<EntityBranchSerieToSelectDto[]>(`${this.baseUrl}/branch/${entityBranchId}/to-select`,{
            params: httpParams
        }).pipe(
            map(response => response ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    delete(id: number): Observable<ResponseDTO<DeleteResponseDto>> {
        return this.http.delete<ResponseDTO<DeleteResponseDto>>(`${this.baseUrl}/${id}`).pipe(
            map(response =>{ return response}),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/toggle-active`, request).pipe(
            map(response => ({  
                ...response,
                data: {
                    ...response.data,
                    updated_at: response.data.updated_at ? new Date(response.data.updated_at) : null,
                    updated_at_user: response.data.updated_at_user,
                    updated_at_user_name: response.data.updated_at_user_name
                }

            }) as ResponseDTO<ToggleActiveResponseDto>),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    create(request: EntityBranchSerieCreateDto): Observable<EntityBranchSerieDto> {
        return this.http.post<EntityBranchSerieDto>(`${this.baseUrl}`, request).pipe(
            map(response => response),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    update(id: number, request: EntityBranchSerieUpdateDto): Observable<EntityBranchSerieDto> {
        return this.http.put<EntityBranchSerieDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as EntityBranchSerieDto ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

}