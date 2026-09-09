import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { ResponseDTO } from "@features/shared/models/shared";
import { DeleteResponseDto, ToggleActiveRequestDto, ToggleActiveResponseDto } from "app/shared/models/request";
import { EntityBranchCreateDto, EntityBranchDto, EntityBranchListToModalDTO, EntityBranchListToSelectDTO, EntityBranchUpdateDto, EstablecimientoRemitenteGuiaDTO } from "../models/entity-branch";

@Injectable({
    providedIn: "root"
})

export class EntityBranchApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/entity-branchs`
    }

    getAllToModalByRuc(entityId: number, search: string | null): Observable<EntityBranchListToModalDTO[]>{
        let httpParams = new HttpParams();
        if (search) {
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<EntityBranchListToModalDTO[]>(`${this.baseUrl}/listar-sugerido/${entityId}`, { params: httpParams }).pipe(
            map(response =>{ return response as EntityBranchListToModalDTO[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getById(id: number): Observable<EntityBranchDto>{
        return this.http.get<EntityBranchDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
            map(response => response ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EntityBranchDto[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<TableData<EntityBranchDto[]>>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map(response =>{ return response as TableData<EntityBranchDto[]> }),
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
        return this.http.put<ResponseDTO<ToggleActiveResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
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

    registrar(request: EntityBranchCreateDto): Observable<EntityBranchDto> {
        return this.http.post<EntityBranchDto>(`${this.baseUrl}`, request).pipe(
            map(response => response),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    update(id: number, request: EntityBranchUpdateDto): Observable<EntityBranchDto> {
        return this.http.put<EntityBranchDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                created_at: new Date(response.created_at),
                updated_at: response.updated_at ? new Date(response.updated_at) : null
            }) as EntityBranchDto ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getByIdToGuia(entityBranchId: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<EstablecimientoRemitenteGuiaDTO> {
        return this.http.get<EstablecimientoRemitenteGuiaDTO>(`${this.baseUrl}/buscar-por-id-para-guia/${entityBranchId}/${tipoGuia}`).pipe(
            map(response =>{ return response as EstablecimientoRemitenteGuiaDTO})
        );
    }


    getAllToSelectByRuc(ruc: string): Observable<EntityBranchListToSelectDTO[]>{
        return this.http.get<EntityBranchListToSelectDTO[]>(`${this.baseUrl}/listar-select/por-ruc/${ruc}`).pipe(
            map(response => response ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}