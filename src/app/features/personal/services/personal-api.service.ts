import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { PersonalDTO, PersonalSugeridoDTO } from "../models/personal.model";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root',
})

export class PersonalApiService {
    private baseUrl = environment.apiUrl + '/personal';
    constructor(private httpClient: HttpClient) { }

    getPersonalSugerido(text: string | null): Observable<PersonalSugeridoDTO[]>{
        const params = text ? new HttpParams().set('text', text) : new HttpParams();

        return this.httpClient.get<PersonalSugeridoDTO[]>(`${this.baseUrl}/listar-sugerida`, { params: params }).pipe(
            map(response => response as PersonalSugeridoDTO[]),
            catchError(error => {                
                return throwError(error);
            })
        );
    }

    getPersonalPorId(id: number): Observable<PersonalDTO>{

        return this.httpClient.get<PersonalDTO>(`${this.baseUrl}/${id}`).pipe(
            map(response => response as PersonalDTO),
            catchError(error => {                
                return throwError(error);
            })
        );
    }
}