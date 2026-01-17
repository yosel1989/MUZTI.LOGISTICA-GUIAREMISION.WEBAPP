import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthRedirectGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storageService.hasToken()) {
      // Si ya está logueado, redirige al panel admin
      this.router.navigate(['/admin']);
      return false;
    }
    // Si no está logueado, permite acceder a /auth
    return true;
  }
}
