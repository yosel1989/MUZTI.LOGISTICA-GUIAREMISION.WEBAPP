import { ItemsToAddGuiaDto } from "app/features/items/models/item-to-guia";

export const fakeItemsToAddGuia: ItemsToAddGuiaDto[] = [
  {
    code: "ITM-001",
    description: "Laptop Dell Inspiron 15",
    unit_of_measure: "NIU", // Unidad
    currency: "USD",
    unit_mount: 2,
    selected: false
  },
  {
    code: "ITM-002",
    description: "Silla ergonómica de oficina",
    unit_of_measure: "NIU", // Unidad
    currency: "PEN",
    unit_mount: 5,
    selected: false
  },
  {
    code: "ITM-003",
    description: "Paquete de hojas A4 (500 unidades)",
    unit_of_measure: "PK", // Paquete
    currency: "USD",
    unit_mount: 20,
    selected: false
  },
  {
    code: "ITM-004",
    description: "Teléfono móvil Samsung Galaxy A54",
    unit_of_measure: "NIU", // Unidad
    currency: "EUR",
    unit_mount: 3,
    selected: false
  },
  {
    code: "ITM-005",
    description: "Botella de agua mineral 1L",
    unit_of_measure: "LTR", // Litro
    currency: "PEN",
    unit_mount: 50,
    selected: false
  },
];
