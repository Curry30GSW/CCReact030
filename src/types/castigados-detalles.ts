// types/castigados-detalle.ts
import { ReactNode } from 'react';

export interface CastigadoDetalle {
    FTAG05: ReactNode;
  // Campos adicionales para secciones
  ORCR93?: number;      // Crédito ordinario
  ESCR93?: number;      // Crédito especial
  DCTA93?: string;      // Descripción cuenta
  DNOM93?: string;      // Descripción nómina
  DIST93?: string;      // Distrito
  DEPE93?: string;      // Dependencia
  DDEP93?: string;      // Descripción dependencia
  NCTA93?: string;      // Número de cuenta
  NITC93?: string;      // Nit cliente
  NOMB93?: string;      // Nombre cliente
  APE193?: string;      // Primer apellido
  APE293?: string;      // Segundo apellido
  NOM193?: string;      // Primer nombre
  NOM293?: string;      // Segundo nombre
  FING93?: string;      // Fecha de ingreso
  FULT93?: string;
  NNIT93?: string;     // Nombre nit cliente
  Score?: string | number; // Score Datacrédito
  FechaInsercion?: string; // Fecha inserción para semáforo
  
  // Información de contacto
  DIRE05?: string;      // Dirección
  TELE05?: string;      // Teléfono fijo
  TCEL05?: string;      // Teléfono celular
  MAIL05?: string;      // Email
  
  // Información de agencia
  AAUX93?: string;      // Agencia
  DESC03?: string;      // Descripción agencia
  DIRO03?: string;      // Dirección agencia
  TELS03?: string;      // Teléfonos agencia
  
  // Información adicional
  INDC05?: string;
  LNAC05?: string;
  FECN05?: number;
  ESTC05?: string;
  CARG05?: string;
  MVIV05?: string;
  PLAC05?: string;
  
  // Referencias tradicionales
  FRIP05?: number;
  NOM531?: string;
  APE531?: string;
  DIR531?: string;
  CIU531?: string;
  TCE531?: string;
  TRF531?: string;
  NOM532?: string;
  APE532?: string;
  DIR532?: string;
  CIU532?: string;
  TCE532?: string;
  TOF532?: string;
  TRF532?: string;
  NOM533?: string;
  APE533?: string;
  DIR533?: string;
  CIU533?: string;
  TCE533?: string;
  TRF533?: string;
  
  // Beneficiarios
  BEN105?: string;
  NIT105?: string;
  CEL105?: string;
  PAR105?: string;
  BEN205?: string;
  NIT205?: string;
  CEL205?: string;
  PAR205?: string;
  BEN305?: string;
  NIT305?: string;
  CEL305?: string;
  PAR305?: string;

    imageBase64?: string;
    contentType?: string;
  
  creditos?: Credito[];
}

export interface Credito {
  numero: string;
  tipo_credito: string;
  descripcion_tipo_credito: string;
  moga: string;
  descripcion_moga: string;
  saldo_capital: number;
  interes: number;
  interes_mora: number;
  interes_contingente: number;
  scjo: number;
  pagare_pdf?: string;
}