import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DetalleCastigo } from '../../types/resumen';
import { determinarZonaJuridica as determinarZonaJuridicaOriginal } from './excelExportCastigados';

export interface DetalleExportItem {
    agencia: string;
    recaudacion: string;
    zonaJuridica: string;
    nit: string;
    tipoCuenta: string;
    numeroCuenta: string;
    nombre: string;
    valor: number;
    fecha: string;
}


const formatearRecaudacion = (item: DetalleCastigo): string => {
    const dist = item.DIST93 !== undefined ? item.DIST93 : 0;
    const depe = item.DEPE93 !== undefined ? item.DEPE93 : 0;
    const ddep = item.DDEP93 || 'Sin tipo';
    
    return `${dist} - ${depe} ${ddep}`;
};

const determinarCategoriaRecaudacion = (depe93: number): string => {
    switch (depe93) {
        case 59:
            return 'Ley Insolvencia';
        case 0:
        case 46:
            return 'Saldo menor a Salario Mínimo';
        case 51:
        case 52:
        case 53:
        case 54:
            return 'Sin Medida Cautelar';
        case 66:
            return 'CC - Problema';
        case 72:
            return 'CC - Embargo Bien Mueble/Inmueble';
        case 73:
            return 'CC - Embargo Bien Secuestrado';
        case 74:
            return 'CC - Remate';
        case 99:
            return 'CC - Sin Amnistía';
        default:
            return 'Otros';
    }
};


// Función auxiliar para formatear fecha FTAG05
export const formatearFechaExcel = (fechaFTAG05?: string): string => {
    if (!fechaFTAG05) return 'SIN_FECHA';
    
    try {
        const fechaRaw = String(19000000 + parseInt(fechaFTAG05));
        const anio = fechaRaw.substring(0, 4);
        const mesNumero = parseInt(fechaRaw.substring(4, 6)) - 1;
        const dia = fechaRaw.substring(6, 8);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${dia}/${meses[mesNumero]}/${anio}`;
    } catch {
        return 'FECHA_INVALIDA';
    }
};

// Formatear fecha de corte
const formatearFechaCorte = (fecha: Date): string => {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} de ${mes} de ${año}`;
};

// Convertir datos de DetalleCastigo a formato de exportación
const convertirDatosParaExportar = (
    detalles: DetalleCastigo[]
): DetalleExportItem[] => {
    return detalles.map(item => {
        // Extraer código de agencia del string "48 - BOSA"
        const agenciaText = `${item.AAUX93} - ${item.DESC03}`;
        const zonaJuridica = determinarZonaJuridicaOriginal(Number(item.AAUX93));
        
        return {
            agencia: agenciaText,
            recaudacion: formatearRecaudacion(item),
            zonaJuridica: zonaJuridica,
            nit: Number(item.NNIT93).toLocaleString('es-CO'),
            tipoCuenta: item.DCTA93,
            numeroCuenta: String(item.NCTA93),
            nombre: item.DNOM93,
            valor: Number(item.SALDO_TOTAL) || 0,
            fecha: formatearFechaExcel(item.FTAG05 ?? undefined)

        };
    });
};

// Función principal de exportación
export const exportarDetalleAExcel = async (
    detalles: DetalleCastigo[],
    agenciaCodigo: string,
    agenciaNombre: string,
    filtroRecaudacion?: string,
    aniosSeleccionados?: string[]
) => {
    try {
        // Convertir datos al formato de exportación
        const datosExportar = convertirDatosParaExportar(detalles);
        
        // Crear workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`Detalle Agencia ${agenciaCodigo}`, {
            properties: { defaultRowHeight: 18 }
        });

        // Fecha actual para el nombre del archivo
        const now = new Date();
        const fechaFormateada = now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '_');

        // --- FILA 1: TÍTULO PRINCIPAL
        worksheet.mergeCells('A1:I1');
        const titleCell = worksheet.getCell('A1');
        const fechaCorte = formatearFechaCorte(now);
        titleCell.value = `Detalle de Asociados Castigados - Agencia ${agenciaCodigo} - ${agenciaNombre} - Corte ${fechaCorte}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- FILA 2: FECHA DE GENERACIÓN
        worksheet.mergeCells('A2:I2');
        const dateCell = worksheet.getCell('A2');
        const opcionesFecha: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        };
        const fechaStr = now.toLocaleDateString('es-ES', opcionesFecha).replace(/\./g, '');
        const horaStr = now.toLocaleTimeString('es-ES', { hour12: true });
        dateCell.value = `Fecha de generación: ${fechaStr} ${horaStr}`;
        dateCell.font = { bold: true, size: 11 };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- FILA 3: FILTROS APLICADOS
        let filaFiltros = 3;
        
        if (filtroRecaudacion || (aniosSeleccionados && aniosSeleccionados.length > 0)) {
            let textoFiltros = 'Filtros aplicados: ';
            const filtros = [];
            
            if (filtroRecaudacion) {
                // Si hay filtro de recaudación, mostrarlo
                const nombreFiltro = obtenerNombreRecaudacion(filtroRecaudacion);
                filtros.push(`Filtro aplicado: ${nombreFiltro}`);
            }
            
            if (aniosSeleccionados && aniosSeleccionados.length > 0) {
                const aniosTexto = aniosSeleccionados.join(', ');
                filtros.push(`Años: ${aniosTexto}`);
            }
            
            textoFiltros += filtros.join(' | ');
            
            worksheet.mergeCells(`A${filaFiltros}:I${filaFiltros}`);
            const filtrosCell = worksheet.getCell(`A${filaFiltros}`);
            filtrosCell.value = textoFiltros;
            filtrosCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
            filtrosCell.alignment = { horizontal: 'center', vertical: 'middle' };
            filaFiltros++;
        }

        worksheet.addRow([]);

        // Headers de la tabla - AHORA CON 9 COLUMNAS
        const headers = [
            'Agencia',
            'Recaudación', 
            'Zona Jurídica',
            'Cédula',
            'Asociado',
            'Cuenta',
            'Nomina',
            'Valor Castigado',
            'Fecha Castigo'
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Configurar anchos de columna - AHORA CON 9 COLUMNAS
        worksheet.columns = [
            { key: 'agencia', width: 30 },
            { key: 'recaudacion', width: 35 }, 
            { key: 'zonaJuridica', width: 30 },
            { key: 'nit', width: 18 },
            { key: 'tipoCuenta', width: 25 },
            { key: 'numeroCuenta', width: 20 },
            { key: 'nombre', width: 40 },
            { key: 'valor', width: 18 },
            { key: 'fecha', width: 16 }
        ];

        // Agregar los datos
        datosExportar.forEach(item => {
            worksheet.addRow({
                agencia: item.agencia,
                recaudacion: item.recaudacion, 
                zonaJuridica: item.zonaJuridica,
                nit: item.nit,
                tipoCuenta: item.tipoCuenta,
                numeroCuenta: item.numeroCuenta,
                nombre: item.nombre,
                valor: item.valor,
                fecha: item.fecha
            });
        });

        // Formatear columna de valor como moneda
        const firstDataRow = headerRow.number + 1;
        const lastDataRow = firstDataRow + datosExportar.length - 1;
        
        for (let r = firstDataRow; r <= lastDataRow; r++) {
            // Formato moneda para columna H (Valor Castigado) - AHORA ES COLUMNA 8
            worksheet.getCell(`H${r}`).numFmt = '"$"#,##0';
            worksheet.getCell(`H${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
            
            // Centrar columnas F (Número de Cuenta) y I (Fecha)
            worksheet.getCell(`F${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getCell(`I${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
            

        }

        // Calcular total y añadir fila de total
        const totalValor = datosExportar.reduce((acc, it) => acc + it.valor, 0);
        worksheet.addRow([]);
        
        const totalRow = worksheet.addRow({ 
            agencia: 'TOTAL', 
            valor: totalValor 
        });
        
        const totalRowNumber = totalRow.number;

        // Colores y estilos para TOTAL
        const fondoTotal = 'FFFABF8F';

        // Estilo para toda la fila del total (AHORA 9 COLUMNAS)
        for (let col = 1; col <= 9; col++) {
            const cell = worksheet.getCell(totalRowNumber, col);
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: fondoTotal } 
            };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            
            if (col === 1) { // Celda "TOTAL"
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
            } else if (col === 8) { // Celda de valor (columna H)
                cell.numFmt = '"$"#,##0';
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            } else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
        }

        // --- RESUMEN ESTADÍSTICO ---
        const filaInicioResumen = totalRowNumber + 2;
        let currentRow = filaInicioResumen;
        const colInicioResumen = 1; // Columna A
        const colFinResumen = 2;    // Columna B

        // Título del resumen
        worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
        const resumenTitleCell = worksheet.getCell(`A${currentRow}`);
        resumenTitleCell.value = 'RESUMEN ESTADÍSTICO';
        resumenTitleCell.font = { bold: true, size: 12 };
        resumenTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        resumenTitleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F3FF' }
        };

        // 🔒 Bordes del título (CIERRE SUPERIOR)
        for (let col = colInicioResumen; col <= colFinResumen; col++) {
            worksheet.getCell(currentRow, col).border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }

        currentRow++;

        // Datos del resumen
        const resumenData = [
            ['Total registros:', datosExportar.length.toString()],
            ['Total valor castigado:', `$${totalValor.toLocaleString('es-CO')}`],
            ['Promedio por cuenta:', `$${Math.round(totalValor / datosExportar.length).toLocaleString('es-CO')}`],
            ['Agencia:', `${agenciaCodigo} - ${agenciaNombre}`],
            ['Fecha de corte:', fechaCorte]
        ];

        // Filas del resumen
        resumenData.forEach(([label, value]) => {
            const row = worksheet.getRow(currentRow);

            row.getCell(1).value = label;
            row.getCell(2).value = value;

            row.getCell(1).font = { bold: true };
            row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

            // Bordes UNIFORMES
            for (let col = colInicioResumen; col <= colFinResumen; col++) {
                row.getCell(col).border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            }

            currentRow++;
        });

        // --- RESUMEN POR TIPO DE RECAUDACIÓN (DDEP93) ---
        const filaInicioRecaudacion = totalRowNumber + 2;
        let currentRowRecaudacion = filaInicioRecaudacion;

        // Agrupar por tipo de recaudación
        const resumenRecaudacion: Record<string, { cantidad: number; suma: number }> = {};

        detalles.forEach(item => {
            const categoria = determinarCategoriaRecaudacion(Number(item.DEPE93));

            if (!resumenRecaudacion[categoria]) {
                resumenRecaudacion[categoria] = { cantidad: 0, suma: 0 };
            }

            resumenRecaudacion[categoria].cantidad += 1;
            resumenRecaudacion[categoria].suma += Number(item.SALDO_TOTAL) || 0;
        });


        // Posicionar al lado del resumen estadístico
        const colInicioRecaudacion = 5; // Columna E
        
        // Título del resumen por recaudación
        worksheet.mergeCells(`${String.fromCharCode(64 + colInicioRecaudacion)}${currentRowRecaudacion}:${String.fromCharCode(64 + colInicioRecaudacion + 2)}${currentRowRecaudacion}`);
        const recaudacionTitleCell = worksheet.getCell(`${String.fromCharCode(64 + colInicioRecaudacion)}${currentRowRecaudacion}`);
        recaudacionTitleCell.value = 'RESUMEN POR TIPO DE RECAUDACIÓN';
        recaudacionTitleCell.font = { bold: true, size: 12 };
        recaudacionTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        recaudacionTitleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F3FF' }
        };

        currentRowRecaudacion++;

        // Encabezado de la tabla de recaudación
        const recaudacionHeader = worksheet.getRow(currentRowRecaudacion);
        recaudacionHeader.getCell(colInicioRecaudacion).value = 'Tipo de Recaudación';
        recaudacionHeader.getCell(colInicioRecaudacion + 1).value = 'Cuentas';
        recaudacionHeader.getCell(colInicioRecaudacion + 2).value = 'Valor';

        // Estilos del encabezado
        const headerRecaudacionBg = 'FF305496';
        for (let col = colInicioRecaudacion; col <= colInicioRecaudacion + 2; col++) {
            const cell = recaudacionHeader.getCell(col);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: headerRecaudacionBg } 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }

        currentRowRecaudacion++;

        // Filas de datos de recaudación
        Object.entries(resumenRecaudacion).forEach(([tipo, data]) => {
            const row = worksheet.getRow(currentRowRecaudacion);
            
            row.getCell(colInicioRecaudacion).value = tipo;
            row.getCell(colInicioRecaudacion + 1).value = data.cantidad;
            row.getCell(colInicioRecaudacion + 2).value = data.suma;

            // Estilos
            row.getCell(colInicioRecaudacion).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(colInicioRecaudacion + 1).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(colInicioRecaudacion + 2).numFmt = '"$"#,##0';
            row.getCell(colInicioRecaudacion + 2).alignment = { horizontal: 'right', vertical: 'middle' };

            // Bordes
            for (let col = colInicioRecaudacion; col <= colInicioRecaudacion + 2; col++) {
                row.getCell(col).border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            }

            currentRowRecaudacion++;
        });

        // Ajustar altura de filas de título
        worksheet.getRow(1).height = 24;
        worksheet.getRow(2).height = 20;

        // Descargar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Detalle_Agencia_${agenciaCodigo}_${agenciaNombre.replace(/[^a-z0-9]/gi, '_')}_${fechaFormateada}.xlsx`;
        saveAs(new Blob([buffer]), filename);

        return true;

    } catch (error) {
        console.error('Error generando Excel de detalle:', error);
        throw new Error('Ocurrió un error al generar el archivo Excel');
    }
};

// Función auxiliar para obtener nombre de filtro (solo si aplica)
const obtenerNombreRecaudacion = (codigo?: string): string => {
    if (!codigo) return '';
    
    const filtros: Record<string, string> = {
        'LEY_INSOLVENCIA': 'Ley Insolvencia',
        'SALDO_MINIMO': 'Saldo menor a Salario Mínimo',
        'SIN_MEDIDA_CAUTELAR': 'Sin Medida Cautelar',
        'CARTERA_PROBLEMA': 'CC - Problema',
        'EMBARGO_BIENES': 'CC - Embargo Bien Mueble/Inmueble',
        'EMBARGO_SECUESTRADO': 'CC - Embargo Bien Secuestrado',
        'CC_REMATE': 'CC - Remate',
        'SIN_AMNISTIA': 'CC - Sin Amnistía'
    };
    return filtros[codigo] || codigo;
};