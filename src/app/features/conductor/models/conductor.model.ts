export interface ConductorDto{
    id: number;
    tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    codigo_sunat: string | null;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    estado: string;
    tipo: string | 'interno' | 'externo';
    id_estado: number;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface ConductorByNumeroDocumento{
    id: number;
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    fecha_registro: Date;
}

export interface RegistrarConductorRequestDto{
  tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string | null;
  licencia: string;
  tipo: string | 'interno' | 'externo';
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
  tipo: string | 'interno' | 'externo';
}

export interface EditarConductorResponseDto{
    id: number;
    tipo_documento: 'DNI' | 'CE' | 'PASAPORTE';
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    codigo_sunat: string | null;
    fecha_registro: Date;
    usuario_registro: string;
    usuario_registro_nombre: string;
    fecha_modifico: Date | null;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    estado: string;
    id_estado: number;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface EliminarConductorResponseDto{
  id: number;
  eliminado: boolean;
  detalle: string;
}

export interface ActualizarEstadoConductorRequestDto{
  id_estado: number;
}

export interface ActualizarEstadoConductorResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  fecha_modifico: Date | null;
  usuario_modifico: string;
  usuario_modifico_nombre: string;
  detalle: string;
}

export interface ConductorSugeridoDto{
  id: number;
  tipo_documento: string | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string | null;
  licencia: string,
  tipo: string | 'INTERNO' | 'EXTERNO';
}
