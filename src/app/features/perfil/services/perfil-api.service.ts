import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { TableData } from "@core/models/table";
import { ActualizarEstadoPerfilRequestDTO, ActualizarEstadoPerfilResponseDTO, EditarPerfilRequestDTO, EliminarPerfilResponseDTO, PerfilDTO, PerfilListToSelectDTO, RegistrarPerfilRequestDTO } from "../models/perfil.model";

@Injectable({
    providedIn: "root"
})

export class PerfilApiService{

    private baseUrl = "";

    constructor( private http: HttpClient){
        this.baseUrl = `${environment.apiUrl}/perfiles`
    }


    getById(id: number): Observable<PerfilDTO>{
        return this.http.get<any>(`${this.baseUrl}/buscar-por-id/${id}`).pipe(
            map(response =>{ return response as PerfilDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


    getAll(pageNumber: number, pageSize: number, search: string | null): Observable<TableData<PerfilDTO[]>>{
        let httpParams = new HttpParams();
        if(search){
            httpParams = httpParams.set('search', search);
        }

        return this.http.get<any>(`${this.baseUrl}/listar/${pageNumber}/${pageSize}`, {
            params: httpParams
        }).pipe(
            map((response: any) => {return {
                ...response,
                data: response.data.map((item: any) => ({
                    ...item,
                    fecha_registro: new Date(item.fecha_registro),
                    fecha_modifico: item.fecha_modifico ? new Date(item.fecha_modifico) : null
                }) as PerfilDTO)            
            } as TableData<PerfilDTO[]> }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    delete(id: number): Observable<EliminarPerfilResponseDTO> {
        return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
            map(response =>{ return response as EliminarPerfilResponseDTO }),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    actualizarEstado(id: number, request: ActualizarEstadoPerfilRequestDTO ): Observable<ActualizarEstadoPerfilResponseDTO> {
        return this.http.put<any>(`${this.baseUrl}/${id}/actualizar-estado`, request).pipe(
            map(response =>{ return response as ActualizarEstadoPerfilResponseDTO }),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    registrar(request: RegistrarPerfilRequestDTO): Observable<RegistrarPerfilRequestDTO> {
        return this.http.post<any>(`${this.baseUrl}`, request).pipe(
            map(response =>{ return response as RegistrarPerfilRequestDTO }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    editar(id: number, request: EditarPerfilRequestDTO): Observable<PerfilDTO> {
        return this.http.put<any>(`${this.baseUrl}/${id}`, request).pipe(
            map(response => ({ 
                ...response,
                fecha_creacion: new Date(response.fecha_creacion),
                fecha_edicion: response.fecha_edicion ? new Date(response.fecha_edicion) : null
            }) as PerfilDTO ),
            catchError((error: HttpErrorResponse) => {
            return throwError(() => error);
            })
        );
    }

    getAllToSelect(): Observable<PerfilListToSelectDTO[]>{
        return this.http.get<any>(`${this.baseUrl}/listar-para-select`).pipe(
            map((response: any) => (response as PerfilListToSelectDTO[])),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }
}