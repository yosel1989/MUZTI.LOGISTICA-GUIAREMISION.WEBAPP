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
    codigoSunat: string | null;
    fechaCreacion: Date;
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

export interface RegistrarProveedorResponseDto {
  id: number;
  detalle: string;
}
