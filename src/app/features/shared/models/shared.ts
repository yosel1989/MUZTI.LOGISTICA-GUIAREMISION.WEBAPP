export interface ActualizarEstadoDto{
  id: number;
  id_estado: number;
  edited_employee_id: number;
  edited_employee_name: string;
}

export interface ActualizarEstadoResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string | null;
  detalle: string;
}

export interface EliminarResponseDto {
  id: number;
  eliminado: boolean;
  detalle: string;
}