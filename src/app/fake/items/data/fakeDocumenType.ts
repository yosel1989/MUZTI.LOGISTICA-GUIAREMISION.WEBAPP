import { TipoDocumentoComprobanteEnum } from "app/features/guia-remision/enums/tipo-documento.enum";
import { DocumentEntityType } from "app/features/items/models/document-entity-type";
import { DocumentInvoiceType } from "app/shared/models/document-invoice-type";

export const FAKE_DOCUMENT_TYPE_PERSON: DocumentEntityType[] = [
  { value: "DNI", description: "DNI" },
  { value: "CE", description: "Carnet de extranjería" },
  { value: "PASAPORTE", description: "Pasaporte" }
];

export const FAKE_DOCUMENT_TYPE_PROVIDER: DocumentEntityType[] = [
  { value: "DNI", description: "DNI" },
  { value: "CE", description: "Carnet de extranjería" },
  { value: "PASAPORTE", description: "Pasaporte" },
  { value: "RUC", description: "RUC" },
];

export const FAKE_DOCUMENT_INVOICE_TYPE_TO_DOCREF: DocumentInvoiceType[] = [
  { value: TipoDocumentoComprobanteEnum.factura, description: "Factura" },
  { value: TipoDocumentoComprobanteEnum.boleta, description: "Boleta de venta" }
];