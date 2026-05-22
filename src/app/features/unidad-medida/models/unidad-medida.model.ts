export interface UnidadMedidaDto{
    id: number;
    codigo_um: string;
    descripcion: string;
    es_unidad_peso: boolean;
    es_unidad_volumen: boolean;
    es_unidad_longitud: boolean;
    es_unidad_conteo: boolean;
    activo: boolean;
}

export interface UnidadMedidaToSelectDto{
    id: number;
    codigo_um: string;
    descripcion: string;
}