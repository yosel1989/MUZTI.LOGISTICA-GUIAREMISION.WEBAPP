import { SunatMotivoTrasladoDto } from "@features/catalogo/models/sunat-catalogo.model";
import { ConductorDto } from "@features/conductor/models/conductor.model";
import { EntityBranchSerieDto } from "@features/entity-branch-serie/models/entity-branch-serie";
import { EntityBranchDto } from "@features/entity-branch/models/entity-branch";
import { EntityBySerieAssigned_EntityBranchSerieDto, EntityBySerieAssigned_EntityDto, EntityDto } from "@features/entity/models/entity";
import { GuiaRemisionTransportUnitCreateDto } from "@features/guia-remision-unidad-transporte/models/guia-remision-unidad-transporte";
import { GuiaRemisionEstadoDTO } from './../../guia-remision-estado/models/guia-remision-estado.model';
import { AreaDto } from "@features/area/models/area";



/**
 * Representa los datos de una guía de remisión.
 */
export interface DespatchAdviceDto {
  /** Identificador númerico */
  id: number;

  /** Identificador UUIDv4 */
  uuid: string;

  /** Número de guía concatenado {serie}-{numero} */
  serie_number: string;

  /** Serie de la guía creada */
  serie: string;

  /** Número autoasignado a la guía creada */
  number: string;

  /** Número de documento de la entidad emisora, RUC */
  ruc: string;

  /** Identificador de la entidad emisora */
  entity_id: number;

  /** Entidad emisora */
  entity: EntityDto;

  /** Identificador de la serie del establecimiento al que pertenece la guía */
  entity_branch_serie_id: number;

  /** Serie del establecimiento al que pertenece la guía */
  entity_branch_serie: EntityBranchDto;

  /** Tipo de Guía de Remisión */
  type: 'REMITENTE' | 'TRANSPORTISTA';

  /** Identificador del Motivo de traslado */
  reason_for_transfer_id: number;

  /** Motivo de traslado */
  reason_for_transfer: SunatMotivoTrasladoDto;

  /** Tipo de transporte */
  trasnport_type: 'PUBLICO' | 'PRIVADO';

  /** Fecha de emisión */
  issue_date: Date;

  /** Hora de emisión */
  issue_hour: string;

  /** Respuesta del ticket, solo para EFACT al emitir */
  respuesta_ticket: string | null;

  /** Identificacor de entidad destinataria o cliente  */
  entity_receiver_id: string;

  /** Entidad destinataria o cliente */
  entity_receiver: EntityDto;

  /** Identificacor de entidad transportista  */
  entity_carrier_id: string | null;

  /** Entidad transportista */
  entity_carrier: EntityDto | null;

  /** Identificacor de entidad proveedora  */
  entity_provider_id: string | null;

  /** Entidad proveedora */
  entity_provider: EntityDto | null;

  /** Identificador del establecimiento de salida o punto de partida */
  entity_branch_sender_id: number;

  /** Establecimiento de salida o punto de partida */
  entity_branch_sender: EntityBranchDto;

  /** Identificador del establecimiento de llegada o punto de destino */
  entity_branch_receiver_id: number;

  /** Establecimiento de llegada o punto de destino */
  entity_branch_receiver: EntityBranchDto;

  /** Identificacor del área al que pertenece la guía  */
  area_id: number;

  /** Área al que pertenece la guía */
  area: AreaDto | null;

  /** Fecha creación de la guía */
  created_at: Date;

  /** Usuario que creo la guía */
  created_at_user: string;

  /** Nombre del empleado que creo la guía */
  created_at_user_name: string;

  /** Identificador del empleado que creo la guía */
  created_at_employee_id: string;

  /** Fecha de actualización de la guía */
  updated_at: Date | null;

  /** Usuario que actualizó la guía */
  updated_at_user: string | null;

  /** Nombre del empleado que actualizó la guía */
  updated_at_user_name: string | null;

  /** Nombre del empleado que actualizó la guía */
  updated_at_employee_id: string | null;

  /** Identificador del estado interno de la guía */
  status_id: number;

  /** Estado interno de la guía */
  status: GuiaRemisionEstadoDTO;

  /** Identificador del estado relacionado a SUNAT */
  status_sunat_id: number;

  /** Estado relacionado a Sunat */
  status_sunat: 'PENDIENTE' | 'ENVIADO' | 'ERROR';

  /** Observaciones */
  notes: string | null;

  /** Conductores */
  drivers: ConductorDto[];

  /** Vehiculos */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transport_units: any[]

}





// Guía de Remisión - Request Body
export interface GuiaRemisionRemitenteRequestDto {

  /** Entidad emisora */
  entity_id: number;
  entity: EntityDto | EntityBySerieAssigned_EntityDto;
  
  /** Serie con el cual se emitió */
  entity_branch_serie_id: number;
  entity_branch_serie: EntityBranchSerieDto | EntityBySerieAssigned_EntityBranchSerieDto;

  /** Motivo de traslado según SUNAT */
  reason_for_transfer_id: number;
  reason_for_transfer: SunatMotivoTrasladoDto | undefined;

  /** Tipo de transporte */
  transport_type: 'PUBLICO' | 'PRIVADO';

  /** Fecha de emisión */
  issue_date: string;

  /** Hora de emisión */
  issue_hour: string;

  /** Entidad cliente o destinatario */
  entity_receiver_id: number;
  entity_receiver: EntityDto;

  /** Establecimiento de origen */
  entity_branch_sender_id: number;
  entity_branch_sender: EntityBranchDto;

  /** Establecimiento destino*/
  entity_branch_receiver_id: number;
  entity_branch_receiver: EntityBranchDto;

  /** Datos del traslado */
  shipment_details: GR_DatosTrasladoRequestDto;

  /** Entidad proveedor */
  entity_provider_id: number | null;
  entity_provider: EntityDto | null;

  /** Entidad transportista (courier)*/
  entity_carrier_id: number | null;
  entity_carrier: EntityDto | null;

  /** Unidades de transporte */
  transport_units: GuiaRemisionTransportUnitCreateDto[] | null;

  /** Conductores */
  drivers: ConductorDto[] | null;

  /** Observacion */
  notes: string | null;

  /** Documentos relacionados */
  doc_relacionado: GR_DocRelacionadoDto[] | null;

  /** Productos o materiales a trasladar */
  products: GR_ProductRequestDto[];
}

// --- Objetos anidados ---


export interface GR_DocRelacionadoDto{
  tipo_doc_ref_id: number;
  ruc_doc_ref: string;
  numero_doc_ref: string;
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

export interface GR_DatosTrasladoRequestDto {

  /** Fecha inicio de traslado */
  shipment_start_date: string | null;
  /** Fecha entrega al transportista */
  delivery_date: string | null;
  /** Peso bruto total */
  total_gross_weight: number;
  /** Unidad de medida */
  unit_of_measure_id: number;
  unit_of_measure_code_sunat: string;
  /** Número de bultos */
  package_count: number;
  /** Número de contenedor */
  container_number: string;
  /** Número de precinto */
  seal_number: string;
  /** Indicador traslado */
  shipment_indicator_id: number;

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

export interface GR_ProductRequestDto {
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
  /** Feha de inicio de traslado */
  shipment_start_date: Date | null;

  /** Fecha de entrega al transportista */
  delivery_date: Date | null;

  /** Peso bruto total */
  total_gross_weight: number;

  /** Id Unidad de medida */
  unit_of_measure_id: number;

  /** Número de bultos */
  package_count: number;

  /** Número de contenedor */
  container_number: string | null;

  /** Número de precinto */
  seal_number: string | null;

  /** Id Indicador de envio SUNAT */
  shipment_indicator_id: number;
}

export interface GuiaRemisionDocumentoRelacionadoDto{
  doc_relacionado_id: number;
  tipo_doc_ref_id: number;
  tipo_doc_ref: string;
  tipo_doc_ref_codigo: string;
  numero_doc_ref: string;
  ruc_doc_ref: string;
}

