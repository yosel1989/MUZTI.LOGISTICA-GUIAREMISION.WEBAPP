export interface IntegrationCredentialDto{
    id: number;
    entity_id: number;
    provider: string;
    key: string;
    active: boolean;
    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;
}

export interface IntegrationCredentialTableDto extends IntegrationCredentialDto {
    entity_name: string;
    entity_document_number: string;
    loading_update: boolean;
    loading_active: boolean;
}

export interface IntegrationCredentialCreateDto{
    entity_id: number;
    provider: string;
    key: string;
}

export interface IntegrationCredentialUpdateDto{
    id: number;
    entity_id: number;
    provider: string;
    key: string;
}