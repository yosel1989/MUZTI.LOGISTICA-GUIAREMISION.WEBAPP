export interface ItemsToAddGuiaDto{
    code: string;
    description: string;
    unit_of_measure: string;
    currency: string;
    unit_mount: number;
    selected: boolean;
}

export interface ItemsToGuiaRequestDto{
    codigo: string;
    descripcion: string;
    cantidad: string;
    codigo_um: string;
}