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
    fecha_creacion: Date;
    empleado_nombre_creacion: string;
    fecha_ultima_edicion: Date | null;
    empleado_nombre_edicion: string | null;
    tipo: string | null;
    estado: string;
    id_estado: number;
    ldStatus: boolean;
    ldUpdate: boolean;
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
    empleado_id_creacion: number;
    empleado_nombre_creacion: string;
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
    empleado_id_edicion: number;
    empleado_nombre_edicion: string;
}

export interface EditarUnidadTransporteResponseDto{
    id: number;
    descripcion: string;
    marca: string;
    modelo: string;
    placa: string;
    tarjeta: string;
    numero_registro_mtc: string | null;
    fecha_creacion: Date;
    empleado_nombre_creacion: string;
    fecha_ultima_edicion: Date | null;
    empleado_nombre_edicion: string | null;
    estado: string;
    id_estado: number;
}

export interface EliminarUnidadTransporteResponseDto{
    id: number;
    eliminado: boolean;
    detalle: string;
}

export interface ActualizarEstadoUnidadTransporteRequestDto{
  id: number;
  id_estado: number;
  edited_employee_id: number;
  edited_employee_name: string;
}

export interface ActualizarEstadoUnidadTransporteResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  empleado_nombre_edicion: string;
  fecha_ultima_edicion: Date | null;
  detalle: string;
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