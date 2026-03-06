import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { GR_EnviarGuiaRemisionResponseDto, GuiaRemisionRemitenteRequestDto } from "app/features/guia-remision/models/guia-remision.model";

@Injectable({
  providedIn: 'root'
})
export class GuiaRemitenteApiService {
  private baseUrl = `${environment.apiUrl}/GuiaRemitente`;

  constructor(private http: HttpClient) {}

  saveRemisionRemitente(request: GuiaRemisionRemitenteRequestDto, ruc: string): Observable<GR_EnviarGuiaRemisionResponseDto> {
    return this.http.post<any>(`${this.baseUrl}/${ruc}`, request).pipe(
      map(response =>{ return response as GR_EnviarGuiaRemisionResponseDto })
    );
  }

}
