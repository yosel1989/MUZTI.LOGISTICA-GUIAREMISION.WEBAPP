export interface PaisDto{
    pais: string;
    codigo: string;
}

export interface EmisorVehicularDto{
    codigo: string;
    nombre: string;
    abreviatura: string;
}

export interface TipoEstablecimientoDTO{
    tipo: string;
    codigo: string;
}


export interface TipoDocumentoDTO{
    id: number;
    descripcion: string;
    descripcion_corta: string;
    codigo_sunat: string;
    min: number | null;
    max: number | null;
}