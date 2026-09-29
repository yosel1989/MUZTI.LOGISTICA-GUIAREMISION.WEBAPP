export interface SecurityPersonalAreaDto{
    security_person_id: number;
    area_id: number;
    area_name: string;

    created_at: Date ;
    created_at_user: string;
    created_at_user_name: string;

    loading_update: boolean;
    loading_active: boolean;
}

export type SecurityPersonalAreaCreateDto = Pick<SecurityPersonalAreaDto, 'security_person_id' | 'area_id'>;

export type SecurityPersonalAreaDeleteDto = Pick<SecurityPersonalAreaDto, 'security_person_id' | 'area_id'>;