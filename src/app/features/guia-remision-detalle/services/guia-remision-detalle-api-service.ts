import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GuiaRemisionDetalleDto } from "@features/guia-remision/models/guia-remision.model";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class GuiaRemisionDetalleApiService {

    http = inject(HttpClient);

    baseUrl = '';

    constructor(){
        this.baseUrl = `${environment.apiUrl}/guia-remision-detalle` 
    }

    importData(file: File): Observable<GuiaRemisionDetalleDto[]>  {
        
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<GuiaRemisionDetalleDto[]>(`${this.baseUrl}/import-data`, formData, {
            headers: new HttpHeaders({
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            })
        } ).pipe(
            map(response =>{ return response }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }

}