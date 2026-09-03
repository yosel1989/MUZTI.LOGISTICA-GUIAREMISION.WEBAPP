import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoEstablecimientoRequestDTO, EditarEstablecimientoRequestDTO, EliminarEstablecimientoResponseDTO, EntityBranchDto, EstablecimientoListToModalDTO, EstablecimientoListToSelectDTO, EstablecimientoRemitenteGuiaDTO, RegistrarEstablecimientoRequestDTO } from "../models/entity-branch";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { ActualizarEstadoResponseDto, ResponseDTO } from "@features/shared/models/shared";

@Injectable({
    providedIn: "root"
})

export class EntityBranchApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/establecimientos`
    }

    getAllToModalByRuc(ruc: string, search: string | null): Observable<EstablecimientoListToModalDTO[]>{
        let httpParams = new HttpParams();
        if (search) {
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<EstablecimientoListToModalDTO[]>(`${this.baseUrl}/listar-sugerido/${ruc}`, { params: httpParams }).pipe(
            map(response =>{ return response as EstablecimientoListToModalDTO[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getById(id: number): Observable<EntityBranchDto>{
        return this.http.get<EntityBranchDto>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
            map(response =>{ return response as EntityBranchDto }),
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

    delete(id: number): Observable<EliminarEstablecimientoResponseDTO> {
        return this.http.delete<EliminarEstablecimientoResponseDTO>(`${this.baseUrl}/${id}`).pipe(
            map(response =>{ return response as EliminarEstablecimientoResponseDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    actualizarEstado(id: number, request: ActualizarEstadoEstablecimientoRequestDTO ): Observable<ResponseDTO<ActualizarEstadoResponseDto>> {
        return this.http.put<ResponseDTO<ActualizarEstadoResponseDto>>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
            map(response => ({  
                ...response,
                data: {
                    ...response.data,
                    fecha_modifico: response.data.fecha_modifico ? new Date(response.data.fecha_modifico) : null
                }

            }) as ResponseDTO<ActualizarEstadoResponseDto>),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    registrar(request: RegistrarEstablecimientoRequestDTO): Observable<RegistrarEstablecimientoRequestDTO> {
        return this.http.post<RegistrarEstablecimientoRequestDTO>(`${this.baseUrl}`, request).pipe(
            map(response =>{ return response as RegistrarEstablecimientoRequestDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    editar(id: number, request: EditarEstablecimientoRequestDTO): Observable<EntityBranchDto> {
        return this.http.put<EntityBranchDto>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                fecha_registro: new Date(response.fecha_registro),
                fecha_modifico: response.fecha_modifico ? new Date(response.fecha_modifico) : null
            }) as EntityBranchDto ),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getByIdToGuia(idEstablecimiento: number, tipoGuia: 'TRANSPORTISTA' | 'REMITENTE' | string): Observable<EstablecimientoRemitenteGuiaDTO> {
        return this.http.get<EstablecimientoRemitenteGuiaDTO>(`${this.baseUrl}/buscar-por-id-para-guia/${idEstablecimiento}/${tipoGuia}`).pipe(
            map(response =>{ return response as EstablecimientoRemitenteGuiaDTO})
        );
    }


    getAllToSelectByRuc(ruc: string): Observable<EstablecimientoListToSelectDTO[]>{
        return this.http.get<EstablecimientoListToSelectDTO[]>(`${this.baseUrl}/listar-select/por-ruc/${ruc}`).pipe(
            map(response =>{ return response as EstablecimientoListToSelectDTO[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}