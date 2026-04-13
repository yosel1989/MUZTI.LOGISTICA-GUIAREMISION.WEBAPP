import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { GR_EmitirGuiaRemisionResponseDto, GR_EnviarGuiaRemisionResponseDto, GuiaRemisionRemitenteRequestDto } from "app/features/guia-remision/models/guia-remision.model";

@Injectable({
  providedIn: 'root'
})
export class GuiaRemitenteApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemision`;

  constructor(private http: HttpClient) {}

  saveRemisionRemitente(request: GuiaRemisionRemitenteRequestDto, ruc: string): Observable<GR_EnviarGuiaRemisionResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/registrar-remitente/${ruc}`, request).pipe(
      map(response =>{ return response as GR_EnviarGuiaRemisionResponseDto }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }


  emitirGuiaRemision(guiaId: number, ruc: string): Observable<GR_EmitirGuiaRemisionResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/${ruc}/enviar/${guiaId}`,{}).pipe(
      map(response =>{ return response as GR_EmitirGuiaRemisionResponseDto }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

}
