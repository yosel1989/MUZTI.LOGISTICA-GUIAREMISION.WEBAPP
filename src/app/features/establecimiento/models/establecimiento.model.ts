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
    fecha_registro: Date;
    fecha_modifico: Date | null;
    usuario_registro: string;
    usuario_registro_nombre: string;
    usuario_modifico: string | null;
    usuario_modifico_nombre: string | null;
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
    tipo: string;
}

export interface EstablecimientoRemitenteGuiaDTO{
  establecimiento_id: number;              
  razon_social: string;            
  ruc: string;                       
  descripcion: string;               
  ubigeo_id: string;                 
  departamento: string;              
  provincia: string;                 
  distrito: string;                  
  direccion: string;                 
  email: string | null;                     
  pais: string;                      
  serie: string | null;              
  nueva_serie: string | null;        
  nuevo_correlativo: number | null;  
  nuevo_numero_guia: string | null;           
} 