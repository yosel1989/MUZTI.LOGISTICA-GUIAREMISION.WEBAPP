import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { ActualizarEstadoEstablecimientoRequestDTO, ActualizarEstadoEstablecimientoResponseDTO, EditarEstablecimientoRequestDTO, EliminarEstablecimientoResponseDTO, EstablecimientoDTO, EstablecimientoListToModalDTO, RegistrarEstablecimientoRequestDTO } from "../models/establecimiento.model";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";

@Injectable({
    providedIn: "root"
})

export class EstablecimientoApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/establecimientos`
    }

    getAllToModalByRuc(ruc: string, search: string | null): Observable<EstablecimientoListToModalDTO[]>{
        const httpHeaders = new HttpHeaders();
        if(search){
            httpHeaders.append('search', search);
        }

        return this.http.get<any>(`${this.baseUrl}/listar-sugerido/${ruc}`, {
            headers: httpHeaders
        }).pipe(
            map(response =>{ return response as EstablecimientoListToModalDTO[] }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getById(id: number): Observable<EstablecimientoDTO>{
        return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
            map(response =>{ return response as EstablecimientoDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<EstablecimientoDTO[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map(response =>{ return response as TableData<EstablecimientoDTO[]> }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    delete(id: number): Observable<EliminarEstablecimientoResponseDTO> {
        return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
            map(response =>{ return response as EliminarEstablecimientoResponseDTO }),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    actualizarEstado(id: number, request: ActualizarEstadoEstablecimientoRequestDTO ): Observable<ActualizarEstadoEstablecimientoResponseDTO> {
        return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
            map(response =>{ return response as ActualizarEstadoEstablecimientoResponseDTO }),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    registrar(request: RegistrarEstablecimientoRequestDTO): Observable<RegistrarEstablecimientoRequestDTO> {
        return this.http.post<any>(`${this.baseUrl}`, request).pipe(
            map(response =>{ return response as RegistrarEstablecimientoRequestDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    editar(id: number, request: EditarEstablecimientoRequestDTO): Observable<EstablecimientoDTO> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                fecha_creacion: new Date(response.fecha_creacion),
                fecha_edicion: response.fecha_edicion ? new Date(response.fecha_edicion) : null
            }) as EstablecimientoDTO ),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }
}