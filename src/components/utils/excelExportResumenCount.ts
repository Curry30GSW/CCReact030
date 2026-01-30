import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Interfaces para los datos
export interface CastigoAsociadoExport {
  CODIGO_AGENCIA: string;
  NOMBRE_AGENCIA: string;
  TOTAL_CUENTAS: number;
  TOTAL_DEUDA: number;
  [key: string]: string | number;
}

export interface TotalesPorZona {
  norte: { cuentas: number; valor: number };
  centro: { cuentas: number; valor: number };
  sur: { cuentas: number; valor: number };
  total: { cuentas: number; valor: number };
}

export interface FiltrosExport {
  filtroRecaudacion?: string;
  aniosSeleccionados?: string[];
}

const ZONAS_LABELS = {
  NORTE: 'JURÍDICO ZONA NORTE',
  CENTRO: 'JURÍDICO ZONA CENTRO',
  SUR: 'JURÍDICO ZONA SUR',
  SIN: 'SIN ZONA ASIGNADA'
};



// Configuración para las zonas
const ZONAS_CONFIG = {
  norte: [87, 86, 85, 81, 84, 88, 98, 97, 82],
  centro: [48, 80, 89, 94, 83, 13, 68, 73, 76, 90, 91, 92, 96, 93, 95],
  sur: [77, 49, 70, 42, 46, 45, 47, 78, 74, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 29]
};

// Determinar zona jurídica de una agencia
const determinarZonaJuridica = (codigoAgencia: string): string => {
  const codigo = parseInt(codigoAgencia);

  if (ZONAS_CONFIG.norte.includes(codigo)) {
    return ZONAS_LABELS.NORTE;
  }
  if (ZONAS_CONFIG.centro.includes(codigo)) {
    return ZONAS_LABELS.CENTRO;
  }
  if (ZONAS_CONFIG.sur.includes(codigo)) {
    return ZONAS_LABELS.SUR;
  }
  return ZONAS_LABELS.SIN;
};


// Formatear fecha de corte
const formatearFechaCorte = (): string => {
  const fecha = new Date();
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  
  return `${dia} de ${mes} de ${año} ${hora}:${minutos}`;
};

// Formatear fecha actual para nombre de archivo
const formatearFechaNombreArchivo = (): string => {
  const fecha = new Date();
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  
  return `${dia}_${mes}_${año}_${hora}${minutos}`;
};

// Obtener texto del filtro de recaudación
const obtenerTextoFiltroRecaudacion = (filtro: string): string => {
  const filtrosMap: Record<string, string> = {
    'LEY_INSOLVENCIA': 'Ley Insolvencia',
    'SALDO_MINIMO': 'Saldo menor a Salario Mínimo',
    'SIN_MEDIDA_CAUTELAR': 'Sin Medida Cautelar',
    'CARTERA_PROBLEMA': 'CC - Problema',
    'EMBARGO_BIENES': 'CC - Embargo Bien Mueble/Inmueble',
    'EMBARGO_SECUESTRADO': 'CC - Embargo Bien Secuestrado',
    'CC_REMATE': 'CC - Remate',
    'SIN_AMNISTIA': 'CC - Sin Amnistía'
  };
  
  return filtrosMap[filtro] || filtro;
};

// Crear hoja de agencias
const crearHojaAgencias = (worksheet: ExcelJS.Worksheet, datos: CastigoAsociadoExport[]) => {
  // Título
  worksheet.mergeCells('A1:D1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'RESUMEN DE AGENCIAS - CARTERA CASTIGADA';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF1A3A2F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Fecha de corte
  worksheet.mergeCells('A2:D2');
  const fechaCell = worksheet.getCell('A2');
  fechaCell.value = `Corte: ${formatearFechaCorte()}`;
  fechaCell.font = { bold: true, size: 12, color: { argb: 'FF005E56' } };
  fechaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Espacio
  worksheet.addRow([]);
  
  // Encabezados
  const headers = ['Agencia', 'Nombre Agencia', 'Total Cuentas', 'Valor Total ($)'];
  const headerRow = worksheet.addRow(headers);
  
  // Estilo encabezados
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF005E56' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });
  
  // Datos
  datos.forEach(item => {
    const row = worksheet.addRow([
      item.CODIGO_AGENCIA,
      item.NOMBRE_AGENCIA,
      Number(item.TOTAL_CUENTAS),
      Number(item.TOTAL_DEUDA)
    ]);
    
    // Formatear números
    const cuentasCell = row.getCell(3);
    cuentasCell.numFmt = '#,##0';
    cuentasCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    const valorCell = row.getCell(4);
    valorCell.numFmt = '"$"#,##0';
    valorCell.alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Bordes
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });
  
  // Totales
  const totalCuentas = datos.reduce((sum, item) => sum + Number(item.TOTAL_CUENTAS), 0);
  const totalDeuda = datos.reduce((sum, item) => sum + Number(item.TOTAL_DEUDA), 0);
  
  const totalRow = worksheet.addRow(['TOTAL GENERAL', '', totalCuentas, totalDeuda]);
  
  // Estilo fila total
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFABF8F' }
    };
    
    if (colNumber === 3) {
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else if (colNumber === 4) {
      cell.numFmt = '"$"#,##0';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });
  
  // Ajustar anchos de columna
  worksheet.columns = [
    { key: 'agencia', width: 12 },
    { key: 'nombre', width: 35 },
    { key: 'cuentas', width: 15 },
    { key: 'valor', width: 20 }
  ];
};

// Crear hoja de zonas
const crearHojaZonas = (worksheet: ExcelJS.Worksheet, datos: CastigoAsociadoExport[], totales: TotalesPorZona) => {
  // Título
  worksheet.mergeCells('A1:C1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'RESUMEN POR ZONAS JURÍDICAS';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF1A3A2F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Fecha
  worksheet.mergeCells('A2:C2');
  const fechaCell = worksheet.getCell('A2');
  fechaCell.value = `Corte: ${formatearFechaCorte()}`;
  fechaCell.font = { bold: true, size: 12, color: { argb: 'FF005E56' } };
  fechaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Espacio
  worksheet.addRow([]);
  
  // Encabezados
  const headers = ['Zona Jurídica', 'Total Cuentas', 'Valor Total ($)'];
  const headerRow = worksheet.addRow(headers);
  
  // Estilo encabezados
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF005E56' }
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });
  
  // Datos de zonas
const zonasData = [
  [ZONAS_LABELS.NORTE, totales.norte.cuentas, totales.norte.valor],
  [ZONAS_LABELS.CENTRO, totales.centro.cuentas, totales.centro.valor],
  [ZONAS_LABELS.SUR, totales.sur.cuentas, totales.sur.valor]
];

  
  zonasData.forEach(zona => {
    const row = worksheet.addRow(zona);
    
    // Formatear números
    const cuentasCell = row.getCell(2);
    cuentasCell.numFmt = '#,##0';
    cuentasCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    const valorCell = row.getCell(3);
    valorCell.numFmt = '"$"#,##0';
    valorCell.alignment = { horizontal: 'right', vertical: 'middle' };
    
    // Bordes
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      };
    });
  });
  
  // Total general
  const totalRow = worksheet.addRow(['TOTAL GENERAL', totales.total.cuentas, totales.total.valor]);
  
  // Estilo fila total
  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FF000000' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };
    
    if (colNumber === 2) {
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else if (colNumber === 3) {
      cell.numFmt = '"$"#,##0';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    }
    
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });
  
  // Ajustar anchos de columna
  worksheet.columns = [
    { key: 'zona', width: 25 },
    { key: 'cuentas', width: 15 },
    { key: 'valor', width: 20 }
  ];
  
  // Agregar hoja de detalle por agencia por zona
  worksheet.addRow([]);
  
  // Agrupar agencias por zona
  const agenciasPorZona = datos.reduce((acc, item) => {
    const zona = determinarZonaJuridica(item.CODIGO_AGENCIA);
    if (!acc[zona]) acc[zona] = [];
    acc[zona].push(item);
    return acc;
  }, {} as Record<string, CastigoAsociadoExport[]>);
  
  // Agregar detalle por zona
  Object.entries(agenciasPorZona).forEach(([zona, agencias]) => {
    worksheet.addRow([]);
    
    // Subtítulo de zona
    const subtituloRow = worksheet.addRow([zona]);
    worksheet.mergeCells(`A${subtituloRow.number}:C${subtituloRow.number}`);
    const subtituloCell = worksheet.getCell(`A${subtituloRow.number}`);
    subtituloCell.font = { bold: true, size: 14, color: { argb: 'FF005E56' } };
    subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Encabezados detalle
    const detalleHeaders = ['Agencia', 'Nombre', 'Cuentas', 'Valor'];
    const detalleHeaderRow = worksheet.addRow(detalleHeaders);
    
    // Estilo encabezados detalle
    detalleHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF808080' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    
    // Datos detalle
    agencias.forEach(agencia => {
      const detalleRow = worksheet.addRow([
        agencia.CODIGO_AGENCIA,
        agencia.NOMBRE_AGENCIA,
        Number(agencia.TOTAL_CUENTAS),
        Number(agencia.TOTAL_DEUDA)
      ]);
      
      // Formatear números
      const cuentasCell = detalleRow.getCell(3);
      cuentasCell.numFmt = '#,##0';
      cuentasCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      const valorCell = detalleRow.getCell(4);
      valorCell.numFmt = '"$"#,##0';
      valorCell.alignment = { horizontal: 'right', vertical: 'middle' };
    });
    
    // Total por zona
    const totalCuentasZona = agencias.reduce((sum, a) => sum + Number(a.TOTAL_CUENTAS), 0);
    const totalValorZona = agencias.reduce((sum, a) => sum + Number(a.TOTAL_DEUDA), 0);
    
    const totalZonaRow = worksheet.addRow(['', `Total ${zona}:`, totalCuentasZona, totalValorZona]);
    
    // Estilo total zona
    const totalZonaCell = totalZonaRow.getCell(2);
    totalZonaCell.font = { bold: true };
    
    const totalCuentasCell = totalZonaRow.getCell(3);
    totalCuentasCell.numFmt = '#,##0';
    totalCuentasCell.font = { bold: true };
    totalCuentasCell.alignment = { horizontal: 'center', vertical: 'middle' };
    
    const totalValorCell = totalZonaRow.getCell(4);
    totalValorCell.numFmt = '"$"#,##0';
    totalValorCell.font = { bold: true };
    totalValorCell.alignment = { horizontal: 'right', vertical: 'middle' };
  });
};

// Crear hoja de filtros aplicados
const crearHojaFiltros = (worksheet: ExcelJS.Worksheet, filtros: FiltrosExport, totalRegistros: number) => {
  // Título
  worksheet.mergeCells('A1:B1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'INFORMACIÓN DE EXPORTACIÓN';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF1A3A2F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Fecha
  worksheet.mergeCells('A2:B2');
  const fechaCell = worksheet.getCell('A2');
  fechaCell.value = `Generado: ${new Date().toLocaleString('es-CO')}`;
  fechaCell.font = { bold: true, size: 11, color: { argb: 'FF005E56' } };
  fechaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Espacio
  worksheet.addRow([]);
  
  // Información de exportación
  const infoData = [
    ['Total de registros exportados:', totalRegistros],
    ['Fecha de corte:', formatearFechaCorte()],
    ['Estado:', 'Sistema Activo']
  ];
  
  infoData.forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
  });
  
  worksheet.addRow([]);
  
  // Filtros aplicados
  if (filtros.filtroRecaudacion || (filtros.aniosSeleccionados && filtros.aniosSeleccionados.length > 0)) {
    const filtrosTitleRow = worksheet.addRow(['FILTROS APLICADOS:', '']);
    filtrosTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF005E56' } };
    worksheet.mergeCells(`A${filtrosTitleRow.number}:B${filtrosTitleRow.number}`);
    
    const filtrosData: [string, string][] = [];
    
    if (filtros.filtroRecaudacion) {
      filtrosData.push(['Filtro de recaudación:', obtenerTextoFiltroRecaudacion(filtros.filtroRecaudacion)]);
    }
    
    if (filtros.aniosSeleccionados && filtros.aniosSeleccionados.length > 0) {
      filtrosData.push(['Años seleccionados:', filtros.aniosSeleccionados.join(', ')]);
    }
    
    filtrosData.forEach(([label, value]) => {
      const row = worksheet.addRow([label, value]);
      row.getCell(1).font = { bold: true };
    });
  }
  
  // Ajustar anchos
  worksheet.columns = [
    { key: 'label', width: 30 },
    { key: 'value', width: 40 }
  ];
};

// Función principal de exportación
export const exportarResumenAExcel = async (
  datos: CastigoAsociadoExport[],
  filtros: FiltrosExport
): Promise<boolean> => {
  try {
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Jurídico COOPSERP';
    workbook.created = new Date();
    
    // Calcular totales por zona
    const calcularTotalesPorZona = (): TotalesPorZona => {
      const totales = {
        norte: { cuentas: 0, valor: 0 },
        centro: { cuentas: 0, valor: 0 },
        sur: { cuentas: 0, valor: 0 },
        total: { cuentas: 0, valor: 0 }
      };

      datos.forEach((item) => {
        const zona = determinarZonaJuridica(item.CODIGO_AGENCIA);
        const cuentas = Number(item.TOTAL_CUENTAS);
        const valor = Number(item.TOTAL_DEUDA);

        switch (zona) {
            case ZONAS_LABELS.NORTE:
                totales.norte.cuentas += cuentas;
                totales.norte.valor += valor;
                break;

            case ZONAS_LABELS.CENTRO:
                totales.centro.cuentas += cuentas;
                totales.centro.valor += valor;
                break;

            case ZONAS_LABELS.SUR:
                totales.sur.cuentas += cuentas;
                totales.sur.valor += valor;
                break;
            }


        totales.total.cuentas += cuentas;
        totales.total.valor += valor;
      });

      return totales;
    };

    const totales = calcularTotalesPorZona();
    
    // Crear hojas
    crearHojaAgencias(workbook.addWorksheet('Agencias'), datos);
    crearHojaZonas(workbook.addWorksheet('Zonas Jurídicas'), datos, totales);
    crearHojaFiltros(workbook.addWorksheet('Información'), filtros, datos.length);
    
    // Generar buffer y descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const nombreArchivo = `Resumen_Cartera_Castigada_${formatearFechaNombreArchivo()}.xlsx`;
    
    saveAs(
      new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      }),
      nombreArchivo
    );
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('No se pudo generar el archivo Excel. Por favor, intente nuevamente.');
  }
};

// Función simplificada para uso en componentes
export const handleExportarExcel = async (
  datos: CastigoAsociadoExport[],
  filtros: FiltrosExport
): Promise<void> => {
  try {
    // Mostrar loader (opcional)
    const loader = document.createElement('div');
    loader.innerHTML = '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:8px;">Generando Excel...</div>';
    document.body.appendChild(loader);
    
    await exportarResumenAExcel(datos, filtros);
    
    // Remover loader
    document.body.removeChild(loader);
    
    
  } catch (error: unknown) {
    console.error('Error en exportación:', error);
    
  }
};