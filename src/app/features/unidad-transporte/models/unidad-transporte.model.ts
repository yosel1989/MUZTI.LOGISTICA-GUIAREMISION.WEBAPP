export interface UnidadTransporteDto{
    id: number;
    descripcion: string;
    marca: string;
    modelo: string;
    placa: string;
    tarjeta: string;
    cod_emisor_vehicular: string | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    tipo: string | null;
    estado: string;
    id_estado: number;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface RegistrarUnidadTransporteRequestDto{
    descripcion: string | null;
    marca: string | null;
    modelo: string | null;
    placa: string;
    tarjeta: string | null;
    cod_emisor_vehicular: string | null;
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
    cod_emisor_vehicular: string | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;
}

export interface EditarUnidadTransporteResponseDto{
    id: number;
    descripcion: string;
    marca: string;
    modelo: string;
    placa: string;
    tarjeta: string;
    cod_emisor_vehicular: string | null;
    emisor_vehicular: string | null;
    nro_autorizacion: string | null;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    tipo: string | null;
    estado: string;
    id_estado: number;
    ld_estado: boolean;
    ld_update: boolean;
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