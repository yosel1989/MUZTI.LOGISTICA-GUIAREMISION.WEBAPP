export interface EntityBranchListToModalDTO{
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
    entity_department: string;
    entity_province: string;
    entity_district: string;
    entity_address: string;
    entity_country: string;
    description: string;
    area: string | null;
    ubigeo_id: string;
    department: string;
    province: string;
    district: string;
    address: string;
    email: string | null;
    serie: string;
    code_sunat: string;
    created_at: Date;
    updated_at: Date | null;
    created_at_user: string;
    created_at_user_name: string;
    updated_at_user: string | null;
    updated_at_user_name: string | null;
    active: boolean;
    type: string;
    is_main: boolean;
    loading_active: boolean;
    loading_update: boolean;
}

export type EntityBranchCreateDto = Omit<
    EntityBranchDto, 
    'id' | 
    'entity_document_number' | 
    'entity_name' | 
    'entity_address' | 
    'entity_department' | 
    'entity_province' | 
    'entity_district' | 
    'entity_country' | 
    'department' | 
    'province' | 
    'district' | 
    'created_at' | 
    'created_at_user' | 
    'created_at_user_name' | 
    'updated_at' | 
    'updated_at_user' | 
    'updated_at_user_name' | 
    'active' | 
    'loading_active' | 
    'loading_update'
>;

export type EntityBranchUpdateDto = Omit<
    EntityBranchDto, 
    'entity_document_number' | 
    'entity_name' | 
    'entity_address' | 
    'entity_department' | 
    'entity_province' | 
    'entity_district' | 
    'entity_country' | 
    'department' | 
    'province' | 
    'district' | 
    'created_at' | 
    'created_at_user' | 
    'created_at_user_name' | 
    'updated_at' | 
    'updated_at_user' | 
    'updated_at_user_name' | 
    'active' | 
    'loading_active' | 
    'loading_update'
>;


export interface EliminarEstablecimientoResponseDTO{
    detalle: string;
}

export interface ActualizarEstadoEstablecimientoRequestDTO{
    id_estado: number;
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


export interface EntityBranchListToSelectDTO{
    id: number;
    descripcion: string;
    area: string | null;
}