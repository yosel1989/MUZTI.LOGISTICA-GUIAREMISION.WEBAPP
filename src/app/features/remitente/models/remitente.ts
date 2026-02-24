export interface RemitenteToSelect {
  remitente_id: number;              
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

export interface RemitenteByIdToGuia{
  remitente_id: number;              
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
