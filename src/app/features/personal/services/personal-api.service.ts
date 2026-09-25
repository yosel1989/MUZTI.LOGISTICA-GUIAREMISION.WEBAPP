import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { PersonalDTO, PersonalSugeridoDTO } from "../models/personal.model";
import { Observable } from "rxjs";

/**
 * Servicio para consumir los endpoints de personal.
 *
 * Base: `{apiUrl}/personal`
 */
@Injectable({
    providedIn: 'root',
})

export class PersonalApiService {
    private baseUrl = environment.apiUrl + '/personal';
    constructor(private httpClient: HttpClient) { }

    /**
     * Busca personal sugerido (autocompletado).
     *
     * `GET /personal/listar-sugerida?text=`
     *
     * @param text Texto a buscar; si es `null` se envía sin filtro.
     * @returns Lista de personal que coincide con la búsqueda.
     */
    getPersonalSugerido(text: string | null): Observable<PersonalSugeridoDTO[]>{
        const params = text ? new HttpParams().set('text', text) : new HttpParams();

        return this.httpClient.get<PersonalSugeridoDTO[]>(`${this.baseUrl}/listar-sugerida`, { params: params });
    }

    /**
     * Obtiene un personal por su id.
     *
     * `GET /personal/{id}`
     *
     * @param id Id del personal.
     * @returns Datos del personal.
     */
    getPersonalPorId(id: number): Observable<PersonalDTO>{

        return this.httpClient.get<PersonalDTO>(`${this.baseUrl}/${id}`);
    }
}