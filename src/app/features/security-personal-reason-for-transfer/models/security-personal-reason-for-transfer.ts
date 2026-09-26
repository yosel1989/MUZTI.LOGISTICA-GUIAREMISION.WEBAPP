export interface SecurityPersonalReasonForTransferDto{
    security_person_id: number;
    reason_for_transfer_id: number;
    reason_for_transfer_name: string;
    reason_for_transfer_code_sunat: string;

    created_at: Date ;
    created_at_user: string;
    created_at_user_name: string;
    created_at_employee_id: number;

    loading_update: boolean;
    loading_active: boolean;
}

export type SecurityPersonalReasonForTransferCreateDto = Pick<SecurityPersonalReasonForTransferDto, 'security_person_id' | 'reason_for_transfer_id'>;

export type SecurityPersonalReasonForTransferDeleteDto = Pick<SecurityPersonalReasonForTransferDto, 'security_person_id' | 'reason_for_transfer_id'>;