import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GuiaRemisionDetalleDto } from "@features/guia-remision/models/guia-remision.model";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { getFilenameFromHeaders } from "@core/utils/download.util";

/**
 * Servicio para importar el detalle (ítems) de una guía de remisión desde Excel.
 *
 * Base: `{apiUrl}/guia-remision-detalle`
 */
@Injectable({
    providedIn: 'root'
})

export class GuiaRemisionDetalleApiService {

    http = inject(HttpClient);

    baseUrl = '';

    constructor(){
        this.baseUrl = `${environment.apiUrl}/guia-remision-detalle` 
    }

    /**
     * Sube un Excel con los ítems de la guía de remisión y devuelve los ítems leídos.
     *
     * `POST /guia-remision-detalle/import-data (multipart/form-data)`
     *
     * @param file Archivo Excel con los ítems.
     * @returns Lista de ítems importados.
     */
    importData(file: File): Observable<GuiaRemisionDetalleDto[]>  {
        
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<GuiaRemisionDetalleDto[]>(`${this.baseUrl}/import-data`, formData, {
            headers: new HttpHeaders({
                'Accept': 'application/json'
            })
        })
    }


    /**
     * Descarga la plantilla Excel para importar ítems.
     *
     * `GET /guia-remision-detalle/download-template-import`
     *
     * @returns La plantilla como `Blob` y el nombre de archivo (por defecto `plantilla-importar-items.xlsx`).
     */
    downloadFormatExcelImport(): Observable<{ blob: Blob, filename: string }> {
        return this.http.get(`${this.baseUrl}/download-template-import`, {
            responseType: 'blob',
            observe: 'response'
        }).pipe(
            map(response => ({
                blob: response.body as Blob,
                filename: getFilenameFromHeaders(response.headers, 'plantilla-importar-items.xlsx')
            }))
        );
    }



}