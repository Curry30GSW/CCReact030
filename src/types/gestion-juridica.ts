export interface GestionJuridica {
  // Datos básicos
  id?: number;
  NCTA29?: string;
  nombre?: string;
  
  // Información de la gestión
  fecha_gestion?: string;
  hora_gestion?: string;
  gestion?: string;
  origen?: 'AS400' | 'MySQL' | 'Software Cartera Cast.';
  
  // Información del usuario
  usuario_gestion?: string;
  usuario_pregunta?: string;
  
  // Metadata
  fechaInsercion?: string;
  success?: boolean;
  data?: GestionJuridica[];
}

export interface HistorialGestiones {
  cuenta: string;
  nombreCliente: string;
  totalGestiones: number;
  gestiones: GestionJuridica[];
  ultimaGestion?: GestionJuridica;
}