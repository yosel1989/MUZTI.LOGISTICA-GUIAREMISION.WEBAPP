export interface UnidadTransporteDto{
    id: number;
    descripcion: string;
    marca: string;
    modelo: string;
    placa: string;
    tarjeta: string;
    entidad_reguladora_vehicular_id: number | null;
    entidad_reguladora_vehicular: string | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;

    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;

    tipo: string | null;
    active: boolean;
    loading_active: boolean;
    loading_update: boolean;
    job_title: string;
}

export interface RegistrarUnidadTransporteRequestDto{
    descripcion: string | null;
    marca: string | null;
    modelo: string | null;
    placa: string;
    tarjeta: string | null;
    entidad_reguladora_vehicular_id: number | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;
    tipo: string;
}

export interface RegistrarUnidadTransporteResponseDto{
    id: number;
    detalle: string;
}

export interface EditarUnidadTransporteRequestDto{
    descripcion: string | null;
    marca: string | null;
    modelo: string | null;
    placa: string;
    tarjeta: string | null;
    entidad_reguladora_vehicular_id: number | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;
    tipo: string | 'interno' | 'externo';
}

export interface EditarUnidadTransporteResponseDto{
    id: number;
    descripcion: string;
    marca: string;
    modelo: string;
    placa: string;
    tarjeta: string;
    entidad_reguladora_vehicular_id: number | null;
    entidad_reguladora_vehicular: string | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;

    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;

    tipo: string | null;
    active: boolean;
    loading_active: boolean;
    loading_update: boolean;
}

export interface EliminarUnidadTransporteResponseDto{
    id: number;
    eliminado: boolean;
    detalle: string;
}

export interface ActualizarEstadoUnidadTransporteRequestDto{
  id: number;
  id_estado: number;
}

export interface UnidadTransporteSugeridoDto{
    id: number;
    descripcion: string | null;
    marca: string | null;
    modelo: string | null;
    placa: string;
    tarjeta: string | null;
    tipo: string | null;
}