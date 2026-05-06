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
  fecha_modifico: Date | null;
  usuario_modifico: string;
  usuario_modifico_nombre: string;
  detalle: string;
}

export interface EliminarResponseDto {
  id: number;
  eliminado: boolean;
  detalle: string;
}