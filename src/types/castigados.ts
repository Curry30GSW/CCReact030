export interface Castigado {
  DIRE03: string;
  DIST93: number;
  MAIL05: string;
  AAUX93: number;
  NCTA93: number;
  NNIT93: string;
  DCTA93: string;
  ESCR93: number;
  ORCR93: number;
  DDEP93: string;
  DEPE93: number;
  AUXA05: number;
  FTAG05: number;
  DNOM93: string;
  DIRE05: string;
  DESC03: string;
  TELE05: string;
  TCEL05: string;
  DIRO03: string;
  TELS03: string;
  Score: string;
  FechaInsercion: string;
  CREDITOS_AGRUPADOS?: string | null;
}

export interface Agencia {
  codigo: number;
  nombre: string;
  texto: string;
}

export interface FiltrosState {
  fechaInicio: string;
  fechaFin: string;
  ordenFecha: 'asc' | 'desc';
  ordenValor: '' | 'asc' | 'desc';
  score: string;
  recaudacion: string;
  agenciasSeleccionadas: string[];
}

export interface DatosParaExcel {
  agencia: string;
  recaudacion: string;
  agenciaCodigo: number;
  zonaJuridica: string;
  nit: string;
  tipoCuenta: string;
  numeroCuenta: number;
  nombre: string;
  score: string;
  valor: number;
  fecha: string;
}