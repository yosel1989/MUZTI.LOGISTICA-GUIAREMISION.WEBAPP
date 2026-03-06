import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { map, Observable } from "rxjs";
import { ProveedorDto, RegistrarProveedorRequestDto, RegistrarProveedorResponseDto } from "../models/proveedor";

@Injectable({
  providedIn: 'root'
})
export class ProveedorApiService {
  private baseUrl = `${environment.apiUrl}/Proveedor`;

  constructor(private http: HttpClient) {}

  obtenerTodo(): Observable<ProveedorDto[]> {
    return this.http.get<any>(`${this.baseUrl}/listar`).pipe(
      map(response =>{ return response as ProveedorDto[] })
    );
  }

  registrar(request: RegistrarProveedorRequestDto): Observable<RegistrarProveedorResponseDto> {
    return this.http.post<any>(`${this.baseUrl}`, request).pipe(
      map(response =>{ return response as RegistrarProveedorResponseDto })
    );
  }

}
