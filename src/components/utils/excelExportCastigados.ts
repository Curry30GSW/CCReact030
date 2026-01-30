import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface ExcelExportItem {
    agencia: string;
    recaudacion: string;
    zonaJuridica: string;
    nit: string;
    tipoCuenta: string;
    numeroCuenta: string;
    nombre: string;
    score: string;
    valor: number;
    fecha: string;
    agenciaCodigo?: number;
    depe93?: number;
}


// Función para determinar zona jurídica
export const determinarZonaJuridica = (agencia: number) => {
    const agenciaNum = parseInt(agencia.toString());
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

const obtenerNombreRecaudacion = (codigo: string): string => {
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

const determinarCategoriaRecaudacion = (depe93: number): string => {
    switch (depe93) {
        case 59:
            return 'Ley Insolvencia';
        case 0:
            return 'CC - Irrecuperable';
        case 46:
            return 'Saldo menor a Salario Mínimo';
        case 51:
        case 52:
        case 53:
        case 54:
            return 'Sin Medida Cautelar';
        case 55:
            return 'CC - Ejecutivo con Descuento';
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


export const exportarAExcel = async (
    datos: ExcelExportItem[], 
    titulo: string,
    filtroRecaudacion?: string,
    aniosSeleccionados?: string[]
) => {
    try {
        // 1. Primero, asegurarnos que cada dato tenga la zona jurídica correcta
        const datosConZonaJuridica = datos.map(item => {
            // Extraer el código de agencia del string "48 - BOSA"
            const agenciaMatch = item.agencia.match(/^(\d+)/);
            const codigoAgencia = agenciaMatch ? parseInt(agenciaMatch[1]) : 0;
            
            // Determinar la zona jurídica basada en el código
            const zonaJuridica = determinarZonaJuridica(codigoAgencia);
            
            return {
                ...item,
                zonaJuridica: item.zonaJuridica || zonaJuridica, // Usar la existente o calcular
                agenciaCodigo: codigoAgencia
            };
        });

        // 2. Ordenar datos por el código AAUX93
        const datosOrdenados = datosConZonaJuridica.slice().sort((a, b) => 
            (a.agenciaCodigo || 0) - (b.agenciaCodigo || 0)
        );

        // Crear workbook con ExcelJS
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Asociados Castigados', { 
            properties: { defaultRowHeight: 18 } 
        });

        // Fecha actual
        const now = new Date();
        const fechaFormateada = now.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '_');

        // --- FILA 1: TITULO
          worksheet.mergeCells('A1:J1');
        const titleCell = worksheet.getCell('A1');
        const fechaCorte = formatearFechaCorte(now);
        titleCell.value = `Asociados Castigados Corte ${fechaCorte}`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };


        // --- FILA 2: FECHA
        worksheet.mergeCells('A2:J2');
        const dateCell = worksheet.getCell('A2');
        const opcionesFecha = { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        } as const;
        const fechaStr = now.toLocaleDateString('es-ES', opcionesFecha).replace(/\./g, '');
        const horaStr = now.toLocaleTimeString('es-ES', { hour12: true });
        dateCell.value = `Fecha de generación: ${fechaStr} ${horaStr}`;
        dateCell.font = { bold: true, size: 11 };
        dateCell.alignment = { horizontal: 'center', vertical: 'middle' };

        // --- FILA 3: FILTROS APLICADOS (si existen)
        let filaFiltros = 3;
        
        if (filtroRecaudacion || (aniosSeleccionados && aniosSeleccionados.length > 0)) {
            let textoFiltros = 'Filtros aplicados: ';
            const filtros = [];
            
            if (filtroRecaudacion) {
                const nombreFiltro = obtenerNombreRecaudacion(filtroRecaudacion);
                filtros.push(`Recaudación: ${nombreFiltro}`);
            }
            
            if (aniosSeleccionados && aniosSeleccionados.length > 0) {
                const aniosTexto = aniosSeleccionados.join(', ');
                filtros.push(`Años: ${aniosTexto}`);
            }
            
            textoFiltros += filtros.join(' | ');
            
            worksheet.mergeCells(`A${filaFiltros}:J${filaFiltros}`);
            const filtrosCell = worksheet.getCell(`A${filaFiltros}`);
            filtrosCell.value = textoFiltros;
            filtrosCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
            filtrosCell.alignment = { horizontal: 'center', vertical: 'middle' };
            filaFiltros++;
        }


        worksheet.addRow([]);

        const headers = [
            'Agencia',
            'Recaudación',
            'Zona Jurídica',
            'Cédula',
            'Asociado',
            'Cuenta',
            'Nomina',
            'Score',
            'Valor Castigado',
            'Fecha Castigo'
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Configurar anchos de columna
        worksheet.columns = [
            { key: 'agencia', width: 30 },
            { key: 'recaudacion', width: 25 },
            { key: 'zona', width: 30 },
            { key: 'nit', width: 18 },
            { key: 'tipoCuenta', width: 15 },
            { key: 'numeroCuenta', width: 18 },
            { key: 'nombre', width: 32 },
            { key: 'score', width: 10 },
            { key: 'valor', width: 18 },
            { key: 'fecha', width: 16 }
        ];

        // Agregar los datos
        datosOrdenados.forEach(item => {
            const valorNum = Number(item.valor) || 0;
            worksheet.addRow({
                agencia: item.agencia,
                recaudacion: item.recaudacion,
                zona: item.zonaJuridica,
                nit: item.nit,
                tipoCuenta: item.tipoCuenta,
                numeroCuenta: item.numeroCuenta,
                nombre: item.nombre,
                score: item.score || '',
                valor: valorNum,
                fecha: item.fecha
            });
        });

        // Formatear columna I (valor) como moneda
        const firstDataRow = headerRow.number + 1;
        const lastDataRow = firstDataRow + datosOrdenados.length - 1;
        
        for (let r = firstDataRow; r <= lastDataRow; r++) {
            // Formato moneda para columna I (índice 9)
            worksheet.getCell(`I${r}`).numFmt = '"$"#,##0';
            worksheet.getCell(`I${r}`).alignment = { horizontal: 'right', vertical: 'middle' };

            // Centrar columnas F (numeroCuenta) y H (score)
            worksheet.getCell(`F${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getCell(`H${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
        }

      // Calcular total y añadir fila vacía + total
        const totalValor = datosOrdenados.reduce(
            (acc, it) => acc + (Number(it.valor) || 0),
            0
        );

        worksheet.addRow([]);

        const totalRow = worksheet.addRow({ 
            agencia: 'TOTAL', 
            valor: totalValor 
        });

        const totalRowNumber = totalRow.number;
        const fondoTotal = 'FFFABF8F';

        // Estilo para TODA la fila del total (10 columnas)
        for (let col = 1; col <= 10; col++) {
            const cell = worksheet.getCell(totalRowNumber, col);

            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: fondoTotal } 
            };

            cell.font = { bold: true, color: { argb: 'FF000000' } };

            if (col === 1) {
                // Columna "TOTAL"
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
            } 
            else if (col === 9) {
                // Columna Valor Castigado (I)
                cell.numFmt = '"$"#,##0';
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            } 
            else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
        }


        // --- RESUMEN POR AGENCIA ---
        const filaInicioResumen = totalRowNumber + 2;
        let currentRow = filaInicioResumen;

        // Encabezado del resumen
        const resumenHeader = worksheet.getRow(currentRow);
        resumenHeader.getCell(1).value = 'Agencia';
        resumenHeader.getCell(2).value = 'Cuentas';
        resumenHeader.getCell(3).value = 'Valor castigado';

        const headerBg = 'FF305496';
        for (let col = 1; col <= 3; col++) {
            const cell = resumenHeader.getCell(col);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: headerBg } 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }

        // Agrupar datos por agencia
        const resumenAgencia: Record<string, { cantidad: number, suma: number }> = {};
        datosOrdenados.forEach(it => {
            const ag = it.agencia || 'SIN AGENCIA';
            if (!resumenAgencia[ag]) {
                resumenAgencia[ag] = { cantidad: 0, suma: 0 };
            }
            resumenAgencia[ag].cantidad += 1;
            resumenAgencia[ag].suma += Number(it.valor) || 0;
        });

        // Escribir filas de resumen
        let totalCuentas = 0;
        let totalSuma = 0;
        currentRow++;

        Object.entries(resumenAgencia).forEach(([agencia, data]) => {
            const row = worksheet.getRow(currentRow);
            
            row.getCell(1).value = agencia;
            row.getCell(2).value = data.cantidad;
            row.getCell(3).value = data.suma;

            totalCuentas += data.cantidad;
            totalSuma += data.suma;

            // Estilos
            row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(3).numFmt = '"$"#,##0';
            row.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };

            // Bordes
            for (let col = 1; col <= 3; col++) {
                row.getCell(col).border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            }

            currentRow++;
        });

        // Fila TOTAL del resumen de agencias
        const totalResumenRow = worksheet.getRow(currentRow);
        totalResumenRow.getCell(1).value = 'TOTAL';
        totalResumenRow.getCell(2).value = totalCuentas;
        totalResumenRow.getCell(3).value = totalSuma;

        const fondoTotalResumen = 'FFFABF8F';

        // Estilos para TOTAL del resumen de agencias
        for (let col = 1; col <= 3; col++) {
            const cell = totalResumenRow.getCell(col);
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: fondoTotalResumen } 
            };
            cell.alignment = { 
                horizontal: col === 1 ? 'left' : (col === 2 ? 'center' : 'right'), 
                vertical: 'middle' 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }
        totalResumenRow.getCell(3).numFmt = '"$"#,##0';

        // --- RESUMEN POR ZONA JURÍDICA (al lado del resumen de agencias) ---
        // Posición: misma fila del encabezado pero columna 5
        const filaInicioZonas = filaInicioResumen;
        let currentRowZonas = filaInicioZonas;

        // Encabezado del resumen de zonas
        const resumenZonaHeader = worksheet.getRow(currentRowZonas);
        resumenZonaHeader.getCell(5).value = 'Zona Jurídica';
        resumenZonaHeader.getCell(6).value = 'Cuentas';
        resumenZonaHeader.getCell(7).value = 'Valor castigado';

        // Estilos encabezado zonas
        const headerZonaBg = 'FF305496';
        for (let col = 5; col <= 7; col++) {
            const cell = resumenZonaHeader.getCell(col);
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: headerZonaBg } 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }

        // Agrupar datos por zonaJuridica
        const resumenZona: Record<string, { cantidad: number, suma: number }> = {};
        datosOrdenados.forEach(it => {
            const zona = it.zonaJuridica || 'No determinada';
            if (!resumenZona[zona]) {
                resumenZona[zona] = { cantidad: 0, suma: 0 };
            }
            resumenZona[zona].cantidad += 1;
            resumenZona[zona].suma += Number(it.valor) || 0;
        });

        // Escribir filas de resumen de zonas
        let totalCuentasZona = 0;
        let totalSumaZona = 0;
        currentRowZonas++;

        Object.entries(resumenZona).forEach(([zona, data]) => {
            const row = worksheet.getRow(currentRowZonas);
            
            row.getCell(5).value = zona;
            row.getCell(6).value = data.cantidad;
            row.getCell(7).value = data.suma;

            totalCuentasZona += data.cantidad;
            totalSumaZona += data.suma;

            // Estilos para filas de zona
            row.getCell(5).alignment = { horizontal: 'left', vertical: 'middle' };
            row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(7).numFmt = '"$"#,##0';
            row.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

            // Bordes para celdas de zona
            for (let col = 5; col <= 7; col++) {
                row.getCell(col).border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            }

            currentRowZonas++;
        });

        // Fila TOTAL del resumen de zonas
        const totalResumenZonaRow = worksheet.getRow(currentRowZonas);
        totalResumenZonaRow.getCell(5).value = 'TOTAL';
        totalResumenZonaRow.getCell(6).value = totalCuentasZona;
        totalResumenZonaRow.getCell(7).value = totalSumaZona;

        const fondoTotalZona = 'FFFABF8F';

        // Estilos para TOTAL del resumen de zonas
        for (let col = 5; col <= 7; col++) {
            const cell = totalResumenZonaRow.getCell(col);
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: fondoTotalZona } 
            };
            cell.alignment = { 
                horizontal: col === 5 ? 'left' : (col === 6 ? 'center' : 'right'), 
                vertical: 'middle' 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }
        totalResumenZonaRow.getCell(7).numFmt = '"$"#,##0';

        // Asegurarnos que ambas tablas de resumen tengan la misma altura
        const maxRows = Math.max(currentRow, currentRowZonas);
        for (let r = filaInicioResumen + 1; r <= maxRows; r++) {
            // Para agencias
            if (r <= currentRow) {
                const row = worksheet.getRow(r);
                for (let col = 1; col <= 3; col++) {
                    if (!row.getCell(col).value && r > filaInicioResumen) {
                        row.getCell(col).border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        };
                    }
                }
            }
            
            // Para zonas
            if (r <= currentRowZonas) {
                const row = worksheet.getRow(r);
                for (let col = 5; col <= 7; col++) {
                    if (!row.getCell(col).value && r > filaInicioResumen) {
                        row.getCell(col).border = {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        };
                    }
                }
            }
        }

        // Ajustar altura de títulos
        worksheet.getRow(1).height = 24;
        worksheet.getRow(2).height = 20;


        // --- RESUMEN POR TIPO DE RECAUDACIÓN (debajo del resumen de zonas) ---
        const filaInicioRecaudacion = Math.max(currentRowZonas) + 2;
        let currentRowRecaudacion = filaInicioRecaudacion;

        // Agrupar por tipo de recaudación
        const resumenRecaudacion: Record<string, { cantidad: number; suma: number }> = {};

        datosOrdenados.forEach(item => {
            const depe93 = item.depe93 || 0;
            const categoria = determinarCategoriaRecaudacion(depe93);

            if (!resumenRecaudacion[categoria]) {
                resumenRecaudacion[categoria] = { cantidad: 0, suma: 0 };
            }

            resumenRecaudacion[categoria].cantidad += 1;
            resumenRecaudacion[categoria].suma += Number(item.valor) || 0;
        });

        // Posicionar debajo de las otras tablas (columna A)
        const colInicioRecaudacion = 5;
                
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

        // Ordenar las categorías
        const categoriasOrdenadas = [
            'Ley Insolvencia',
            'Saldo menor a Salario Mínimo',
            'Sin Medida Cautelar',
            'CC - Problema',
            'CC - Embargo Bien Mueble/Inmueble',
            'CC - Embargo Bien Secuestrado',
            'CC - Remate',
            'CC - Sin Amnistía',
            'CC - Irrecuperable',
            'CC - Ejecutivo con Descuento',
            'Otros'
        ];

        // Filas de datos de recaudación
        categoriasOrdenadas.forEach(categoria => {
            const data = resumenRecaudacion[categoria];
            if (!data) return;
            
            const row = worksheet.getRow(currentRowRecaudacion);
            
            row.getCell(colInicioRecaudacion).value = categoria;
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

        // Fila TOTAL del resumen de recaudación
        const totalRecaudacionRow = worksheet.getRow(currentRowRecaudacion);
        const totalCuentasRecaudacion = Object.values(resumenRecaudacion).reduce((sum, item) => sum + item.cantidad, 0);
        const totalSumaRecaudacion = Object.values(resumenRecaudacion).reduce((sum, item) => sum + item.suma, 0);

        totalRecaudacionRow.getCell(colInicioRecaudacion).value = 'TOTAL';
        totalRecaudacionRow.getCell(colInicioRecaudacion + 1).value = totalCuentasRecaudacion;
        totalRecaudacionRow.getCell(colInicioRecaudacion + 2).value = totalSumaRecaudacion;

        const fondoTotalRecaudacion = 'FFFABF8F';

        // Estilos para TOTAL del resumen de recaudación
        for (let col = colInicioRecaudacion; col <= colInicioRecaudacion + 2; col++) {
            const cell = totalRecaudacionRow.getCell(col);
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: fondoTotalRecaudacion } 
            };
            cell.alignment = { 
                horizontal: col === colInicioRecaudacion ? 'left' : 
                        (col === colInicioRecaudacion + 1 ? 'center' : 'right'), 
                vertical: 'middle' 
            };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };
        }
        totalRecaudacionRow.getCell(colInicioRecaudacion + 2).numFmt = '"$"#,##0';


        // Descargar archivo
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Asociados_Castigados_${titulo}_${fechaFormateada}.xlsx`;
        saveAs(new Blob([buffer]), filename);

    } catch (error) {
        console.error('Error generando Excel:', error);
        throw new Error('Ocurrió un error al generar el archivo Excel');
    }
};
