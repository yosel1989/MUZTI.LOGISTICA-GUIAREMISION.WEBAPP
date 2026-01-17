import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service'; // Ajusta el path según tu estructura

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storageService.hasToken()) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
