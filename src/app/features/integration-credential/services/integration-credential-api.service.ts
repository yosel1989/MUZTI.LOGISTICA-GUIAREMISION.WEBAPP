import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { IntegrationCredentialCreateDto, IntegrationCredentialDto, IntegrationCredentialTableDto, IntegrationCredentialUpdateDto } from "../models/integration-credential.model";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { ResponseDTO } from "@features/shared/models/shared";

@Injectable({
    providedIn: "root"
})

export class IntegrationCredentialApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/integration-credentials`
    }


    getById(id: number): Observable<IntegrationCredentialDto>{
        return this.http.get<IntegrationCredentialDto>(`${this.baseUrl}/${id}`).pipe(
            map((res: IntegrationCredentialDto) => res),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<IntegrationCredentialTableDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<IntegrationCredentialTableDto[]>>(`${this.baseUrl}/collection/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map((response: TableData<IntegrationCredentialTableDto[]>) => {return {
                ...response,
                data: response.data.map((item: IntegrationCredentialTableDto) => ({
                    ...item,
                    created_at: new Date(item.created_at),
                    updated_at: item.updated_at ? new Date(item.updated_at) : null
                }) as IntegrationCredentialTableDto)            
            } as TableData<IntegrationCredentialTableDto[]> }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    toggleActive(id: number, request: ToggleActiveRequestDto ): Observable<ResponseDTO<ToggleActiveResponseDto>> {
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/toggle-active`, request).pipe(
            map((res: ResponseDTO<ToggleActiveResponseDto>) =>  res),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    create(request: IntegrationCredentialCreateDto): Observable<IntegrationCredentialDto> {
        return this.http.post<IntegrationCredentialDto>(`${this.baseUrl}`, request).pipe(
            map((res: IntegrationCredentialDto) => res),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    update(id: number, request: IntegrationCredentialUpdateDto): Observable<IntegrationCredentialDto> {
        return this.http.put<IntegrationCredentialDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(( response: IntegrationCredentialDto) => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as IntegrationCredentialDto ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getProviderToSelect(): Observable<{label: string, value:string}[]>{
        return this.http.get<{label: string, value:string}[]>(`${this.baseUrl}/provider-to-select`).pipe(
            map((res: {label: string, value:string}[]) => res),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    eliminar(id: number): Observable<DeleteResponseDto> {
        return this.http.delete<DeleteResponseDto>(`${this.baseUrl}/${id}`).pipe(
            map(response =>{ return response as DeleteResponseDto }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}