import { Injectable } from '@angular/core';
import { User } from '../../features/auth/services/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = '_t';
  private readonly REFRESH_TOKEN_KEY = '_rt';
  private readonly USER_KEY = '_u';

 
  private storage: Storage = localStorage;

  setToken(token: string): void {
    this.storage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.storage.getItem(this.TOKEN_KEY);
  }

  setRefreshToken(refresh_token: string): void {
    this.storage.setItem(this.REFRESH_TOKEN_KEY, refresh_token);
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setUser(token: string): void {
    this.storage.setItem(this.USER_KEY, token);
  }

  getUser(): User | null {
    return this.storage.getItem(this.USER_KEY) ? JSON.parse(this.storage.getItem(this.USER_KEY)!) : null;
  }

  removeToken(): void {
    this.storage.removeItem(this.TOKEN_KEY);
  }

  removeRefreshToken(): void {
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  removeUser(): void {
    this.storage.removeItem(this.USER_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  useSessionStorage(): void {
    this.storage = sessionStorage;
  }

  useLocalStorage(): void {
    this.storage = localStorage;
  }
}
