import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { catchError, map, Observable, throwError } from "rxjs";
import { EntityRoleDto, EntityRolesSyncDto, EntityRolesToSelectDto } from "../models/entity-role";

@Injectable({
    providedIn: 'root'
})

export class EntityRoleApiService {

    private http = inject(HttpClient);
    private baseUrl = '';

    constructor() {
        this.baseUrl = `${environment.apiUrl}/entity-roles`;
    }

    putRolesSync(request: EntityRolesSyncDto): Observable<boolean>{
        return this.http.put<boolean>(`${this.baseUrl}/sync-to-entity/${request.id}`, request).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getRolesByEntity(entityId: number): Observable<EntityRoleDto[]>{
        return this.http.get<EntityRoleDto[]>(`${this.baseUrl}/list-by-entity/${entityId}`).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

    getRolesToSelect(): Observable<EntityRolesToSelectDto[]>{
        return this.http.get<EntityRolesToSelectDto[]>(`${this.baseUrl}/to-select`).pipe(
            map((res) => res),
            catchError((e: HttpErrorResponse) => {
                return throwError(() => e);
            })
        )
    }

}