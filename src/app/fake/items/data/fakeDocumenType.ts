import { DocumentEntityType } from "app/features/items/models/document-entity-type";

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
