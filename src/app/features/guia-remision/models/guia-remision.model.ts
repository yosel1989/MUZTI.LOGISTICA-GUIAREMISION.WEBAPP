// Guía de Remisión - Request Body
export interface GuiaRemisionRemitenteRequestDto {
  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  tipo_traslado: 'VENTA' | 'TRASLADO' | 'COMPRA';
  fecha: string;
  hora: string;
  observacion: string | null;
  area: string | null;
  registro_mtc: string | null;
  empleado_id_creacion: number;
  empleado_nombre_creacion: string;

  doc_relacionado: GR_DocRelacionadoDto[] | null;
  
  remitente: GR_RemitenteRequestDto;

  destinatario: GR_DestinatarioRequestDto;

  proveedor: GR_ProveedorRequestDto | null;

  datos_envio: GR_DatosEnvioRequestDto;

  origen: GR_OrigenRequestDto;

  destino: GR_DestinoRequestDto[];

  productos: GR_ProductoRequestDto[];
}

// --- Objetos anidados ---


export interface GR_DocRelacionadoDto{
  tipo_doc_ref: 'FACTURA' | 'BOLETA' | 'NOTA DE CREDITO' | 'NOTA DE DEBITO';
  numero_doc_ref: string;
  ruc_doc_ref: string;
}

export interface GR_RemitenteRequestDto {
  remitente_id: number;
  numero_documento: string;
  descripcion: string;
  nombre_empresa: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  serie_numero: string;
}

export interface GR_DestinatarioRequestDto {
  destinatario_id: number;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  direccion: string;
  email_destinatario: string[] | null; 
}

export interface GR_ProveedorRequestDto {
  proveedor_id: number;
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  ubigeo_id: string;
  direccion: string;
  email: string;
}

export interface GR_DatosEnvioRequestDto {
  motivo_envio: string; 
  fecha_envio: string | null; 
  peso_bruto: string; 
  codigo_um: string; 
  ruc_empresa_currier: string | null;
  razon_social_currier: string | null;
  registro_mtc_currier: string | null;

  indicador_vehiculo_conductor: boolean;

  conductor: number[] | null;
  transporte: number[] | null;
}

export interface GR_ConductorRequestDto {
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  licencia: string;
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface GR_UnidadTransporteRequestDto {
  descripcion: string | null;
  marca: string | null;
  modelo: string | null;
  placa: string;
  numero_registro_mtc: string | null;
  tarejta: string | null;
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface GR_OrigenRequestDto {
  ubigeo_id: string; 
  direccion: string; 
  pais: string; 
}

export interface GR_DestinoRequestDto {
  ubigeo_id: string; 
  direccion: string; 
  pais: string; 
}

export interface GR_ProductoRequestDto {
  codigo: string; 
  descripcion: string; 
  cantidad: string; 
  codigo_um: string; 
}

export interface GR_EnviarGuiaRemisionResponseDto {
  id: number;
  tipo_guia: string;
  numero_guia: string;
}

export interface GR_EmitirGuiaRemisionResponseDto {
  success: boolean;
  respuesta_facturador: {
    codigo: string;
    descripcion: string;
  }
}

export interface GuiaRemisionDto {
  id: number;
  empresa: string;
  ruc: string; 
  razon_remitente: string;
  tipo_guia: 'REMITENTE' | 'TRANSPORTISTA';
  numero_guia: string;
  tipo_traslado: 'VENTA' | 'TRASLADO' | 'COMPRA';
  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  fecha_emision: Date;
  hora_emision: string; 
  respuesta_ticket: string | null;
  razon_destinatario: string;
  nro_documento_destinatario: string;
  distrito_origen: string;
  distrito_destino: string;
  fecha_creacion: Date;
  empleado_nombre_creacion: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string | null;
  estado: string;
  id_estado: number;
  loading_update: boolean;
}
