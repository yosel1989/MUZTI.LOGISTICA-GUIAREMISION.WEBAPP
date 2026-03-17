export interface DestinatarioBusqueda {
  id: number;
  tipo_documento: 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
  numero_documento: string;
  razon_social: string;
  codigo_sunat: string | null;
}