import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { GuiaRemisionIndicadorTrasladoToSelectDto } from './../models/guia-remision-indicador-traslado';

/**
 * Servicio para consumir los indicadores de traslado de la guía de remisión.
 *
 * Base: `{apiUrl}/guia-remision-indicadores-traslado`
 */
@Injectable({
    providedIn: 'root'
})

export class GuiaRemisionIndicadorTrasladoService {
    http = inject(HttpClient);
    urlBase = '';

    constructor(){
        this.urlBase = `${environment.apiUrl}/guia-remision-indicadores-traslado`
    }

    /**
     * Lista los indicadores de traslado para usarlos en un select.
     *
     * `GET /guia-remision-indicadores-traslado/to-select`
     *
     * @returns Lista de indicadores de traslado en formato para select.
     */
    getToSelect(): Observable<GuiaRemisionIndicadorTrasladoToSelectDto[]>{
        return this.http.get<GuiaRemisionIndicadorTrasladoToSelectDto[]>(`${this.urlBase}/to-select`)
    }
}