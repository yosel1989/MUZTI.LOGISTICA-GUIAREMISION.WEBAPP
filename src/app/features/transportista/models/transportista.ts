export interface TransportistaDto {
  id: number;
  tipo_documento: "DNI" | "CE" | "RUC" | "PASAPORTE";
  numero_documento: string;
  razon_social: string | null;
  ubigeo_id: string | null;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  direccion: string | null;
  pais: string | null;
  codigo_sunat: string | null;
  email_remite_transportista: string[] | null;
  fecha_creacion: Date;
  empleado_nombre_creacion: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string | null;
  estado: string | "ACTIVO" | "INACTIVO";
  id_estado: number;
  ldEstado: boolean;
  ldUpdate: boolean;
}


export interface RegistrarTransportistaRequestDto{
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string | null;
  pais: string;
  codigo_sunat: string | null;
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface RegistrarTransportistaResponseDto {
  id: number;
  detalle: string;
}


export interface EditarTransportistaRequestDto{
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string | null;
  pais: string;
  codigo_sunat: string | null;
  empleado_id_edicion: number | null;
  empleado_nombre_edicion: string | null;
}