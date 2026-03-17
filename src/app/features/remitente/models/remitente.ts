export interface RemitenteToSelect {
  id: number;              
  nombre_empresa: string;            
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
  /*nueva_serie: string | null;        
  nuevo_correlativo: number | null;  
  nuevo_numero_guia: string | null;*/          
}

export interface RemitenteByIdToGuia{
  id: number;              
  nombre_empresa: string;            
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

export interface RemitenteDto {
  id: number;
  nombre_empresa: string; 
  ruc: string; 
  descripcion: string; 
  ubigeo_id: string; 
  departamento: string; 
  provincia: string; 
  distrito: string; 
  direccion: string; 
  email: string; 
  emailFacturador: string; 
  pais: string; 
  serie: string | null; 
  codigo_sunat: string | null; 
  fecha_creacion: Date; 
  fecha_ultima_edicion: Date | null; 
  empleado_nombre_creacion: string | null; 
  empleado_nombre_edicion: string | null; 
  estado: string; 
  id_estado: number;
  ldEstado: boolean;
}

export interface RegistrarRemitenteRequestDto{
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
}

export interface RegistrarRemitenteResponseDto {
  id: number;
  detalle: string;
}

export interface EditarRemitenteRequestDto{
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
}

export interface EditarRemitenteResponseDto {
  id: number;
  nombre_empresa: string;
  ruc: string;
  descripcion: string;
  ubigeo_id: string;
  departamento: string;
  provincia: string;
  distrito: string; 
  direccion: string;
  email: string;
  emailFacturador: string; 
  pais: string;
  serie: string | null;
  codigo_sunat: string | null;
  fecha_creacion: Date;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_creacion: string | null; 
  empleado_nombre_edicion: string | null;
  estado: string;
  id_estado: number;
}

export interface EliminarRemitenteResponseDto {
  id: number;
  eliminado: boolean;
  detalle: string;
}

export interface ActualizarEstadoRemitenteRequestDto{
  id: number;
  id_estado: number;
  edited_employee_id: number;
  edited_employee_name: string;
}

export interface ActualizarEstadoRemitenteResponseDto{
  id: number;
  id_estado: number;
  estado: string;
  fecha_ultima_edicion: Date | null;
  empleado_nombre_edicion: string | null;
  detalle: string;
}

export interface RemitenteNombre {
  id: number;                                  
  descripcion: string;                      
}