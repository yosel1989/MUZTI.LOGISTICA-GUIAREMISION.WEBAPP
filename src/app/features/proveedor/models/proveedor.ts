export interface ProveedorDto{
    id: number;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    ubigeo_id: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    email: string;
    pais: string;
    codigo_sunat: string | null;
    id_estado: number;
    estado: string;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    ld_estado: boolean;
    ld_update: boolean;
}


export interface RegistrarProveedorRequestDto{
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string;
  pais: string;
  codigo_sunat: string | null;
}

export interface EditarProveedorRequestDto{
  id: number,
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string;
  pais: string;
  codigo_sunat: string | null;
}

export interface RegistrarProveedorResponseDto {
  id: number;
  detalle: string;
}

export interface EditarProveedorResponseDto{
  id: number;
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    ubigeo_id: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    email: string;
    pais: string;
    codigo_sunat: string | null;
    id_estado: number;
    estado: string;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface EliminarProveedorResponseDto {
  id: number;
  eliminado: boolean;
  detalle: string;
}

export interface ActualizarEstadoProveedorRequestDto{
  id: number;
  id_estado: number;
  edited_employee_id: number;
  edited_employee_name: string;
}

export interface ActualizarEstadoProveedorResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  empleado_nombre_edicion: string;
  fecha_ultima_edicion: Date;
  detalle: string;
}

export interface ProveedorSugeridoDto{
  id: number;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  direccion: string;
  email: string;
  codigo_sunat: string | null;
}