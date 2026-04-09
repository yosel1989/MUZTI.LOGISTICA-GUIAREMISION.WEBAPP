export interface DestinatarioBusqueda {
  id: number;
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  razon_social: string;
  codigo_sunat: string | null;
}

export interface DestinatarioSugeridoDto{
  id: number;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  codigo_sunat: string;
}


export interface DestinatarioDto {
  id: number;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  pais: string;
  codigo_sunat: string | null;
  fecha_creacion: Date;
  empleado_nombre_creacion: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string | null;
  email_destinatario: string[];
  estado: string;
  id_estado: number;
}