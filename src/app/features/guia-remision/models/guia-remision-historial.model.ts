export interface GuiaRemisionHistorialListDTO {
  motivo: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  descripcion: string | null;
  fecha_registro: Date;
  usuario_registro: string;
  usuario_registro_nombre: string;
}