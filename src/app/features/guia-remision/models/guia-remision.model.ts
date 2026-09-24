import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { ConductorDto } from "@features/conductor/models/conductor.model";
import { EmpresaDTO } from "@features/empresa/models/empresa.model";
import { EntityBranchSerieDto } from "@features/entity-branch-serie/models/entity-branch-serie";
import { EntityBranchDto } from "@features/entity-branch/models/entity-branch";
import { EntityBySerieAssigned_EntityBranchDto, EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { GuiaRemisionTransportUnitCreateDto } from "@features/guia-remision-unidad-transporte/models/guia-remision-unidad-transporte";
import { ProveedorDto } from "@features/proveedor/models/proveedor";
import { TransportistaDto } from "@features/transportista/models/transportista";
import { UnidadTransporteDto } from "@features/unidad-transporte/models/unidad-transporte.model";

// Guía de Remisión - Request Body
export interface GuiaRemisionRemitenteRequestDto {
  entity_id: number;
  entity: EntityDto | EntityBySerieAssigned_EntityDto;

  entity_branch_id: number;
  entity_branch: EntityBranchDto;

  entity_branch_serie_id: number;
  entity_branch_serie: EntityBranchSerieDto;


  tipo_transporte: 'PUBLICO' | 'PRIVADO';
  motivo_traslado_id: number;
  motivo_traslado: SunatMotivoTrasladoDto | undefined;
  fecha: string;
  hora: string;
  observacion: string | null;
  registro_mtc: string | null;

  doc_relacionado: GR_DocRelacionadoDto[] | null;
  
  remitente: EntityBranchDto | EntityBySerieAssigned_EntityBranchDto;
  remitente_id: number;

  destinatario: EntityBranchDto;
  destinatario_id: number;

  proveedor: GR_ProveedorRequestDto | null;
  proveedor_id: number | null;

  entity_carrier_id: number | null;
  entity_carrier: EntityDto | null;
  transport_units: GuiaRemisionTransportUnitCreateDto[] | null;
  
  datos_envio: GR_DatosEnvioRequestDto;

  origen: GR_OrigenRequestDto;

  destino: GR_DestinoRequestDto[];

  productos: GR_ProductoRequestDto[];
}

// --- Objetos anidados ---


export interface GR_DocRelacionadoDto{
  tipo_doc_ref_id: number;
  tipo_doc_ref_codigo: string;
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

  indicador_registro_vehiculo_conductor: boolean;
  indicador_transbordo_programado: boolean;
  indicador_retorno_vehiculo_vacio: boolean;
  indicador_retorno_vehiculo_envases_vacios: boolean;

  conductor: number[] | null;
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
}

export interface GR_DestinoRequestDto {
  ubigeo_id: string; 
  direccion: string;
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
  entity_id: number;
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
  created_at: Date;
  created_at_user: string;
  created_at_user_name: string;
  updated_at: Date | null;
  updated_at_user: string | null;
  updated_at_user_name: string | null;
  estado: string;
  estado_color: string | null;
  id_estado: number;
  estado_sunat: string;
  id_estado_sunat: number;
  loading_update: boolean;
  area: string | null;
  area_id: string | null;
  acciones: string;
  observacion: string | null;

  empresa: EmpresaDTO;
  remitente: EntityBranchDto;
  destinatario: EntityBranchDto;
  datos_envio: GuiaRemisionDatosEnvioDto;
  proveedor: ProveedorDto | null;
  productos: GuiaRemisionDetalleDto[];
  doc_relacionado: GuiaRemisionDocumentoRelacionadoDto[];
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
  categoria_bien_normalizado_id: number | null;
  indicador_bien_normalizado: boolean;
}

export interface GuiaRemisionDatosEnvioDto{
  datos_envio_id: number;
  motivo_envio: string | 'PRIVADO' | 'PUBLICO';
  fecha_envio: string | null;
  fecha_entrega_transportista: string | null;
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

export interface GuiaRemisionDocumentoRelacionadoDto{
  doc_relacionado_id: number;
  tipo_doc_ref_id: number;
  tipo_doc_ref: string;
  tipo_doc_ref_codigo: string;
  numero_doc_ref: string;
  ruc_doc_ref: string;
}

