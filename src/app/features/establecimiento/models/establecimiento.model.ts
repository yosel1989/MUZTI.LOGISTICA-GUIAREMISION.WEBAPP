export interface EstablecimientoListToModalDTO{
    id: number;
    descripcion: string;
    codigo_sunat: string;
}

export interface EstablecimientoDTO{
    id: number;
    ruc: string;
    descripcion: string;
    ubigeo_id: string;
    departamento: string;
    provincia: string;
    distrito: string;
    direccion: string;
    pais: string;
    email: string | null;
    serie: string;
    codigo_sunat: string;
    fecha_creacion: Date;
    fecha_edicion: Date | null;
    empleado_id_creacion: number;
    empleado_nombre_creacion: string;
    empleado_id_edicion: number;
    empleado_nombre_edicion: string;
    estado: string;
    id_estado: number;
    tipo: string;
    razon_social: string;
    ld_estado: boolean;
    ld_update: boolean;
}

export interface EliminarEstablecimientoResponseDTO{
    detalle: string;
}

export interface ActualizarEstadoEstablecimientoRequestDTO{
    id_estado: number;
    edited_employee_id: number;
    edited_employee_name: string;
}

export interface ActualizarEstadoEstablecimientoResponseDTO{
    id: number;
    id_estado: number;
    estado: string;
    fecha_edicion: Date | null;
    empleado_nombre_edicion: string;
    detalle: string;
}


export interface RegistrarEstablecimientoRequestDTO{
    ruc: string;
    descripcion: string;
    ubigeo_id: string;
    direccion: string;
    email: string | null;
    pais: string;
    serie: string | null;
    codigo_sunat: string | null;
    empleado_id_creacion: number | null;
    empleado_nombre_creacion: string | null;
    tipo: string;
}

export interface EditarEstablecimientoRequestDTO{
    establecimiento_id: number;
    ruc: string;
    descripcion: string;
    ubigeo_id: string;
    direccion: string;
    email: string | null;
    pais: string;
    serie: string | null;
    codigo_sunat: string | null;
    empleado_id_edicion: number | null;
    empleado_nombre_edicion: string | null;
    tipo: string;
}

export interface EstablecimientoRemitenteGuiaDTO{
  id: number;              
  razon_social: string;            
  ruc: string;                       
  descripcion: string;               
  ubigeo_id: string;                 
  departamento: string;              
  provincia: string;                 
  distrito: string;                  
  direccion: string;                 
  email: string;                     
  pais: string;                      
  serie: string | null;              
  nueva_serie: string | null;        
  nuevo_correlativo: number | null;  
  nuevo_numero_guia: string | null;           
} 