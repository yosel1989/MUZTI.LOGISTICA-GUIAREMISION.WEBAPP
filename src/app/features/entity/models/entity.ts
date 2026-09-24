import { EntityBranchSerieDto } from "@features/entity-branch-serie/models/entity-branch-serie";
import { EntityBranchDto } from "@features/entity-branch/models/entity-branch";

export interface EntityDto{
    id: number;
    type: 'empresa' | 'persona';
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    document_type_id: number;
    document_type: string;
    document_number: string;
    ubigeo_id: string | null;
    address: string | null;
    country_id: number | null;
    country: string | null;
    is_internal: boolean;
    active: boolean;

    // opcionales

    mtc_code: string | null;

    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null

    loading_status: boolean;
    loading_update: boolean;
}

export interface EntityCreateDto extends Omit<EntityDto, 'created_at' | 'created_at_user' | 'created_at_user_name' | 'updated_at' | 'updated_at_user' | 'updated_at_user_name' | 'active' | 'loading_status' | 'loading_update' | 'document_type' | 'country'>{
    role: string
}

export interface EntityUpdateDto extends Omit<EntityDto, 'created_at' | 'created_at_user' | 'created_at_user_name' | 'updated_at' | 'updated_at_user' | 'updated_at_user_name' | 'active' | 'loading_status' | 'loading_update' | 'document_type' | 'country'>{
    role: string
}


export type EntityListDto = Pick<EntityDto, 'id' | 'type' | 'name' | 'first_name' | 'last_name' | 'document_number' | 'document_type'>;


export type ProviderDto = EntityDto;

export type TransporterDto = EntityDto;




export interface EntityBySerieAssignedDto{
    entity: EntityBySerieAssigned_EntityDto;
    entity_branch_serie: EntityBySerieAssigned_EntityBranchSerieDto;
    entity_branch: EntityBySerieAssigned_EntityBranchDto;
}

export interface EntityBySerieAssigned_EntityDto extends Pick<EntityDto, 
    'id' |
    'name' |
    'document_number' |
    'ubigeo_id' |
    'mtc_code' | 
    'first_name' | 
    'last_name'
>{
    department: string;
    province: string;
    district: string;
};

export type EntityBySerieAssigned_EntityBranchSerieDto = Pick<EntityBranchSerieDto, 
    'id' | 
    'serie' | 
    'area'
>;

export type EntityBySerieAssigned_EntityBranchDto = Pick<EntityBranchDto, 
    'id' | 
    'description' | 
    'address' | 
    'ubigeo_id' | 
    'department' | 
    'province' | 
    'district' | 
    'code_sunat'
>;