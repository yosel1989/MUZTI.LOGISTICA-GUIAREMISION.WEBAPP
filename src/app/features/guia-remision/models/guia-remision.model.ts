import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { ConductorDto } from "@features/conductor/models/conductor.model";
import { EmpresaDTO } from "@features/empresa/models/empresa.model";
import { EstablecimientoDTO } from "@features/establecimiento/models/establecimiento.model";
import { ProveedorDto } from "@features/proveedor/models/proveedor";
import { TransportistaDto } from "@features/transportista/models/transportista";
import { UnidadTransporteDto } from "@features/unidad-transporte/models/unidad-transporte.model";

// Guía de Remisión - Request Body
export interface GuiaRemisionRemitenteRequestDto {
  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  motivo_traslado_id: number;
  motivo_traslado: SunatMotivoTrasladoDto | undefined;
  fecha: string;
  hora: string;
  observacion: string | null;
  registro_mtc: string | null;

  doc_relacionado: GR_DocRelacionadoDto[] | null;
  
  remitente: EstablecimientoDTO;
  remitente_id: number;

  destinatario: EstablecimientoDTO;
  destinatario_id: number;

  proveedor: GR_ProveedorRequestDto | null;
  proveedor_id: number | null;

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
  id: number;
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
  fecha_entrega_transportista: string | null; 
  peso_bruto: string; 
  unidad_medida_id: number; 
  codigo_um: string; 

  indicador_traslado_vehiculo_categoria: boolean;
  traslado_vehiculo_categoria_placa_vehiculo: string | null;

  ruc_empresa_currier: string | null;
  razon_social_currier: string | null;
  registro_mtc_currier: string | null;

  transportista: TransportistaDto | null | undefined;
  transportista_id: number | null | undefined;

  indicador_registro_vehiculo_conductor: boolean;
  indicador_transbordo_programado: boolean;
  indicador_retorno_vehiculo_vacio: boolean;
  indicador_retorno_vehiculo_envases_vacios: boolean;

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
  unidad_medida_id: number;
  codigo_um: string;
  codigo_sunat: string | null;
  gtin: string | null;
  codigo_subnacional: string | null;
  bien_normalizado: boolean; 
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
  uuid: string;
  ruc: string;
  entidad_remitente: string;
  numero_documento_remitente: string;
  numero_guia: string;
  serie_correlativo: string;
  serie: string;
  numero: string;
  establecimiento_remitente: string;
  tipo_guia: 'REMITENTE' | 'TRANSPORTISTA';
  tipo_traslado: 'VENTA' | 'TRASLADO' | 'COMPRA';
  motivo_traslado_id: number;
  motivo_traslado: string;
  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  fecha_emision: Date;
  hora_emision: string;
  respuesta_ticket: string | null;
  entidad_destinatario: string;
  establecimiento_destinatario: string;
  numero_documento_destinatario: string;
  distrito_origen: string;
  distrito_destino: string;
  fecha_registro: Date;
  usuario_registro: string;
  usuario_registro_nombre: string;
  fecha_modifico: Date | null;
  usuario_modifico: string | null;
  usuario_modifico_nombre: string | null;
  estado: string | 'registrado' | 'editado' | 'rechazado' | 'aprobado' | 'enviado';
  id_estado: number;
  estado_sunat: string;
  id_estado_sunat: number;
  loading_update: boolean;
  area: string | null;
  area_id: string | null;
  acciones: string;
  observacion: string | null;

  empresa: EmpresaDTO;
  remitente: EstablecimientoDTO;
  destinatario: EstablecimientoDTO;
  datos_envio: GuiaRemisionDatosEnvioDto;
  proveedor: ProveedorDto | null;
  productos: GuiaRemisionDetalleDto[];
}



export interface GuiaRemisionDetalleDto{
  id: number;
  guia_remision_id: number;
  cantidad: number;
  unidad_medida_id: number;
  unidad_medida: string;
  codigo_um: string | null;
  descripcion_um: string;
  codigo: string | null;
  descripcion: string;
  codigo_sunat: string | null;
  gtin: string | null;
  codigo_subnacional: string | null;
  indicador_bien_normalizado: boolean;
}

export interface GuiaRemisionDatosEnvioDto{
  datos_envio_id: number;
  motivo_envio: string | 'PRIVADO' | 'PUBLICO';
  fecha_envio: string;
  peso_bruto: number;
  unidad_medida_id: number;
  unidad_medida: string;
  codigo_um: string;
  ruc_empresa_currier: string | null;
  razon_social_currier: string | null;
  registro_mtc_currier: string | null;

  indicador_registro_vehiculo_conductor: boolean;
  indicador_traslado_vehiculo_categoria: boolean;
  indicador_transbordo_programado: boolean;
  indicador_retorno_vehiculo_envases_vacios: boolean;
  indicador_retorno_vehiculo_vacio: boolean;
  indicador_traslado_total_dam: boolean;

  conductor: ConductorDto[];
  unidad_transporte: UnidadTransporteDto[];

  transportista_id: number | null;
  transportista: TransportistaDto | null;
}