import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Swal from 'sweetalert2';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { fetchAndBearer } from "../../../components/api/FetchAndBearer";
import FiltrosResumen from '../../filtros/FiltrosResumen';
import { CastigoAsociado, AnioFiltro, FiltrosResumenState } from '../../../types/resumen';
import ModalDetalleResumen from '../../modals/ModalDetalleResumen';
import { handleExportarExcel, FiltrosExport } from '../../utils/excelExportResumenCount';
import { Castigado } from '../../../types/castigados';
import { motion, AnimatePresence } from 'framer-motion';


const ITEMS_PER_PAGE = 7; // Valor inicial

const fadeSlide = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};


const TablaResumenCastigos: React.FC = () => {
    const [asociados, setAsociados] = useState<CastigoAsociado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<string | null>(null);

    // Filtros
    const [filtros, setFiltros] = useState<FiltrosResumenState>({
        filtroRecaudacion: '',
        aniosSeleccionados: []
    });

    const [anios, setAnios] = useState<AnioFiltro[]>([]);
    const [todasFechasSeleccionadas, setTodasFechasSeleccionadas] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    const [mostrarResumenes, setMostrarResumenes] = useState(false);
    const [resumenRecaudacion, setResumenRecaudacion] = useState<Array<{ tipo: string, cantidad: number, suma: number }>>([]);
    const [resumenTipoCredito, setResumenTipoCredito] = useState<Array<{ tipo: string, cantidad: number, suma: number }>>([]);

    const [resumenRecaudacionPage, setResumenRecaudacionPage] = useState(1);
    const [resumenRecaudacionPerPage, setResumenRecaudacionPerPage] = useState(7);
    const [resumenTipoCreditoPage, setResumenTipoCreditoPage] = useState(1);
    const [resumenTipoCreditoPerPage, setResumenTipoCreditoPerPage] = useState(7);


    // Obtener años de filtro solo una vez
    useEffect(() => {
        obtenerAniosFiltro();
    }, []);

    // Obtener asociados cuando cambien los filtros
    useEffect(() => {
        obtenerAsociados();
    }, [filtros]);


    // En tu componente, agrega estas funciones (iguales a las del Excel)
    const determinarCategoriaRecaudacion = (depe93: number): string => {
        switch (depe93) {
            case 59: return 'Ley Insolvencia';
            case 0: return 'CC - Irrecuperable';
            case 46: return 'Saldo menor a Salario Mínimo';
            case 51:
            case 52:
            case 53:
            case 54: return 'Sin Medida Cautelar';
            case 55: return 'CC - Ejecutivo con Descuento';
            case 66: return 'CC - Problema';
            case 72: return 'CC - Embargo Bien Mueble/Inmueble';
            case 73: return 'CC - Embargo Bien Secuestrado';
            case 74: return 'CC - Remate';
            case 99: return 'CC - Sin Amnistía';
            default: return 'Otros';
        }
    };

    const extraerTodosCreditos = (creditosAgrupados?: string | null) => {
        const creditosExtraidos: Array<{ credito: string, valor: number }> = [];

        if (!creditosAgrupados || creditosAgrupados === 'null' || creditosAgrupados.trim() === '') {
            return creditosExtraidos;
        }

        try {
            const textoLimpio = creditosAgrupados.trim();

            // Si el texto contiene '#', separamos por ese carácter
            const creditos = textoLimpio.split('#').filter(c => {
                const creditoLimpio = c.trim();
                return creditoLimpio !== '' && creditoLimpio.startsWith('CREDITO:');
            });


            creditos.forEach(credito => {
                let creditoInfo = '';

                // Buscar TCRE (Tipo de crédito)
                const tcreMatch = credito.match(/\|TCRE:([^|]+)/);
                const desc06Match = credito.match(/\|DESC06:([^|]+)/);

                if (tcreMatch) {
                    const tipoCredito = tcreMatch[1].trim();
                    const descripcion = desc06Match ? desc06Match[1].trim() : '';

                    creditoInfo = descripcion ? `${tipoCredito} - ${descripcion}` : tipoCredito;

                    // Solo agregar si no está vacío y no es duplicado en este mismo registro
                    if (creditoInfo && !creditosExtraidos.some(c => c.credito === creditoInfo)) {
                        creditosExtraidos.push({ credito: creditoInfo, valor: 0 });
                    }
                }
            });

        } catch (error) {
            console.error('Error al extraer créditos:', error);
        }

        return creditosExtraidos;
    };

    // Función para calcular los resúmenes (IDÉNTICA a la del Excel)
    const calcularResumenes = (datos: Castigado[]) => {
        // Resumen por tipo de recaudación
        const recaudacionMap: Record<string, { cantidad: number; suma: number }> = {};
        const tipoCreditoMap: Record<string, { cantidad: number; suma: number }> = {};

        datos.forEach(item => {
            const valor = (item.ESCR93 || 0) + (item.ORCR93 || 0);


            // 1. Resumen por tipo de recaudación
            const categoriaRecaudacion = determinarCategoriaRecaudacion(item.DEPE93);
            if (!recaudacionMap[categoriaRecaudacion]) {
                recaudacionMap[categoriaRecaudacion] = { cantidad: 0, suma: 0 };
            }
            recaudacionMap[categoriaRecaudacion].cantidad += 1;
            recaudacionMap[categoriaRecaudacion].suma += valor;

            // 2. Resumen por tipo de crédito
            const creditos = extraerTodosCreditos(item.CREDITOS_AGRUPADOS);
            const valorPorCredito = creditos.length > 0 ? valor / creditos.length : valor;


            creditos.forEach(credito => {
                if (!tipoCreditoMap[credito.credito]) {
                    tipoCreditoMap[credito.credito] = { cantidad: 0, suma: 0 };
                }
                tipoCreditoMap[credito.credito].cantidad += 1;
                tipoCreditoMap[credito.credito].suma += valorPorCredito;
            });

            // Si no hay créditos específicos, contar como "Sin crédito especificado"
            if (creditos.length === 0) {
                const tipo = 'Sin crédito especificado';
                if (!tipoCreditoMap[tipo]) {
                    tipoCreditoMap[tipo] = { cantidad: 0, suma: 0 };
                }
                tipoCreditoMap[tipo].cantidad += 1;
                tipoCreditoMap[tipo].suma += valor;
            }
        });

        // Ordenar categorías para recaudación (mismo orden que en Excel)
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

        const resumenRecaudacionArray = categoriasOrdenadas
            .filter(categoria => recaudacionMap[categoria])
            .map(categoria => ({
                tipo: categoria,
                cantidad: recaudacionMap[categoria].cantidad,
                suma: recaudacionMap[categoria].suma
            }));

        // Ordenar tipos de crédito por cantidad (descendente) como en Excel
        const resumenTipoCreditoArray = Object.entries(tipoCreditoMap)
            .map(([tipo, data]) => ({
                tipo,
                cantidad: data.cantidad,
                suma: data.suma
            }))
            .sort((a, b) => b.cantidad - a.cantidad);

        return { resumenRecaudacionArray, resumenTipoCreditoArray };
    };

    // Función para manejar el clic en "Ver Más"
    const handleVerMasClick = async () => {
        try {
            // Necesitas obtener los datos detallados de castigados
            setLoading(true);

            // Construir URL para obtener los datos detallados
            let url = '/api/castigados?page=1&pageSize=2500'; // Ajusta esta ruta según tu API
            const params = new URLSearchParams();

            // Pasar los mismos filtros que usas en obtenerAsociados
            if (filtros.filtroRecaudacion) {
                params.append('filtroRecaudacion', filtros.filtroRecaudacion);
            }

            if (filtros.aniosSeleccionados.length > 0) {
                params.append('anios', filtros.aniosSeleccionados.join(','));
            }

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const res = await fetchAndBearer(url);

            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }

            if (!res.ok) throw new Error('Error al obtener datos detallados');

            const respuesta = await res.json();
            const datosDetallados: Castigado[] = respuesta.data || respuesta;

            if (!Array.isArray(datosDetallados) || datosDetallados.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Sin datos',
                    text: 'No hay datos detallados para calcular los resúmenes',
                    timer: 2000,
                    showConfirmButton: false
                });
                setMostrarResumenes(!mostrarResumenes);
                return;
            }

            // Calcular los resúmenes con los datos detallados
            const { resumenRecaudacionArray, resumenTipoCreditoArray } = calcularResumenes(datosDetallados);
            setResumenRecaudacion(resumenRecaudacionArray);
            setResumenTipoCredito(resumenTipoCreditoArray);
            setMostrarResumenes(!mostrarResumenes);

        } catch (error) {
            console.error('Error al obtener datos para resúmenes:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los resúmenes'
            });
        } finally {
            setLoading(false);
        }
    };



    // Función para obtener asociados con filtros
    const obtenerAsociados = useCallback(async () => {
        try {
            setLoading(true);

            // Construir URL con filtros
            let url = '/api/resumen-agencias';
            const params = new URLSearchParams();

            if (filtros.filtroRecaudacion) {
                params.append('filtroRecaudacion', filtros.filtroRecaudacion);
            }

            if (filtros.aniosSeleccionados.length > 0) {
                params.append('anios', filtros.aniosSeleccionados.join(','));
            }

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
            }

            const res = await fetchAndBearer(url);

            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }

            if (!res.ok) throw new Error('Error en la solicitud');

            const respuesta = await res.json();
            const datos = respuesta.data || respuesta;

            if (!Array.isArray(datos) || datos.length === 0) {
                setAsociados([]);
                setError('No se encontraron registros con los filtros aplicados');
                return;
            }

            setAsociados(datos);
            setError(null);

        } catch (error) {
            console.error('Error al obtener asociados:', error);
            setError('No se pudo obtener la información.');
            setAsociados([]);
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    const obtenerAniosFiltro = async () => {
        try {
            const res = await fetchAndBearer('/api/castigos/anios');

            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }

            if (!res.ok) throw new Error('Error en la solicitud');

            const respuesta = await res.json();
            const datos = respuesta.data || respuesta;

            if (!Array.isArray(datos)) {
                setError('Formato de años inválido');
                return;
            }

            setAnios(datos);

        } catch (error) {
            console.error('Error al obtener años:', error);
        }
    };

    // Ordenar datos
    const ordenarDatos = (datos: CastigoAsociado[]) => {
        return [...datos].sort((a, b) => {
            const codigoA = parseInt(a.CODIGO_AGENCIA);
            const codigoB = parseInt(b.CODIGO_AGENCIA);
            return codigoA - codigoB;
        });
    };

    // Datos filtrados y ordenados
    const datosFiltradosOrdenados = useMemo(() => {
        return ordenarDatos(asociados);
    }, [asociados]);

    // Calcular datos paginados
    const totalItems = datosFiltradosOrdenados.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = datosFiltradosOrdenados.slice(startIndex, endIndex);

    // Calcular totales por zona
    const calcularTotalesPorZona = () => {
        const zonas = {
            norte: [87, 86, 85, 81, 84, 88, 98, 97, 82],
            centro: [48, 80, 89, 94, 83, 13, 68, 73, 76, 90, 91, 92, 96, 93, 95],
            sur: [77, 49, 70, 42, 46, 45, 47, 78, 74, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 29]
        };

        const totales = {
            norte: { cuentas: 0, valor: 0 },
            centro: { cuentas: 0, valor: 0 },
            sur: { cuentas: 0, valor: 0 },
            total: { cuentas: 0, valor: 0 }
        };

        datosFiltradosOrdenados.forEach((asociado) => {
            const agencia = parseInt(asociado.CODIGO_AGENCIA);
            const cuentas = Number(asociado.TOTAL_CUENTAS);
            const valor = Number(asociado.TOTAL_DEUDA);

            if (zonas.norte.includes(agencia)) {
                totales.norte.cuentas += cuentas;
                totales.norte.valor += valor;
            } else if (zonas.centro.includes(agencia)) {
                totales.centro.cuentas += cuentas;
                totales.centro.valor += valor;
            } else if (zonas.sur.includes(agencia)) {
                totales.sur.cuentas += cuentas;
                totales.sur.valor += valor;
            }

            totales.total.cuentas += cuentas;
            totales.total.valor += valor;
        });

        return totales;
    };

    const totales = calcularTotalesPorZona();

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [filtros]);

    // Handlers para filtros
    const handleCambiarFiltro = (campo: keyof FiltrosResumenState, valor: unknown) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleToggleFecha = (anio: string) => {
        setFiltros(prev => {
            const nuevasFechas = prev.aniosSeleccionados.includes(anio)
                ? prev.aniosSeleccionados.filter(a => a !== anio)
                : [...prev.aniosSeleccionados, anio];

            // Actualizar checkbox "todas"
            const allSelected = nuevasFechas.length === anios.length;
            setTodasFechasSeleccionadas(allSelected);

            return {
                ...prev,
                aniosSeleccionados: nuevasFechas
            };
        });
    };

    const handleToggleTodasFechas = () => {
        const nuevasTodasSeleccionadas = !todasFechasSeleccionadas;
        setTodasFechasSeleccionadas(nuevasTodasSeleccionadas);

        if (nuevasTodasSeleccionadas) {
            // Seleccionar todas
            setFiltros(prev => ({
                ...prev,
                aniosSeleccionados: anios.map(a => a.ANIO)
            }));
        } else {
            // Deseleccionar todas
            setFiltros(prev => ({
                ...prev,
                aniosSeleccionados: []
            }));
        }
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            filtroRecaudacion: '',
            aniosSeleccionados: []
        });
        setTodasFechasSeleccionadas(false);
    };

    const handleChangeItemsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Resetear a la primera página
    };

    const handleExportarExcelClick = async () => {
        try {
            // Preparar datos para exportar
            const datosParaExportar = datosFiltradosOrdenados.map(item => ({
                CODIGO_AGENCIA: item.CODIGO_AGENCIA,
                NOMBRE_AGENCIA: item.NOMBRE_AGENCIA,
                TOTAL_CUENTAS: Number(item.TOTAL_CUENTAS),
                TOTAL_DEUDA: Number(item.TOTAL_DEUDA)
            }));

            // Preparar filtros
            const filtrosParaExportar: FiltrosExport = {
                filtroRecaudacion: filtros.filtroRecaudacion,
                aniosSeleccionados: filtros.aniosSeleccionados
            };

            // Llamar a la función de exportación
            await handleExportarExcel(datosParaExportar, filtrosParaExportar);

            // Opcional: Mostrar mensaje de éxito
            Swal.fire({
                icon: 'success',
                title: 'Excel generado',
                text: 'El archivo se ha descargado correctamente',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error al exportar:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el archivo Excel'
            });
        }
    };

    // Contador de resultados filtrados
    const resultadosFiltrados = datosFiltradosOrdenados.length;
    const inicio = (currentPage - 1) * itemsPerPage + 1;
    const fin = Math.min(currentPage * itemsPerPage, resultadosFiltrados);

    // Render loading
    if (loading && asociados.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando resumen de castigados...</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                {/* Header */}
                <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">Resumen de Castigados por Agencia</h3>
                            {!error && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {resultadosFiltrados} agencias
                                    {filtros.filtroRecaudacion || filtros.aniosSeleccionados.length > 0 ? ' (filtradas)' : ''}
                                </p>
                            )}
                        </div>
                        <h3 className="text-lg text-dark font-medium dark:text-white">
                            Corte: {new Date().toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </h3>
                    </div>
                </div>

                {/* Filtros */}
                <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
                    <FiltrosResumen
                        filtros={filtros}
                        anios={anios}
                        todasSeleccionadas={todasFechasSeleccionadas}
                        onCambiarFiltro={handleCambiarFiltro}
                        onToggleFecha={handleToggleFecha}
                        onToggleTodasFechas={handleToggleTodasFechas}
                        onLimpiarFiltros={handleLimpiarFiltros}
                    />
                </div>

                {/* Mensaje de error */}
                {error && !loading && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 p-4 m-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                                <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">Sin resultados</h3>
                                <p className="text-sm text-orange-700 dark:text-orange-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!error && (
                    <AnimatePresence mode="wait">
                        {/* ===================== VISTA LISTADO ===================== */}
                        {!mostrarResumenes && (
                            <motion.div
                                key="listado"
                                variants={fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                {/* ===================== TOOLBAR ===================== */}
                                <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700 dark:text-gray-400">Mostrar</span>
                                            <select
                                                value={itemsPerPage}
                                                onChange={handleChangeItemsPerPage}
                                                className="rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-blue-800"
                                            >
                                                <option value="10">10</option>
                                                <option value="20">20</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                            </select>
                                            <span className="text-sm text-gray-700 dark:text-gray-400">agencias</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleVerMasClick}
                                            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-100 px-4 py-2.5 text-sm font-medium text-blue-700 shadow-theme-xs transition-colors hover:bg-blue-200 hover:text-blue-800 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            Ver Más
                                        </button>

                                        <button
                                            onClick={handleExportarExcelClick}
                                            className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-100 px-3.5 py-2 text-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-300 hover:text-green-800 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 dark:hover:text-green-300"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            Exportar Excel
                                        </button>
                                    </div>
                                </div>

                                {/* ===================== TABLAS ===================== */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-5 py-4">
                                    {/* Columna izquierda - Tabla de Agencias */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-900 px-1 py-1 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-xl font-medium text-dark text-center dark:text-white">
                                                    Agencias
                                                </h3>
                                            </div>
                                            <div className="max-w-full overflow-x-auto">
                                                <div className="min-w-full">
                                                    <Table>
                                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                            <TableRow>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-dark dark:text-white/90">
                                                                    Agencia
                                                                </TableCell>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white/90">
                                                                    Cuentas
                                                                </TableCell>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white/90">
                                                                    Valor Total
                                                                </TableCell>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white/90">
                                                                    Acciones
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHeader>

                                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                            {currentItems.map((asociado, index) => (
                                                                <TableRow key={`${asociado.CODIGO_AGENCIA}-${index}`}>
                                                                    <TableCell className="px-4 py-3 align-middle">
                                                                        <div>
                                                                            <div className="text-md text-dark dark:text-gray-300 whitespace-nowrap">
                                                                                {asociado.CODIGO_AGENCIA} - {asociado.NOMBRE_AGENCIA}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-center">
                                                                        {Number(asociado.TOTAL_CUENTAS).toLocaleString('es-CO')}
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-center">
                                                                        $ {Number(asociado.TOTAL_DEUDA).toLocaleString('es-CO')}
                                                                    </TableCell>

                                                                    <TableCell className="px-4 py-3 align-middle text-center">
                                                                        <button
                                                                            onClick={() => {
                                                                                setAgenciaSeleccionada(asociado.CODIGO_AGENCIA);
                                                                                setModalDetalleOpen(true);
                                                                            }}
                                                                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                                                                            title="Ver detalle"
                                                                        >
                                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                            </svg>
                                                                        </button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna derecha - Tabla de Totales por Zona */}
                                    <div className="lg:col-span-1">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div className="bg-gray-50 dark:bg-gray-900 px-1 py-1 border-b border-gray-200 dark:border-gray-700">
                                                <h3 className="text-xl font-medium text-dark text-center dark:text-white">
                                                    Resumen por Zonas Jurídicas
                                                </h3>
                                            </div>
                                            <div className="max-w-full overflow-x-auto">
                                                <div className="min-w-full">
                                                    <Table>
                                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                            <TableRow>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-dark dark:text-white">
                                                                    Zona Jurídica
                                                                </TableCell>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white">
                                                                    Cuentas
                                                                </TableCell>
                                                                <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white">
                                                                    Valor Total
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHeader>

                                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                            <TableRow>
                                                                <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300">
                                                                    JURIDICO ZONA NORTE
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    {totales.norte.cuentas.toLocaleString('es-CO')}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    $ {totales.norte.valor.toLocaleString('es-CO')}
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300">
                                                                    JURIDICO ZONA CENTRO
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    {totales.centro.cuentas.toLocaleString('es-CO')}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    $ {totales.centro.valor.toLocaleString('es-CO')}
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300">
                                                                    JURIDICO ZONA SUR
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    {totales.sur.cuentas.toLocaleString('es-CO')}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                    $ {totales.sur.valor.toLocaleString('es-CO')}
                                                                </TableCell>
                                                            </TableRow>
                                                            <TableRow className="bg-blue-50 dark:bg-blue-900/20">
                                                                <TableCell className="px-4 py-3 text-md font-semibold text-dark dark:text-white">
                                                                    TOTAL GENERAL
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center font-semibold text-dark dark:text-white">
                                                                    {totales.total.cuentas.toLocaleString('es-CO')}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center font-semibold text-dark dark:text-white">
                                                                    $ {totales.total.valor.toLocaleString('es-CO')}
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer con paginación */}
                                {resultadosFiltrados > 0 && (
                                    <div className="border-t border-gray-100 dark:border-white/[0.05] px-5 py-4">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Mostrando {inicio} - {fin} de {resultadosFiltrados} agencias
                                                {filtros.filtroRecaudacion || filtros.aniosSeleccionados.length > 0 ? ' (filtradas)' : ''}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                >
                                                    ← Anterior
                                                </button>

                                                <span className="text-sm text-gray-700 dark:text-gray-400">
                                                    Página {currentPage} de {totalPages || 1}
                                                </span>

                                                <button
                                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                >
                                                    Siguiente →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ===================== VISTA RESÚMENES ===================== */}
                        {mostrarResumenes && (
                            <motion.div
                                key="resumenes"
                                variants={fadeSlide}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="px-5 py-6"
                            >
                                {/* BOTÓN VOLVER */}
                                <div className="mb-6">
                                    <button
                                        onClick={() => setMostrarResumenes(false)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        ← Sección Anterior
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Resumen por Tipo de Recaudación */}
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-900 px-1 py-1 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-medium text-dark text-center dark:text-white">
                                                    Resumen por Tipo de Recaudación
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-700 dark:text-gray-400">Mostrar</span>
                                                    <select
                                                        value={resumenRecaudacionPerPage}
                                                        onChange={(e) => setResumenRecaudacionPerPage(Number(e.target.value))}
                                                        className="rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800"
                                                    >
                                                        <option value="5">5</option>
                                                        <option value="10">10</option>
                                                        <option value="20">20</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-full overflow-x-auto">
                                            <div className="min-w-full">
                                                <Table>
                                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                        <TableRow>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-dark dark:text-white">
                                                                Tipo de Recaudación
                                                            </TableCell>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white">
                                                                Cuentas
                                                            </TableCell>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-right text-dark dark:text-white">
                                                                Valor
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHeader>

                                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                        {resumenRecaudacion
                                                            .slice(
                                                                (resumenRecaudacionPage - 1) * resumenRecaudacionPerPage,
                                                                resumenRecaudacionPage * resumenRecaudacionPerPage
                                                            )
                                                            .map((item, index) => (
                                                                <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300">
                                                                        {item.tipo}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                        {item.cantidad.toLocaleString('es-CO')}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3 text-md text-right text-dark dark:text-gray-300">
                                                                        $ {item.suma.toLocaleString('es-CO')}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}

                                                        {/* Fila TOTAL */}
                                                        <TableRow className="bg-orange-50 dark:bg-orange-900/20">
                                                            <TableCell className="px-4 py-3 text-md font-semibold text-dark dark:text-white">
                                                                TOTAL
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-md text-center font-semibold text-dark dark:text-white">
                                                                {resumenRecaudacion.reduce((sum, item) => sum + item.cantidad, 0).toLocaleString('es-CO')}
                                                            </TableCell>
                                                            <TableCell className="px-4 py-3 text-md text-right font-semibold text-dark dark:text-white">
                                                                $ {resumenRecaudacion.reduce((sum, item) => sum + item.suma, 0).toLocaleString('es-CO')}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        {/* Paginación Resumen Recaudación */}
                                        {Math.ceil(resumenRecaudacion.length / resumenRecaudacionPerPage) > 1 && (
                                            <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-3">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Mostrando {Math.min((resumenRecaudacionPage - 1) * resumenRecaudacionPerPage + 1, resumenRecaudacion.length)} -
                                                        {Math.min(resumenRecaudacionPage * resumenRecaudacionPerPage, resumenRecaudacion.length)} de {resumenRecaudacion.length} tipos
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setResumenRecaudacionPage(p => Math.max(p - 1, 1))}
                                                            disabled={resumenRecaudacionPage === 1}
                                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                        >
                                                            ←
                                                        </button>

                                                        <span className="text-sm text-gray-700 dark:text-gray-400 px-2">
                                                            Página {resumenRecaudacionPage} de {Math.ceil(resumenRecaudacion.length / resumenRecaudacionPerPage)}
                                                        </span>

                                                        <button
                                                            onClick={() => setResumenRecaudacionPage(p => Math.min(p + 1, Math.ceil(resumenRecaudacion.length / resumenRecaudacionPerPage)))}
                                                            disabled={resumenRecaudacionPage === Math.ceil(resumenRecaudacion.length / resumenRecaudacionPerPage)}
                                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Resumen por Tipo de Crédito */}
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="bg-gray-50 dark:bg-gray-900 px-1 py-1 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xl font-medium text-dark text-center dark:text-white">
                                                    Resumen por Tipo de Crédito
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-700 dark:text-gray-400">Mostrar</span>
                                                    <select
                                                        value={resumenTipoCreditoPerPage}
                                                        onChange={(e) => setResumenTipoCreditoPerPage(Number(e.target.value))}
                                                        className="rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800"
                                                    >
                                                        <option value="5">5</option>
                                                        <option value="10">10</option>
                                                        <option value="20">20</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-w-full overflow-x-auto">
                                            <div className="min-w-full">
                                                <Table>
                                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                                        <TableRow>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-dark dark:text-white">
                                                                Tipo de Crédito
                                                            </TableCell>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-center text-dark dark:text-white">
                                                                Cuentas
                                                            </TableCell>
                                                            <TableCell isHeader className="px-4 py-3 text-lg font-medium text-right text-dark dark:text-white">
                                                                Valor Total
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHeader>

                                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                        {resumenTipoCredito
                                                            .slice(
                                                                (resumenTipoCreditoPage - 1) * resumenTipoCreditoPerPage,
                                                                resumenTipoCreditoPage * resumenTipoCreditoPerPage
                                                            )
                                                            .map((item, index) => (
                                                                <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                    <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300">
                                                                        {item.tipo}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3 text-md text-center text-dark dark:text-gray-300">
                                                                        {item.cantidad.toLocaleString('es-CO')}
                                                                    </TableCell>
                                                                    <TableCell className="px-4 py-3 text-md text-right text-dark dark:text-gray-300">
                                                                        $ {item.suma.toLocaleString('es-CO')}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}

                                                        {/* Fila TOTAL (solo si hay datos) */}
                                                        {resumenTipoCredito.length > 0 && (
                                                            <TableRow className="bg-orange-50 dark:bg-orange-900/20">
                                                                <TableCell className="px-4 py-3 text-md font-semibold text-dark dark:text-white">
                                                                    TOTAL
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-center font-semibold text-dark dark:text-white">
                                                                    {resumenTipoCredito.reduce((sum, item) => sum + item.cantidad, 0).toLocaleString('es-CO')}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-md text-right font-semibold text-dark dark:text-white">
                                                                    $ {resumenTipoCredito.reduce((sum, item) => sum + item.suma, 0).toLocaleString('es-CO')}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        {/* Paginación Resumen Tipo Crédito */}
                                        {Math.ceil(resumenTipoCredito.length / resumenTipoCreditoPerPage) > 1 && (
                                            <div className="border-t border-gray-100 dark:border-white/[0.05] px-4 py-3">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Mostrando {Math.min((resumenTipoCreditoPage - 1) * resumenTipoCreditoPerPage + 1, resumenTipoCredito.length)} -
                                                        {Math.min(resumenTipoCreditoPage * resumenTipoCreditoPerPage, resumenTipoCredito.length)} de {resumenTipoCredito.length} tipos
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setResumenTipoCreditoPage(p => Math.max(p - 1, 1))}
                                                            disabled={resumenTipoCreditoPage === 1}
                                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                        >
                                                            ←
                                                        </button>

                                                        <span className="text-sm text-gray-700 dark:text-gray-400 px-2">
                                                            Página {resumenTipoCreditoPage} de {Math.ceil(resumenTipoCredito.length / resumenTipoCreditoPerPage)}
                                                        </span>

                                                        <button
                                                            onClick={() => setResumenTipoCreditoPage(p => Math.min(p + 1, Math.ceil(resumenTipoCredito.length / resumenTipoCreditoPerPage)))}
                                                            disabled={resumenTipoCreditoPage === Math.ceil(resumenTipoCredito.length / resumenTipoCreditoPerPage)}
                                                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                    hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                    dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Modal de detalle */}
            <ModalDetalleResumen
                isOpen={modalDetalleOpen}
                onClose={() => setModalDetalleOpen(false)}
                codigoAgencia={agenciaSeleccionada || ''}
                filtroRecaudacion={filtros.filtroRecaudacion}
                aniosSeleccionados={filtros.aniosSeleccionados}
            />
        </>
    );
};

export default TablaResumenCastigos;