export interface EntityBranchSerieDto {
  id: number;
  entity_branch_id: number;
  invoice_type_id: number;
  invoice_type: string;
  serie: string;
  area: string;
  active: boolean;
  created_at: Date;
  created_at_user: string;
  created_at_user_name: string;
  updated_at: Date | null;
  updated_at_user: string | null;
  updated_at_user_name: string | null;

  loading_active: boolean;
  loading_update: boolean;
}

export type EntityBranchSerieCreateDto = Pick<EntityBranchSerieDto, 
    'entity_branch_id' | 'invoice_type_id' | 'serie' | 'area' >;

export type EntityBranchSerieUpdateDto = Pick<EntityBranchSerieDto, 
    'id' | 'entity_branch_id' | 'invoice_type_id' | 'serie' | 'area'>;