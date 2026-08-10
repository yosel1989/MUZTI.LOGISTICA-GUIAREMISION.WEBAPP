import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
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
                'Accept': 'application/json'
            })
        }).pipe(
            map(response =>{ return response }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        )
    }


    downloadFormatExcelImport(): Observable<{ blob: Blob, filename: string }> {
        return this.http.get(`${this.baseUrl}/download-template-import`, {
            responseType: 'blob',
            observe: 'response'
        }).pipe(
            map( response => {
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'plantilla-importar-items.xlsx'; // valor por defecto

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?([^"]+)"?/);
                    if (match && match[1]) {
                    filename = match[1];
                    }
                }

                return { blob: response.body as Blob, filename };
            })
        );
    }



}