export interface SecurityPersonalDto{
    id: number;
    person_id: number;
    person_full_name: string;
    person_document_number: string | null;
    person_role: string | null;
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


export type SecurityPersonalCreateDto = Pick<SecurityPersonalDto, 'person_id'>;
export type SecurityPersonalUpdateDto = Pick<SecurityPersonalDto, 'id' | 'person_id'>;