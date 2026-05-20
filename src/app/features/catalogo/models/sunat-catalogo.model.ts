import { SunatMotivoTrasladoEnum } from "@features/guia-remision/enums/guia-remision.enum";

export interface SunatMotivoTrasladoDto{
    id: number;
    nombre: string;
    codigo: SunatMotivoTrasladoEnum;
}