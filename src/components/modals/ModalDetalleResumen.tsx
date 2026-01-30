import React, { useEffect, useState, useMemo } from 'react';
import { Modal } from '../ui/modal';
import { useResumenCastigados } from '../../hooks/userResumenCastigados';
import { FiltroRecaudacion } from '../../types/resumen';
import {
    determinarZonaJuridica,
    formatearFechaFTAG05
} from '../utils/resumenCastigados';
import { exportarDetalleAExcel } from '../../components/utils/excelExportResumen';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

interface ModalDetalleResumenProps {
    isOpen: boolean;
    onClose: () => void;
    codigoAgencia: string;
    filtroRecaudacion?: FiltroRecaudacion;
    aniosSeleccionados?: string[];
}

const buscarEnCampo = (valor: string | number | null | undefined, terminoBusqueda: string): boolean => {
    if (valor === null || valor === undefined) return false;
    return String(valor).toLowerCase().includes(terminoBusqueda.toLowerCase());
};

const ModalDetalleAsociado: React.FC<ModalDetalleResumenProps> = ({
    isOpen,
    onClose,
    codigoAgencia,
    filtroRecaudacion,
    aniosSeleccionados = []
}) => {
    const { detalles, loading, fetchDetalles } = useResumenCastigados();

    // Estado para la tabla
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [exportando, setExportando] = useState(false);

    useEffect(() => {
        if (isOpen && codigoAgencia) {
            fetchDetalles(codigoAgencia, filtroRecaudacion, aniosSeleccionados);
        }
    }, [isOpen, codigoAgencia, filtroRecaudacion, aniosSeleccionados, fetchDetalles]);

    // Filtrar datos por búsqueda
    const filteredDetalles = useMemo(() => {
        if (!searchTerm) return detalles;

        const searchTermLower = searchTerm.toLowerCase();
        return detalles.filter(item => {
            // Buscar en todos los campos relevantes
            return buscarEnCampo(item.DNOM93, searchTermLower) ||
                buscarEnCampo(item.NCTA93, searchTermLower) ||
                buscarEnCampo(item.NNIT93, searchTermLower) ||
                buscarEnCampo(item.DCTA93, searchTermLower) ||
                buscarEnCampo(item.DDEP93, searchTermLower) ||
                buscarEnCampo(item.AAUX93, searchTermLower) ||
                buscarEnCampo(item.DESC03, searchTermLower) ||
                buscarEnCampo(item.SALDO_TOTAL, searchTermLower) ||
                buscarEnCampo(formatearFechaFTAG05(item.FTAG05), searchTermLower);
        });
    }, [detalles, searchTerm]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDetalles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredDetalles.length / itemsPerPage);

    // Calcular totales
    const totalSaldo = filteredDetalles.reduce((sum, item) => sum + Number(item.SALDO_TOTAL), 0);
    const totalRegistros = filteredDetalles.length;

    // Resetear página cuando cambie la búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Función para exportar a Excel
    const handleExportarExcel = async () => {
        if (detalles.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        setExportando(true);
        try {
            const agenciaNombre = detalles.length > 0 ? detalles[0].DESC03 : 'Sin nombre';

            await exportarDetalleAExcel(
                filteredDetalles,
                codigoAgencia,
                agenciaNombre,
                filtroRecaudacion,
                aniosSeleccionados
            );
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Ocurrió un error al exportar el archivo. Por favor, intente nuevamente.');
        } finally {
            setExportando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xxl">
            {/* Header fijo */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xl font-medium text-dark dark:text-white">
                            Detalle de Castigados - Agencia {codigoAgencia} - {detalles.length > 0 ? detalles[0].DESC03 : ''}
                        </h3>
                        {!loading && detalles.length > 0 && (
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                {totalRegistros} registros • Saldo total: $ {totalSaldo.toLocaleString('es-CO')}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Contenedor principal con scroll */}
            <div className="flex flex-col h-[70vh]">
                {/* Barra de herramientas - también fija debajo del header */}
                {!loading && detalles.length > 0 && (
                    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Búsqueda */}
                            <div className="flex-1 min-w-0">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                                        placeholder="Buscar por nombre, cédula, cuenta..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Items por página y exportar */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-400">Mostrar</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 shadow-theme-xs focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-blue-800"
                                    >
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                    <span className="text-sm text-gray-700 dark:text-gray-400">registros</span>
                                </div>

                                {/* Botón exportar */}
                                <button
                                    onClick={handleExportarExcel}
                                    disabled={exportando || filteredDetalles.length === 0}
                                    className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-100 px-3.5 py-2 text-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-200 hover:text-green-800 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {exportando ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Exportando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Exportar ({filteredDetalles.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido con scroll */}
                <div className="flex-1 overflow-hidden px-6">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center py-12">
                            <div className="animate-spin h-10 w-10 border-3 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Cargando detalles de la agencia...</p>
                        </div>
                    ) : detalles.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Sin registros</h4>
                            <p className="text-gray-500 dark:text-gray-400">
                                No se encontraron datos para esta agencia con los filtros seleccionados.
                            </p>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {/* Tabla con scroll interno */}
                            <div className="flex-1 overflow-auto">
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="min-w-full">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-white/[0.05]">
                                                <TableRow>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-dark dark:text-white/90 sticky left-0 bg-white dark:bg-gray-800">
                                                        AGENCIA
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        ZONA JURÍDICA
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        CÉDULA
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        NOMBRE
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        CUENTA
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        NÓMINA
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        VALOR CASTIGADO
                                                    </TableCell>
                                                    <TableCell isHeader className="px-4 py-3 text-sm font-medium text-center text-dark dark:text-white/90">
                                                        FECHA CASTIGO
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                                {currentItems.map((item, index) => (
                                                    <TableRow key={`${item.NCTA93}-${index}`}>
                                                        <TableCell className="px-4 py-3 align-middle sticky left-0 bg-white dark:bg-gray-800">
                                                            <div className="text-md text-dark dark:text-gray-300 whitespace-nowrap">
                                                                {item.AAUX93} - {item.DESC03}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-center">
                                                            {determinarZonaJuridica(item.AAUX93)}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-center">
                                                            {Number(item.NNIT93).toLocaleString('es-CO')}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 align-middle text-center">
                                                            <div className="text-md text-dark dark:text-gray-300">
                                                                <div className="font-medium">{item.NCTA93}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 align-middle">
                                                            <div className="text-md text-dark dark:text-gray-300">
                                                                <div className="font-medium">{item.DCTA93}</div>
                                                                <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                                    {item.DDEP93}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-start">
                                                            <div className="font-medium">{item.DNOM93}</div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-md font-medium text-dark dark:text-white align-middle text-center">
                                                            $ {Number(item.SALDO_TOTAL).toLocaleString('es-CO')}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-md text-dark dark:text-gray-300 align-middle text-center">
                                                            {formatearFechaFTAG05(item.FTAG05)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Paginación - fija en la parte inferior del contenido */}
                            {filteredDetalles.length > 0 && (
                                <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredDetalles.length)}
                                            de {filteredDetalles.length} registros
                                            {searchTerm && ' (filtrados)'}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                            >
                                                ← Anterior
                                            </button>

                                            <span className="text-sm text-gray-700 dark:text-gray-400">
                                                Página {currentPage} de {totalPages || 1}
                                            </span>

                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                                            >
                                                Siguiente →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ModalDetalleAsociado;