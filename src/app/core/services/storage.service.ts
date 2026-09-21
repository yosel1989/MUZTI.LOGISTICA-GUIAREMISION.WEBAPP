import { Injectable } from '@angular/core';
import { User } from '../../features/auth/services/auth.interface';
import { Column } from 'app/shared/models/table';
import { TableState } from '@core/models/table';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = '_t';
  private readonly REFRESH_TOKEN_KEY = '_rt';
  private readonly USER_KEY = '_u';
  private readonly TABLE_KEY = '_tb';

 
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

  setTable(tables: TableState[]): void {
    this.storage.setItem(
      this.TABLE_KEY,
      JSON.stringify(tables)
    );
  }

  getTable(): TableState[] {
    const data = this.storage.getItem(this.TABLE_KEY);

    return data ? JSON.parse(data) : [];
  }

  loadTable(table: string, columns: Column[]): Column[] {

    const tableConfig = this.getTable();

    const tableExist = tableConfig.find(
      x => x.table === table
    );

    if (!tableExist) {

      tableConfig.push({
        table,
        cols: columns.map(column => ({
          field: column.field,
          visible: column.visible ?? true
        }))
      });

      this.setTable(tableConfig);

      return columns;
    }

    const visibleMap = new Map(
      tableExist.cols.map(col => [col.field, col.visible])
    );

    return columns.map(column => ({
      ...column,
      visible: visibleMap.get(column.field) ?? true
    }));
  }

}
