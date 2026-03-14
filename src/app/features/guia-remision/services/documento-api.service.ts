import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class DocumentoApiService {
  private baseUrl = `${environment.apiUrl}/Documento`;

  constructor(private http: HttpClient) {}

  obtenerPdfByTicket(ticket: string): Observable<{ blob: Blob; filename?: string }> {
    return this.http.get(`${this.baseUrl}/pdftk/${ticket}`, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(res => {

        const contentDisposition = res.headers.get('content-disposition');
        let filename: string | undefined;

        if (contentDisposition) {
          const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/);
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].trim());
          }
        }

        return {
          blob: res.body as Blob,
          filename
        };
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

}
