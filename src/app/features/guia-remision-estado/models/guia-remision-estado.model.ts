export interface GuiaRemisionEstadoDTO{
    id: number;
    nombre: string;
}

export interface GuiaRemisionEstadoWithPermisosDTO{
    id: number;
    nombre: string;
    descripcion: string;
    permisos: number[];
}

export interface EstadoAsignarPermisosDTO{
    id: number;
    permisos: number[];
}