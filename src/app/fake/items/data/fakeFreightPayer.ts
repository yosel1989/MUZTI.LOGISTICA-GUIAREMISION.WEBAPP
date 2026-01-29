import { EnumPagadorFlete } from "app/features/guia-remision/enums/pagador-flete.enum";
import { FreightPayer } from "app/features/items/models/freight-payer";

export const FAKE_FREIGHT_PAYER : FreightPayer[] = [
    { value: "REMITENTE", description: EnumPagadorFlete.remitente },
    { value: "SUBCONTRATADOR", description: EnumPagadorFlete.subcontratador },
    { value: "OTRO", description: EnumPagadorFlete.otro },
];