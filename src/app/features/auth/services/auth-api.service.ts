import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthRequest, User } from './auth.interface';
import { Router } from '@angular/router';
import { finalize, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../core/services/storage.service';

/**
 * Servicio de autenticación: login, logout y renovación del token.
 *
 * Base: `{apiAuthUrl}`
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = environment.apiAuthUrl;

  constructor(private http: HttpClient, private storageService: StorageService, private router: Router) {}

  /**
   * Inicia sesión con las credenciales del usuario.
   *
   * `POST /login`
   *
   * @param request Usuario y contraseña.
   * @returns Datos del usuario autenticado, incluidos `token` y `refreshToken`.
   */
  login(request: AuthRequest) {
    return this.http.post<User>(`${this.baseUrl}/login`, request);
  }
  
  /**
   * Cierra la sesión en el servidor.
   *
   * Al terminar (con éxito o con error) borra la sesión local y redirige a `/login`.
   *
   * `POST /logout`
   *
   * @returns Respuesta del servidor como texto.
   */
  logout() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.storageService.getToken()}` });

    return this.http.post(`${this.baseUrl}/logout`, {}, { responseType: 'text', headers }).pipe(
      finalize(() => this.endSession())
    )
  }

  /**
   * Borra la sesión local (token, refresh token y usuario) y redirige a `/login`.
   *
   * No llama al servidor; se usa cuando la sesión ya no es válida.
   *
   * @param returnUrl Pantalla a la que volver después de iniciar sesión.
   */
  endSession(returnUrl?: string): void {
    this.storageService.removeToken();
    this.storageService.removeRefreshToken();
    this.storageService.removeUser();

    const hasReturnUrl = returnUrl && !returnUrl.startsWith('/login');
    this.router.navigate(['/login'], {
      queryParams: hasReturnUrl ? { returnUrl } : {}
    });
  }


  /**
   * Renueva el token de acceso usando el refresh token guardado.
   *
   * Guarda el nuevo token y refresh token. Si falla, solo propaga el error:
   * el interceptor decide si reintentar o cerrar la sesión.
   *
   * `POST /refreshToken`
   *
   * @returns El nuevo token de acceso.
   */
  refreshToken(): Observable<string> {

    return this.http.post<{refreshToken: string, token: string}>(`${this.baseUrl}/refreshToken`, {
      refreshToken: this.storageService.getRefreshToken() ?? ''
    }).pipe(
      map(response => {
        this.storageService.setToken(response.token);
        this.storageService.setRefreshToken(response.refreshToken);

        return response.token;
      })
    );
  }

}
