import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../ui/table";
import { fetchAndBearer } from "../../../components/api/FetchAndBearer";
import FiltrosCastigados from '../../filtros/FiltrosCastigados';
import { Castigado, Agencia, FiltrosState } from '../../../types/castigados';
import ModalDetalleAsociado from '../../modals/ModalDetalleAsociado';
import ModalProcesoJuridico from '../../modals/ModalExpedienteJur';
import ModalCrearGestion from '../../modals/ModalCrearGestion';
import { exportarAExcel } from '../../utils/excelExportCastigados';

const ITEMS_PER_PAGE = 5;

const TablaCastigados: React.FC = () => {
    const [castigados, setCastigados] = useState<Castigado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [cedulaSeleccionada, setCedulaSeleccionada] = useState<string | null>(null);

    const [busqueda, setBusqueda] = useState('');


    //Para modal jurídico
    const [modalJuridicoAbierto, setModalJuridicoAbierto] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string | null>(null);

    const [modalGestionOpen, setModalGestionOpen] = useState(false);

    const abrirModalJuridico = (cuenta: string) => {
        setCuentaSeleccionada(cuenta);
        setModalJuridicoAbierto(true);
    };


    // Filtros
    const [filtros, setFiltros] = useState<FiltrosState>({
        fechaInicio: '',
        fechaFin: '',
        ordenFecha: 'asc',
        ordenValor: '',
        score: '',
        recaudacion: '',
        agenciasSeleccionadas: []
    });

    const [agencias, setAgencias] = useState<Agencia[]>([]);
    const [todasAgenciasSeleccionadas, setTodasAgenciasSeleccionadas] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

    // Obtener datos
    useEffect(() => {
        obtenerCastigados();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filtros, busqueda]);


    const obtenerCastigados = async () => {
        try {
            setLoading(true);
            const res = await fetchAndBearer('/api/castigados?page=1&pageSize=2500');

            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }

            if (!res.ok) throw new Error('Error en la solicitud');

            const respuesta = await res.json();
            const datos = respuesta.data || respuesta;
            console.log(datos);


            if (!Array.isArray(datos) || datos.length === 0) {
                setError('No se encontraron registros');
                return;
            }

            setCastigados(datos);
            inicializarAgencias(datos);

        } catch (error) {
            console.error('Error al obtener castigados:', error);
            setError('No se pudo obtener la información.');
        } finally {
            setLoading(false);
        }
    };

    const inicializarAgencias = (datos: Castigado[]) => {
        const agenciasUnicas: Agencia[] = [];

        datos.forEach(a => {
            if (a.AAUX93 && a.DESC03) {
                const centroOperacion = `${a.AAUX93} - ${a.DESC03}`;
                if (!agenciasUnicas.find(ag => ag.codigo === a.AAUX93)) {
                    agenciasUnicas.push({
                        codigo: parseInt(a.AAUX93.toString()),
                        nombre: a.DESC03,
                        texto: centroOperacion
                    });
                }
            }
        });

        agenciasUnicas.sort((a, b) => a.codigo - b.codigo);
        setAgencias(agenciasUnicas);
    };

    // Función para aplicar filtros (igual que en tu código jQuery)
    const aplicarFiltros = (datos: Castigado[]) => {
        let datosFiltradosTemp = [...datos];

        // Filtro por agencias
        if (filtros.agenciasSeleccionadas.length > 0) {
            datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
                const centroOperacion = `${asociado.AAUX93} - ${asociado.DESC03}`;
                return filtros.agenciasSeleccionadas.includes(centroOperacion);
            });
        }

        // Filtro por fecha
        if (filtros.fechaInicio || filtros.fechaFin) {
            const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
            const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;

            datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
                if (!asociado.FTAG05) return false;

                const fechaRaw = String(19000000 + parseInt(asociado.FTAG05.toString()));
                const fechaAsociado = new Date(
                    fechaRaw.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3")
                );

                if (fechaInicio && fechaAsociado < fechaInicio) return false;
                if (fechaFin && fechaAsociado > fechaFin) return false;

                return true;
            });
        }

        // Filtro por score
        if (filtros.score) {
            datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
                let score = asociado.Score;

                // Normalizar strings especiales
                if (typeof score === 'string') {
                    if (score.toLowerCase().includes("falta")) score = "F/D";
                    else if (score === "S/E") score = "S/E";
                    else if (score.toLowerCase().includes("muerte")) score = "Q.E.P.D";
                }

                // Comparación con filtro
                if (filtros.score === "SE") return score === "S/E";
                if (filtros.score === "FD") return score === "F/D";
                if (filtros.score === "QEPD") return score === "Q.E.P.D";

                if (!isNaN(Number(score))) {
                    const scoreNum = Number(score);
                    if (filtros.score === "0-650") return scoreNum <= 650;
                    if (filtros.score === "650+") return scoreNum > 650;
                }

                return false;
            });
        }

        // Filtro por recaudación
        if (filtros.recaudacion) {
            datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
                const depe93 = parseInt(asociado.DEPE93.toString());

                switch (filtros.recaudacion) {
                    case 'LEY_INSOLVENCIA':
                        return depe93 === 59;
                    case 'SALDO_MINIMO':
                        return depe93 === 0 || depe93 === 46;
                    case 'SIN_MEDIDA_CAUTELAR':
                        return depe93 === 51 || depe93 === 52 || depe93 === 53 || depe93 === 54;
                    case 'CARTERA_PROBLEMA':
                        return depe93 === 66;
                    case 'EMBARGO_BIENES':
                        return depe93 === 72;
                    case 'EMBARGO_SECUESTRADO':
                        return depe93 === 73;
                    case 'CC_REMATE':
                        return depe93 === 74;
                    case 'SIN_AMNISTIA':
                        return depe93 === 99;
                    default:
                        return true;
                }
            });
        }

        // 🔍 Filtro por búsqueda global
        if (busqueda.trim() !== '') {
            const texto = busqueda.toLowerCase();

            datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
                return (
                    String(asociado.NNIT93).includes(texto) ||
                    asociado.DCTA93?.toLowerCase().includes(texto) ||
                    asociado.DNOM93?.toLowerCase().includes(texto) ||
                    String(asociado.NCTA93).includes(texto) ||
                    `${asociado.AAUX93} - ${asociado.DESC03}`.toLowerCase().includes(texto)
                );
            });
        }

        return datosFiltradosTemp;
    };

    // Ordenar datos
    const ordenarDatos = (datos: Castigado[]) => {
        const datosOrdenados = [...datos];

        return datosOrdenados.sort((a, b) => {
            if (filtros.ordenValor) {
                const valorA = (Number(a.ESCR93) || 0) + (Number(a.ORCR93) || 0);
                const valorB = (Number(b.ESCR93) || 0) + (Number(b.ORCR93) || 0);
                return filtros.ordenValor === 'asc' ? valorA - valorB : valorB - valorA;
            }

            const fechaA = a.FTAG05 ? new Date(
                String(19000000 + parseInt(a.FTAG05.toString())).replace(
                    /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"
                )
            ) : new Date(9999, 11, 31);

            const fechaB = b.FTAG05 ? new Date(
                String(19000000 + parseInt(b.FTAG05.toString())).replace(
                    /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"
                )
            ) : new Date(9999, 11, 31);

            return filtros.ordenFecha === 'asc' ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
        });
    };

    // Datos filtrados y ordenados (se recalcula automáticamente)
    const datosFiltradosOrdenados = useMemo(() => {
        const filtrados = aplicarFiltros(castigados);
        return ordenarDatos(filtrados);
    }, [castigados, filtros, busqueda]);

    const datosPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return datosFiltradosOrdenados.slice(startIndex, endIndex);
    }, [datosFiltradosOrdenados, currentPage, itemsPerPage]);

    // Calcular total de páginas
    const totalPages = Math.ceil(datosFiltradosOrdenados.length / itemsPerPage);


    useEffect(() => {
        setCurrentPage(1);
    }, [filtros]);


    // Handlers para filtros
    const handleCambiarFiltro = (campo: keyof FiltrosState, valor: unknown) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleToggleAgencia = (agenciaTexto: string) => {
        setFiltros(prev => {
            const nuevasAgencias = prev.agenciasSeleccionadas.includes(agenciaTexto)
                ? prev.agenciasSeleccionadas.filter(ag => ag !== agenciaTexto)
                : [...prev.agenciasSeleccionadas, agenciaTexto];

            // Actualizar checkbox "todas"
            const allSelected = nuevasAgencias.length === agencias.length;
            setTodasAgenciasSeleccionadas(allSelected);

            return {
                ...prev,
                agenciasSeleccionadas: nuevasAgencias
            };
        });
    };

    const handleToggleTodasAgencias = () => {
        const nuevasTodasSeleccionadas = !todasAgenciasSeleccionadas;
        setTodasAgenciasSeleccionadas(nuevasTodasSeleccionadas);

        if (nuevasTodasSeleccionadas) {
            // Seleccionar todas
            setFiltros(prev => ({
                ...prev,
                agenciasSeleccionadas: agencias.map(ag => ag.texto)
            }));
        } else {
            // Deseleccionar todas
            setFiltros(prev => ({
                ...prev,
                agenciasSeleccionadas: []
            }));
        }
    };

    const handleLimpiarFiltros = () => {
        setFiltros({
            fechaInicio: '',
            fechaFin: '',
            ordenFecha: 'asc',
            ordenValor: '',
            score: '',
            recaudacion: '',
            agenciasSeleccionadas: []
        });
        setTodasAgenciasSeleccionadas(false);
    };

    //Exportar a Excel
    const handleExportarExcel = async () => {
        try {
            const datosParaExcel = datosFiltradosOrdenados.map((asociado) => {

                const valor =
                    (Number(asociado.ESCR93) || 0) +
                    (Number(asociado.ORCR93) || 0);

                // IMPORTANTE: Manejar el caso cuando CREDITOS_AGRUPADOS es null
                const creditosAgrupados = asociado.CREDITOS_AGRUPADOS === null
                    ? ''
                    : (asociado.CREDITOS_AGRUPADOS || '');

                return {
                    agencia: `${asociado.AAUX93} - ${asociado.DESC03}`,
                    recaudacion: asociado.DDEP93 ?? '',
                    nit: String(asociado.NNIT93),
                    tipoCuenta: asociado.DCTA93 ?? '',
                    numeroCuenta: String(asociado.NCTA93),
                    nombre: asociado.DNOM93 ?? '',
                    score: normalizeScore(asociado.Score),
                    valor,
                    fecha: formatFechaFTAG05(asociado.FTAG05),
                    agenciaCodigo: Number(asociado.AAUX93) || 0,
                    depe93: Number(asociado.DEPE93) || 0,
                    zonaJuridica: '',
                    CREDITOS_AGRUPADOS: creditosAgrupados // Aquí ya no será null
                };
            });

            await exportarAExcel(
                datosParaExcel,
                'Corte Actual',
                filtros.recaudacion || undefined,
                [] // no estás filtrando por años actualmente
            );
        } catch (error) {
            console.error('Error exportando Excel:', error);
            alert('Error al exportar el Excel');
        }
    };

    // Formatear fecha FTAG05
    const formatFechaFTAG05 = (ftag05: number) => {
        if (!ftag05) return '';
        const fechaRaw = String(19000000 + parseInt(ftag05.toString()));
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const anio = parseInt(fechaRaw.substring(0, 4));
        const mes = parseInt(fechaRaw.substring(4, 6)) - 1;
        const dia = parseInt(fechaRaw.substring(6, 8));
        return `${dia.toString().padStart(2, '0')}/${meses[mes]}/${anio}`;
    };

    // Calcular semáforo
    const calcularSemaforo = (fechaInsercion: string) => {
        if (!fechaInsercion || fechaInsercion === 'F/D') {
            return { dias: null, estado: null };
        }

        const fechaInsercionDate = new Date(fechaInsercion);
        const hoy = new Date();
        const diffTime = Math.abs(hoy.getTime() - fechaInsercionDate.getTime());
        const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDias <= 170) return { dias: diffDias, estado: 'bg-green-500' };
        else if (diffDias >= 171 && diffDias <= 179) return { dias: diffDias, estado: 'bg-yellow-500' };
        else return { dias: diffDias, estado: 'bg-red-500' };
    };

    // Obtener clase para badge de score

    const normalizeScore = (score: string): string => {
        const s = score?.toUpperCase().trim();

        if (s === 'CANCELADA POR MUERTE') return 'Q.E.P.D';
        if (s === 'F/D') return 'F/D';
        if (s === 'S/E') return 'S/E';

        return score;
    };


    const getScoreBadgeClass = (score: string) => {
        const normalized = normalizeScore(score);

        if (normalized === 'F/D') return "bg-gray-800 text-white";
        if (normalized === 'S/E') return "bg-yellow-500 text-gray-800";
        if (normalized === 'Q.E.P.D') return "bg-purple-600 text-white";

        const scoreNum = Number(normalized);
        if (isNaN(scoreNum)) return "bg-gray-500 text-white";
        if (scoreNum > 650) return "bg-blue-500 text-white";
        if (scoreNum === 650) return "bg-yellow-500 text-gray-800";
        return "bg-red-500 text-white";
    };


    const handleChangeItemsPerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(e.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Volver a página 1 cuando cambia el tamaño
    };

    // Contador de resultados filtrados
    const resultadosFiltrados = datosFiltradosOrdenados.length;
    const resultadosTotales = castigados.length;
    const inicio = (currentPage - 1) * itemsPerPage + 1;
    const fin = Math.min(currentPage * itemsPerPage, resultadosFiltrados);


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

                {/* Header */}
                <div className="border-b border-gray-100 dark:border-white/[0.05] px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">Asociados Castigados</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {resultadosFiltrados} de {resultadosTotales} resultados
                                {resultadosFiltrados !== resultadosTotales && ' (filtrados)'}
                            </p>
                        </div>
                        <h3 className="text-lg text-dark font-medium dark:text-white">
                            Corte:
                            {new Date().toLocaleDateString('es-CO', {
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
                    <FiltrosCastigados
                        filtros={filtros}
                        agencias={agencias}
                        todasSeleccionadas={todasAgenciasSeleccionadas}
                        onCambiarFiltro={handleCambiarFiltro}
                        onToggleAgencia={handleToggleAgencia}
                        onToggleTodasAgencias={handleToggleTodasAgencias}
                        onLimpiarFiltros={handleLimpiarFiltros}
                    />
                </div>


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
                            <span className="text-sm text-gray-700 dark:text-gray-400">registros</span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por cédula, nombre, cuenta, agencia..."
                                className="w-72 rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm
                                            focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10
                                            dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1016.65 16.65z" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* Botón Crear Gestión */}
                        <button
                            onClick={() => setModalGestionOpen(true)}
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
                            Crear Gestión
                        </button>

                        {/* Botón Exportar Excel (existente) */}
                        <button
                            onClick={handleExportarExcel}
                            className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-100 px-4 py-2.5 text-sm font-medium text-green-700 shadow-theme-xs transition-colors hover:bg-green-200 hover:text-green-800 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
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


                {/* Tabla */}
                <div className="max-w-full overflow-hidden">
                    <div className="min-w-[1500px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Agencia
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Cédula
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Asociado
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Cuenta
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Nómina
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Score
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Valor Castigado
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Fecha Castigo
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-4 text-lg font-medium text-center text-gray-800 dark:text-white/90">
                                        Acciones
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {datosPaginados.map((asociado, index) => {
                                    const limpiarTexto = (texto?: string) =>
                                        texto?.replace(/\s+/g, ' ').trim() ?? '';
                                    const sumaCredito = (Number(asociado.ESCR93) || 0) + (Number(asociado.ORCR93) || 0);
                                    const { dias, estado } = calcularSemaforo(asociado.FechaInsercion);
                                    const centroOperacion = `${asociado.AAUX93} - ${limpiarTexto(asociado.DESC03)}`;

                                    return (
                                        <TableRow key={`${asociado.NNIT93}-${index}`}>
                                            <TableCell className="px-5 py-4 align-middle">
                                                <div>
                                                    <div className="text-gray-800 dark:text-gray-400 whitespace-nowrap">{centroOperacion}</div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-400 align-middle">
                                                {Number(asociado.NNIT93).toLocaleString('es-CO')}
                                            </TableCell>

                                            <TableCell className="px-5 py-4 align-middle">
                                                <div>
                                                    <div className="text-gray-800 dark:text-gray-200 whitespace-nowrap">{asociado.DCTA93}</div>
                                                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">{asociado.DDEP93}</div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-400 align-middle text-center">
                                                {asociado.NCTA93}
                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-400 align-middle">
                                                {asociado.DNOM93}
                                            </TableCell>

                                            <TableCell className="px-5 py-4 align-middle">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-md font-medium ${getScoreBadgeClass(asociado.Score)}`}>
                                                        {normalizeScore(asociado.Score)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {['bg-green-500', 'bg-yellow-500', 'bg-red-500'].map(color => (
                                                            <div
                                                                key={color}
                                                                className={`h-3 w-3 rounded-full ${estado === color ? color : 'bg-gray-300 dark:bg-gray-600'}`}
                                                            />
                                                        ))}
                                                        <span className="text-sm font-medium text-dark dark:text-gray-200 whitespace-nowrap">
                                                            {dias !== null ? `${dias} días` : 'Sin info'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300 align-middle text-center">
                                                $ {sumaCredito.toLocaleString()}
                                            </TableCell>

                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-400 align-middle text-center">
                                                {formatFechaFTAG05(asociado.FTAG05)}
                                            </TableCell>

                                            <TableCell className="px-5 py-4 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setCedulaSeleccionada(asociado.NNIT93);
                                                            setModalDetalleOpen(true);
                                                        }}
                                                        className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                                                        title="Ver más"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => abrirModalJuridico(asociado.NCTA93.toString())}
                                                        className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>

                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Footer con contador */}
                <div className="border-t border-gray-100 dark:border-white/[0.05] px-5 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Mostrando {inicio} - {fin} de {resultadosFiltrados} registros
                            {resultadosFiltrados !== resultadosTotales && ' (filtrados)'}
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
            </div>

            {/* Modal de detalle asociado */}
            <ModalDetalleAsociado
                isOpen={modalDetalleOpen}
                onClose={() => setModalDetalleOpen(false)}
                cedula={cedulaSeleccionada}
            />
            {/* Modal de proceso jurídico */}
            <ModalProcesoJuridico
                isOpen={modalJuridicoAbierto}
                onClose={() => setModalJuridicoAbierto(false)}
                cuenta={cuentaSeleccionada}

            />
            <ModalCrearGestion
                isOpen={modalGestionOpen}
                onClose={() => setModalGestionOpen(false)}
            />
        </>
    );
};

export default TablaCastigados;