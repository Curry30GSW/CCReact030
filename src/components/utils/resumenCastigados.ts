import { CastigoAsociado, ZonaTotales } from '../../types/resumen';

export const determinarZonaJuridica = (agencia: string): string => {
    const agenciaNum = parseInt(agencia);
    const zonas = {
        centro: [48, 80, 89, 94, 83, 13, 68, 73, 76, 90, 91, 92, 96, 93, 95],
        norte: [87, 86, 85, 81, 84, 88, 98, 97, 82],
        sur: [77, 49, 70, 42, 46, 45, 47, 78, 74, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 29]
    };

    if (zonas.centro.includes(agenciaNum)) return '21 - JURIDICO ZONA CENTRO';
    if (zonas.norte.includes(agenciaNum)) return '22 - JURIDICO ZONA NORTE';
    if (zonas.sur.includes(agenciaNum)) return '23 - JURIDICO ZONA SUR';
    return 'No determinada';
};

export const formatearFechaFTAG05 = (ftag05: string | null): string => {
    if (!ftag05) return 'SIN_FECHA';
    
    const fechaRaw = String(19000000 + parseInt(ftag05));
    const anio = fechaRaw.substring(0, 4);
    const mesNumero = parseInt(fechaRaw.substring(4, 6)) - 1;
    const dia = fechaRaw.substring(6, 8);
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dia}/${meses[mesNumero]}/${anio}`;
};

export const calcularTotalesPorZona = (asociados: CastigoAsociado[]): ZonaTotales => {
    const zonas = {
        norte: [87, 86, 85, 81, 84, 88, 98, 97, 82],
        centro: [48, 80, 89, 94, 83, 13, 68, 73, 76, 90, 91, 92, 96, 93, 95],
        sur: [77, 49, 70, 42, 46, 45, 47, 78, 74, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 29]
    };

    const resultado: ZonaTotales = {
        norte: { cuentas: 0, valor: 0 },
        centro: { cuentas: 0, valor: 0 },
        sur: { cuentas: 0, valor: 0 },
        total: { cuentas: 0, valor: 0 }
    };

    asociados.forEach((asociado) => {
        const agencia = parseInt(asociado.CODIGO_AGENCIA);
        const cuentas = Number(asociado.TOTAL_CUENTAS);
        const valor = Number(asociado.TOTAL_DEUDA);

        if (zonas.norte.includes(agencia)) {
            resultado.norte.cuentas += cuentas;
            resultado.norte.valor += valor;
        } else if (zonas.centro.includes(agencia)) {
            resultado.centro.cuentas += cuentas;
            resultado.centro.valor += valor;
        } else if (zonas.sur.includes(agencia)) {
            resultado.sur.cuentas += cuentas;
            resultado.sur.valor += valor;
        }

        resultado.total.cuentas += cuentas;
        resultado.total.valor += valor;
    });

    return resultado;
};

export const obtenerFechaCorte = (): string => {
    const ahora = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return ahora.toLocaleDateString('es-CO', opciones);
};