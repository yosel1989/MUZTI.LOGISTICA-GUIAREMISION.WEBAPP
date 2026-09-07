export interface EntityRoleDto{
    id: number;
    role: 'cliente' | 'proveedor' | 'transportista' | 'emisor';
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

export type EntityRolesToSelectDto = Pick<EntityRoleDto, 'role'> & {
  label: string;
  disabled: boolean;
};

export interface EntityRolesSyncDto {
  id: number;
  roles: string[];
}
