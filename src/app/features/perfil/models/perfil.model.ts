export interface PerfilDTO{
    id: number;
    nombre: string;
    descripcion: string | null;
    codigo: number;
    id_estado: number;
    estado: string;
    usuario_registro: string;
    fecha_registro: Date;
    usuario_modifico: string | null;
    fecha_modifico: Date | null;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface PerfilListToModalDTO{
    id: number;
    descripcion: string;
    codigo_sunat: string;
}


export interface EliminarPerfilResponseDTO{
    detalle: string;
}

export interface ActualizarEstadoPerfilRequestDTO{
    id_estado: number;
    usuario_modifico: string;
}

export interface ActualizarEstadoPerfilResponseDTO{
    id: number;
    id_estado: number;
    estado: string;
    fecha_modifico: Date | null;
    usuario_modifico: string;
    detalle: string;
}


export interface RegistrarPerfilRequestDTO{
    nombre: string;
    descripcion: string | null;
    codigo: number;
}

export interface EditarPerfilRequestDTO{
    id: number;
    nombre: string;
    descripcion: string | null;
    codigo: number;
}
