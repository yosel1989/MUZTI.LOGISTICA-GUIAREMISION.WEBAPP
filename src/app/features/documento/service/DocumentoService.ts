import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private baseAdminUrl = `${environment.apiUrl}/Documento`;

  constructor(private http: HttpClient) {}


 obtenerPdfByTicketEfact(ticket: string): Observable<{ blob: Blob, filename: string }> {
    return this.http.get(`${this.baseAdminUrl}/pdftk/${ticket}`, {
        responseType: 'blob',
        observe: 'response'
    }).pipe(
        map(resp => {
        const contentDisposition = resp.headers.get('content-disposition');
        let filename = 'archivo.pdf';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;\r\n"]+)/i);
            if (match && match[1]) {
            filename = decodeURIComponent(match[1]);
            }
        }
        return { blob: resp.body as Blob, filename };
        })
    );
 }

}
