export interface CastigoAsociado {
    CODIGO_AGENCIA: string;
    NOMBRE_AGENCIA: string;
    TOTAL_CUENTAS: number;
    TOTAL_DEUDA: number;
}

export interface DetalleCastigo {
    AAUX93: string;
    DESC03: string;
    NNIT93: string;
    DCTA93: string;
    DDEP93: string;
    DEPE93: string;
    NCTA93: string;
    DNOM93: string;
    DIST93: string;
    SALDO_TOTAL: number;
    FTAG05: string | null;
}

export interface AnioFiltro {
    ANIO: string;
    TOTAL: number;
}

export interface FiltrosResumenState {
    filtroRecaudacion: string;
    aniosSeleccionados: string[];
}

export interface ZonaTotales {
    norte: { cuentas: number; valor: number };
    centro: { cuentas: number; valor: number };
    sur: { cuentas: number; valor: number };
    total: { cuentas: number; valor: number };
}

export interface DetalleCastigoExcel {
    agencia: string;
    recaudacion: string;
    zonaJuridica: string;
    nit: string;
    tipoCuenta: string;
    numeroCuenta: string;
    nombre: string;
    score?: string;
    valor: number;
    fecha: string;
}

export type FiltroRecaudacion = 
    | 'LEY_INSOLVENCIA'
    | 'SALDO_MINIMO'
    | 'SIN_MEDIDA_CAUTELAR'
    | 'CARTERA_PROBLEMA'
    | 'EMBARGO_BIENES'
    | 'EMBARGO_SECUESTRADO'
    | 'CC_REMATE'
    | 'SIN_AMNISTIA'
    | '';