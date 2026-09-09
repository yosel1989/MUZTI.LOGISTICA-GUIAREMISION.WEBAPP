export interface EstablecimientoListToModalDTO{
    id: number;
    descripcion: string;
    area: string | null;
    codigo_sunat: string;
    entity_id: number;
    entity_document_number: string;
    entity_name: string;
}

export interface EntityBranchDto{
    id: number;
    entity_id: number;
    entity_document_number: string;
    entity_name: string;
    description: string;
    area: string | null;
    ubigeo_id: string;
    departamento: string;
    provincia: string;
    distrito: string;
    address: string;
    pais: string;
    email: string | null;
    serie: string;
    code_sunat: string;
    fecha_registro: Date;
    fecha_modifico: Date | null;
    usuario_registro: string;
    usuario_registro_nombre: string;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
    active: boolean;
    tipo: string;
    razon_social: string;
    is_main: boolean;
    ld_estado: boolean;
    ld_update: boolean;
}

export type EntityBranchCreateDto = Pick<
    EntityBranchDto, 
    'entity_id' | 
    'description' | 
    'ubigeo_id' | 
    'address' 
>;

export interface EliminarEstablecimientoResponseDTO{
    detalle: string;
}

export interface ActualizarEstadoEstablecimientoRequestDTO{
    id_estado: number;
}


export interface RegistrarEstablecimientoRequestDTO{
    entity_id: number;
    description: string;
    area: string | null;
    ubigeo_id: string;
    address: string;
    email: string | null;
    pais: string;
    serie: string | null;
    code_sunat: string | null;
    tipo: string;
    is_main: boolean;
}

export interface EditarEstablecimientoRequestDTO{
    id: number;
    entity_id: number;
    descripcion: string;
    area: string | null;
    ubigeo_id: string;
    direccion: string;
    email: string | null;
    pais: string;
    serie: string | null;
    codigo_sunat: string | null;
    tipo: string;
}

export interface EstablecimientoRemitenteGuiaDTO{
    id: number;              
    entity_id: number;
    entity_document_number: string;
    entity_name: string;                      
    descripcion: string;               
    area: string | null;               
    ubigeo_id: string;                 
    departamento: string;              
    provincia: string;                 
    distrito: string;                  
    direccion: string;                 
    email: string | null;                     
    pais: string;                      
    serie: string | null;              
    nueva_serie: string | null;        
    nuevo_correlativo: number | null;  
    nuevo_numero_guia: string | null;           
} 


export interface EstablecimientoListToSelectDTO{
    id: number;
    descripcion: string;
    area: string | null;
}