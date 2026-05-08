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
  registro_mtc: string | null;
  email_contacto: string | null;
}


export interface RegistrarTransportistaRequestDto{
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email_contacto: string | null;
  pais: string;
  codigo_sunat: string | null;
  registro_mtc: string | null;
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
  pais: string;
  codigo_sunat: string | null;
  registro_mtc: string | null;
  email_contacto: string | null;
}