export interface EntityDto{
    id: number;
    type: 'company' | 'person';
    name: string | null;
    first_name: string | null;
    last_name: string | null;
    document_type_id: number;
    document_number: string;
    ubigeo_id: string | null;
    address: string | null;
    country_id: number | null;
    is_internal: boolean;
    active: boolean;
    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null

    loading_status: boolean;
    loading_update: boolean;
}

export interface EntityCreateDto extends Omit<EntityDto, 'id' | 'created_at' | 'created_at_user' | 'created_at_user_name' | 'updated_at' | 'updated_at_user' | 'updated_at_user_name' | 'active' | 'loading_status' | 'loading_update'>{
    role: string
}

export type ProviderDto = EntityDto;