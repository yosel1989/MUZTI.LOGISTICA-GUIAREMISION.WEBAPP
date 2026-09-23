export interface SecurityPersonalEntityBranchDto{
    security_person_id: number;
    entity_branch_id: number;
    entity_branch_alias: string;
    entity_branch_address: string;
    entity_name: string;
    entity_document_number: string;

    created_at: Date ;
    created_at_user: string;
    created_at_user_name: string;

    loading_update: boolean;
    loading_active: boolean;
}

export type SecurityPersonalEntityBranchCreateDto = Pick<SecurityPersonalEntityBranchDto, 'security_person_id' | 'entity_branch_id'>;