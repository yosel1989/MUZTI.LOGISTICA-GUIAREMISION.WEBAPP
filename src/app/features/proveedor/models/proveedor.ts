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
    fecha_creacion: Date;
    empleado_nombre_creacion: string;
    fecha_ultima_edicion: Date | null;
    empleado_nombre_edicion: string;
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
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
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
  empleado_id_edicion: number | null;
  empleado_nombre_edicion: string | null;
}

export interface RegistrarProveedorResponseDto {
  id: number;
  detalle: string;
}

export interface EditarProveedorResponseDto{
  id: number;
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string;
  pais: string;
  codigo_sunat: string | null;
  empleado_id_edicion: number | null;
  empleado_nombre_edicion: string | null;
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
  detalle: string;
}