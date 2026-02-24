import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthRequest, User } from './auth.interface';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = environment.apiAuthUrl;

  constructor(private http: HttpClient, private storageService: StorageService, private router: Router) {}

  login(request: AuthRequest) {
    return this.http.post<User>(`${this.baseUrl}/login`, request);
  }
  
  logout() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.storageService.getToken()}` });

    return this.http.post(`${this.baseUrl}/logout`, {}, { responseType: 'text', headers }).pipe(
      finalize(() => {
        this.storageService.removeToken();
        this.storageService.removeRefreshToken();
        this.router.navigate(['/login']);
      })
    )
  }


  refreshToken(): Observable<string> {

    return this.http.post<{refreshToken: string, token: string}>(`${this.baseUrl}/refreshToken`, {
      refreshToken: this.storageService.getRefreshToken() ?? ''
    }).pipe(
      map(response => {
        this.storageService.setToken(response.token);
        this.storageService.setRefreshToken(response.refreshToken);

        return response.token;
      }),
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          return this.logout().pipe(
            catchError((error: HttpErrorResponse) => {
              return throwError(() => error);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

}
