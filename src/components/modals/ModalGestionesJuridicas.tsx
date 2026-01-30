
import React, { useEffect, useRef } from 'react';
import { Modal } from '../ui/modal';
import { useGestionesJuridicas } from '../../hooks/useGestionesJuridicas';
import {
    formatearFechaGestion,
    formatearHoraGestion,
    obtenerClaseOrigen,
    obtenerColorOrigen,
    obtenerDescripcionOrigen,
    obtenerUsuarioGestion
} from '../../components/utils/gestion-juridica';

interface ModalGestionesJuridicasProps {
    isOpen: boolean;
    onClose: () => void;
    cuenta: string | null;
    nombreCliente?: string;
}

const ModalGestionesJuridicas: React.FC<ModalGestionesJuridicasProps> = ({
    isOpen,
    onClose,
    cuenta,
    nombreCliente = 'Cliente'
}) => {
    const { historial, loading, error, cargarGestiones, limpiarHistorial } = useGestionesJuridicas();
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && cuenta) {
            cargarGestiones(cuenta);
        } else {
            limpiarHistorial();
        }
    }, [isOpen, cuenta, cargarGestiones, limpiarHistorial]);

    // Función para imprimir
    const imprimirHistorial = () => {
        if (!printRef.current) {
            alert("No hay contenido para imprimir.");
            return;
        }

        const contenido = printRef.current.innerHTML;
        const ventanaImpresion = window.open('', '_blank', 'width=900,height=600');

        if (!ventanaImpresion) {
            alert("Por favor, permite ventanas emergentes para imprimir.");
            return;
        }

        ventanaImpresion.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historial de Gestiones - ${nombreCliente}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            background-color: white;
            padding: 10px;
            margin: 0;
          }
          
          .contenedor-impresion {
            max-width: 210mm;
            margin: 0 auto;
            padding: 0;
          }
          
          /* Estilos específicos para impresión */
          @media print {
            @page {
              size: A4;
              margin: 0.5cm 0.5cm 1.5cm 0.5cm;
            }
            
            @page {
              @bottom-center {
                content: counter(page) " de " counter(pages);
                font-family: 'Segoe UI', sans-serif;
                font-size: 9px;
                color: #666;
              }
            }
            
            body {
              font-size: 10px !important;
              padding: 0 !important;
            }
            
            .fa, .fas, .far, .fal, .fab {
              display: inline !important;
              font-style: normal !important;
            }
            
            .no-print {
              display: none !important;
            }
            
            /* Forzar colores en impresión */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body onload="window.print(); setTimeout(() => window.close(), 500)">
        <div class="contenedor-impresion">
          ${contenido}
        </div>
      </body>
      </html>
    `);

        ventanaImpresion.document.close();
    };

    // Función para obtener fecha actual formateada
    const obtenerFechaActual = () => {
        const ahora = new Date();
        const opciones: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const fecha = ahora.toLocaleDateString('es-CO', opciones);
        return fecha.replace(',', ''); // Remover coma extra
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="bg-white dark:bg-gray-900"
        >
            {/* Header del modal */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Historial de Gestiones
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {historial ? `Cuenta: ${historial.cuenta} - ${historial.nombreCliente}` : 'Cargando...'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {historial ? `No. Gestiones: ${historial.totalGestiones} Registros` : 'Cargando...'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={imprimirHistorial}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Imprimir
                        </button>

                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido del modal */}
            <div className="overflow-y-auto px-6 py-4 max-h-[70vh]">
                <div ref={printRef} className="hidden-print">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                            <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando historial de gestiones...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                            <div className="text-center">
                                <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                    No se encontraron gestiones
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    No hay registros de gestión para esta cuenta en el sistema.
                                </p>
                                <button
                                    onClick={() => cuenta && cargarGestiones(cuenta)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    ) : historial ? (
                        <div className="expediente-gestiones space-y-6">
                            {/* Encabezado del expediente */}
                            <div className="encabezado-documento bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="membrete flex items-center justify-between mb-4">
                                    <div className="logo-institucion">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="titulo-documento text-center">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">HISTORIAL DE GESTIONES</h3>
                                        <p className="text-lg text-gray-700 dark:text-gray-300 mt-1">
                                            Cuenta No. {historial.cuenta} - {historial.nombreCliente}
                                        </p>
                                    </div>

                                    <div className="sello bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg transform rotate-2">
                                        <div className="text-center">
                                            <span className="font-bold text-sm">{historial.totalGestiones} REGISTROS</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="datos-encabezado flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-dark dark:text-gray-300">
                                        <div className="font-semibold">
                                            Última gestión: {historial.ultimaGestion && formatearFechaGestion(historial.ultimaGestion.fecha_gestion, historial.ultimaGestion.origen)}
                                        </div>
                                    </div>
                                    <div className="text-sm text-dark dark:text-gray-400">
                                        Total gestiones: {historial.totalGestiones}
                                    </div>
                                </div>
                            </div>

                            {/* Convención de colores */}
                            <div className="convencion-colores bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                        <span className="text-md text-dark  font-medium dark:text-gray-300">AS400</span>
                                        <span className="text-sm text-dark  dark:text-gray-400 ml-1">
                                            Gestiones provenientes de la plataforma AS400
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                        <span className="text-md text-dark  font-medium dark:text-gray-300">Software Cartera Cast.</span>
                                        <span className="text-sm text-dark  dark:text-gray-400 ml-1">
                                            Gestiones registradas en el Software Cartera Cast.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sección de detalle de gestiones */}
                            <div className="seccion-expediente">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="titulo-seccion text-gray-900 dark:text-gray-100 mb-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        DETALLE DE GESTIONES
                                    </h4>

                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                                        {historial.totalGestiones} registros
                                    </span>
                                </div>

                                <div className="timeline-gestiones">
                                    {historial.gestiones.map((gestion, index) => {
                                        const claseOrigen = obtenerClaseOrigen(gestion.origen);
                                        const colorOrigen = obtenerColorOrigen(gestion.origen);
                                        const esUltimaGestion = index === 0;

                                        return (
                                            <div
                                                key={index}
                                                className={`evento-gestion ${esUltimaGestion ? 'ultima-gestion' : ''}`}
                                            >
                                                <div className="timeline-marker">
                                                    {esUltimaGestion ? (
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <circle cx="10" cy="10" r="8" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="timeline-content">
                                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-300">
                                                        <div className="timeline-header mb-3">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                                                        Gestión #{index + 1}
                                                                        {esUltimaGestion && (
                                                                            <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs font-medium px-2 py-0.5 rounded">
                                                                                ÚLTIMA
                                                                            </span>
                                                                        )}
                                                                    </h5>

                                                                    {/* Fecha y hora debajo del título de gestión */}
                                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <div className="flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                            <span className="text-dark font-semibold">{formatearFechaGestion(gestion.fecha_gestion, gestion.origen)}</span>
                                                                        </div>

                                                                        <div className="flex items-center gap-1">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            <span className="text-dark font-semibold">{formatearHoraGestion(gestion.hora_gestion)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${colorOrigen.bg} ${colorOrigen.text}`}>
                                                                        {obtenerDescripcionOrigen(gestion.origen)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="timeline-body">
                                                            <div className={`descripcion-gestion ${claseOrigen} p-3 rounded`}>
                                                                <div className="flex items-start gap-2">
                                                                    <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                        {gestion.gestion || 'Sin descripción registrada'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="metadatos-gestion mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-dark font-medium dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        {obtenerUsuarioGestion(gestion)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pie del documento */}
                            <div className="pie-documento bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex justify-between items-center">
                                    <div className="firma-digital text-center">
                                        <div className="linea-firma w-32 h-px bg-gray-400 dark:bg-gray-600 mx-auto mb-2"></div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Historial generado electrónicamente
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {obtenerFechaActual()}
                                        </p>
                                    </div>

                                    <div className="codigo-consulta text-right">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Cuenta:</span> {historial.cuenta}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Total gestiones: {historial.totalGestiones}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};

export default ModalGestionesJuridicas;