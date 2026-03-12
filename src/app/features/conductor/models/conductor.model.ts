export interface ConductorDto{
    id: number;
    tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    codigo_sunat: string | null;
    fecha_creacion: Date;
    empleado_nombre_creacion: string;
    fecha_ultima_edicion: Date | null;
    empleado_nombre_edicion: string | null;
    estado: string;
    id_estado: number;
}

export interface ConductorByNumeroDocumento{
    id: number;
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    fechaCreacion: Date;
}

export interface RegistrarConductorRequestDto{
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string | null;
  licencia: string;
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface RegistrarConductorResponseDto {
  id: number;
  detalle: string;
}


export interface EditarConductorRequestDto{
  id: number,
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  licencia: string | null;
  empleado_id_edicion: number | null;
  empleado_nombre_edicion: string | null;
}

export interface EditarConductorResponseDto{
  id: number;
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  licencia: string;
  empleado_id_edicion: number | null;
  empleado_nombre_edicion: string | null;
}

export interface EliminarConductorResponseDto{
  id: number;
  eliminado: boolean;
  detalle: string;
}

export interface ActualizarEstadoConductorRequestDto{
  id_estado: number;
  edited_employee_id: number;
  edited_employee_name: string;
}


export interface ActualizarEstadoConductorResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string;
  detalle: string;
}
