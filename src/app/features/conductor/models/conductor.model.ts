export interface ConductorByNumeroDocumento{
    id: number;
    tipo_documento: string;
    numero_documento: string;
    nombres: string;
    apellidos: string;
    cargo: string | null;
    licencia: string;
    fechaCreacion: Date;
}