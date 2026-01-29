// Guía de Remisión - Request Body
export interface GuiaRemisionRequestDto {
  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  tipo_traslado: 'VENTA' | 'TRASLADO' | 'COMPRA';
  fecha: string;
  hora: string;
  observacion: string;
  tipo_doc_ref: 'FACTURA' | 'BOLETA' | 'NOTA DE CREDITO' | 'NOTA DE DEBITO';
  numero_doc_ref: string;
  ruc_doc_ref: string;
  empleado_id_creacion: number;
  empleado_nombre_creacion: string;

  remitente: GR_RemitenteRequestDto;
  destinatario: GR_DestinatarioRequestDto;
  proveedor?: GR_ProveedorRequestDto | null;
  datos_envio: GR_DatosEnvioRequestDto;

  ruc_empresa_currier?: string;
  razon_social_currier?: string;
  registro_mtc_currier?: string;

  conductor?: GR_ConductorRequestDto | null;
  unidad_transporte?: GR_UnidadTransporteRequestDto | null;

  origen: GR_OrigenRequestDto;
  destino: GR_DestinoRequestDto[];
  productos: GR_ProductoRequestDto[];
}

// --- Objetos anidados ---

export interface GR_RemitenteRequestDto {
  ruc: string;
  razon_social: string; 
  ubigeo_id: string; 
  direccion: string;
  email: string;
  pais: string;
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface GR_DestinatarioRequestDto {
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string; 
  razon_social: string; 
  ubigeo_id: string; 
  direccion: string;
  email: string; 
  pais: string; 
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface GR_ProveedorRequestDto {
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string; 
  razon_social: string; 
  ubigeo_id: string; 
  direccion: string; 
  email: string; 
  pais: string; 
  empleado_id_creacion: number | null;
  empleado_nombre_creacion: string | null;
}

export interface GR_DatosEnvioRequestDto {
  motivo_envio: string; 
  fecha_envio: string; 
  peso_bruto: string; 
  codigo_um: string; 
}

export interface GR_ConductorRequestDto {
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  nombre: string;
  licencia: string;
}

export interface GR_UnidadTransporteRequestDto {
  placa: string;
  marca?: string;
  modelo?: string;
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
