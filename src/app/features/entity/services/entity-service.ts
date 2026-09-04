import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { EntityCreateDto, EntityDto, EntityListDto, EntityUpdateDto } from "../models/entity";
import { catchError, map, Observable, throwError } from "rxjs";
import { TableData } from "@core/models/table";
import { ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { ResponseDTO } from "@features/shared/models/shared";

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

    putUpdate(request: EntityUpdateDto): Observable<EntityDto>{
        return this.http.put<EntityDto>(`${this.baseUrl}/${request.id}`, request).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
          map(response =>({ 
            ...response,
            data: {
              ...response.data,
              fecha_modifico: response.data.updated_at ? new Date(response.data.updated_at) : null
            }
          })),
          catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
          })
        );
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

    getList(pageNumber: number, pageSize: number, search: string | null, type: 'empresa' | 'persona' | null): Observable<TableData<EntityListDto[]>>{
        let httpParams = new HttpParams();
        httpParams = search ? httpParams.set('search', search) : httpParams;
        httpParams = type ? httpParams.set('type', type) : httpParams;

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