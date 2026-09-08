export interface IntegrationCredentialDto{
    id: number;
    entity_id: number | null;
    entity_name: string | null;
    entity_document_number: string | null;
    provider: string;
    key: string;
    key_test: string | null;
    active: boolean;
    created_at: Date;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;
}

export interface IntegrationCredentialTableDto extends IntegrationCredentialDto {
    loading_update: boolean;
    loading_active: boolean;
}

export interface IntegrationCredentialCreateDto{
    entity_id: number | null;
    provider: string;
    key: string;
    key_test: string | null;
}

export interface IntegrationCredentialUpdateDto{
    id: number;
    entity_id: number | null;
    provider: string;
    key: string;
    key_test: string | null;
}