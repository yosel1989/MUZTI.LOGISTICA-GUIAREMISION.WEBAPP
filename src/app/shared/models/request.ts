export interface ToggleActiveRequestDto{
    id: number;
    active: boolean;
}

export interface ToggleActiveResponseDto extends ToggleActiveRequestDto{
    updated_at: Date | null;
    updated_at_user: string;
    updated_at_user_name: string;
    detalle: string;
}