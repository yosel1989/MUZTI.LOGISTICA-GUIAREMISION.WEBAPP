export interface EstablecimientoListToModalDTO{
    id: number;
    descripcion: string;
    codigo_sunat: string;
}

export interface EstablecimientoDTO{
    id: number;
    ruc: string;
    descripcion: string;
    ubigeoId: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    pais: string;
    email: string | null;
    serie: string;
    codigoSunat: string;
    fechaCreacion: Date;
    fechaEdicion: Date | null;
    empleadoIdCreacion: number;
    empleadoNombreCreacion: string;
    empleadoIdEdicion: number;
    empleadoNombreEdicion: string;
    estado: string;
    idEstado: number;
    tipo: string;
    razonSocial: string;
}