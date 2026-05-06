export interface PermisoDTO{
    id: number;
    nombre: string;
    descripcion: string;
    codigo: string;
    id_estado: number;
    perfiles: number[];
}

export interface PermisoAsignarPerfilesDTO{
    id: number;
    perfiles: number[];
}