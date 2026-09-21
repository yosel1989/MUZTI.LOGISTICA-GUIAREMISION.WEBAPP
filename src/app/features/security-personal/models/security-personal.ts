export interface SecurityPersonalDto{
    id: number;
    document_number: string;
    full_name: string;
    role: string | null;
    active: boolean;
    created_at: Date ;
    created_at_user: string;
    created_at_user_name: string;
    updated_at: Date | null;
    updated_at_user: string | null;
    updated_at_user_name: string | null;

    loading_update: boolean;
    loading_active: boolean;
}


export type SecurityPersonalCreateDto = Pick<SecurityPersonalDto, 'document_number'>;
export type SecurityPersonalUpdateDto = Pick<SecurityPersonalDto, 'id' | 'document_number'>;