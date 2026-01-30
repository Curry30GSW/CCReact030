export interface ProcesoJuridico {
  // Datos básicos del proceso
  NCTA29: string;
  EXPEJUZ29?: string;
  EXPEINT29?: string;
  ESTADO29?: string;
  ES_DESCR?: string;
  FRAD29?: number;
  FCHA29?: number;
  JUZG29?: string;
  DEJ129?: string;
  AGENCIA29?: string;
  VALOR_VENCIDO?: number;
  
  // Datos del abogado
  NOM?: string;
  APE1?: string;
  APE2?: string;
  CABO29?: string;
  ZONA?: string;
  
  // Datos del demandado
  DESC05?: string;
  NNIT05?: string;
  
  // Medidas cautelares
  MEDIDAS_DETALLE?: string;
  
  // Datos adicionales
  fechaInsercion?: string;
  success?: boolean;
  data?: ProcesoJuridico[];
}

export interface MedidaCautelar {
  tipo: string;
  observacion: string;
  fecha: string;
  usuario: string;
}

export interface ZonaJuridica {
  codigo: string;
  nombre: string;
  agencias: number[];
}