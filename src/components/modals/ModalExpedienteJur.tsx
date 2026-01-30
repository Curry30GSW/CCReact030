// components/ModalProcesoJuridico.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/modal';
import { useProcesoJuridico } from '../../hooks/useProcesoJuridico';
import { formatearFecha } from '../utils/proceso-juridico';
import IdentificacionProcesoSection from '../../components/sections/modalProcesoJuridico/IdentificacionProcesoSection';
import PartesProcesoSection from '../../components/sections/modalProcesoJuridico/PartesProcesoSection';
import MedidasCautelaresSection from '../../components/sections/modalProcesoJuridico/MedidasCautelaresSection';
import HistorialProcesoSection from '../../components/sections/modalProcesoJuridico/HistorialProcesoSection';
import ModalGestionesJuridicas from '../modals/ModalGestionesJuridicas';

interface ModalProcesoJuridicoProps {
    isOpen: boolean;
    onClose: () => void;
    cuenta: string | null;
    onVerGestion?: (cuenta: string) => void;
}

const ModalProcesoJuridico: React.FC<ModalProcesoJuridicoProps> = ({
    isOpen,
    onClose,
    cuenta
}) => {
    const { proceso, loading, error, cargarProcesoJuridico, limpiarProceso } = useProcesoJuridico();
    const [modalGestionesAbierto, setModalGestionesAbierto] = useState(false);
    const [cuentaParaGestiones, setCuentaParaGestiones] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && cuenta) {
            cargarProcesoJuridico(cuenta);
        } else {
            limpiarProceso();
        }
    }, [isOpen, cuenta, cargarProcesoJuridico, limpiarProceso]);

    // Función para imprimir (similar a la anterior)
    // const imprimirExpediente = () => {
    //     if (!printRef.current) {
    //         alert("No hay contenido para imprimir.");
    //         return;
    //     }

    //     const contenido = printRef.current.innerHTML;
    //     const ventanaImpresion = window.open('', '_blank', 'width=900,height=600');

    //     if (!ventanaImpresion) {
    //         alert("Por favor, permite ventanas emergentes para imprimir.");
    //         return;
    //     }

    //     ventanaImpresion.document.write(`
    //   <!DOCTYPE html>
    //   <html lang="es">
    //   <head>
    //     <meta charset="UTF-8">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     <title>Expediente Jurídico - ${proceso?.DESC05 || 'Proceso'}</title>
    //     <script src="https://cdn.tailwindcss.com"></script>
    //     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    //     <style>
    //       /* Estilos de impresión similares a los anteriores */
    //       ${/* Copia los estilos de impresión de la solución anterior aquí */}
    //     </style>
    //   </head>
    //   <body onload="window.print(); setTimeout(() => window.close(), 500)">
    //     <div class="contenedor-impresion">
    //       ${contenido}
    //     </div>
    //   </body>
    //   </html>
    // `);

    //     ventanaImpresion.document.close();
    // };

    // Función para manejar ver gestión
    const handleVerGestion = (cuentaGestion: string) => {
        setCuentaParaGestiones(cuentaGestion);
        setModalGestionesAbierto(true);
    };

    const handleCloseGestiones = () => {
        setModalGestionesAbierto(false);
        setCuentaParaGestiones(null);
    };

    // Función para obtener fecha actual formateada
    const obtenerFechaActual = () => {
        return new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size="xl"
                className="bg-white dark:bg-gray-900"
            >
                {/* Header del modal */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Expediente Jurídico
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {proceso ? `Cuenta: ${proceso.NCTA29}` : 'Cargando...'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* <button
                                // onClick={imprimirExpediente}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button> */}

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
                    <div ref={printRef}>
                        {loading ? (
                            <div className="flex h-64 items-center justify-center">
                                <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                                <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando expediente jurídico...</p>
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
                                        Sin proceso jurídico registrado
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Esta persona no tiene procesos jurídicos registrados en el sistema.
                                    </p>
                                    {cuenta && (
                                        <button
                                            onClick={() => {
                                                setCuentaParaGestiones(cuenta);
                                                setModalGestionesAbierto(true);
                                            }}
                                            className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            VER GESTIÓN
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : proceso ? (
                            <div className="expediente-juridico space-y-6">
                                {/* Encabezado del expediente */}
                                <div className="encabezado-documento bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="membrete flex items-center justify-between mb-4">
                                        <div className="logo-institucion">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="titulo-documento text-center">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">EXPEDIENTE JURÍDICO</h3>
                                            <p className="numero-expediente text-lg text-gray-700 dark:text-gray-300 mt-1">
                                                No. Expediente Juzgado {proceso.EXPEJUZ29 || 'S/N'}
                                            </p>
                                        </div>

                                        <div className="sello bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg transform rotate-2">
                                            <div className="text-center">
                                                <span className="font-bold text-sm">{proceso.ESTADO29 || 'ACTIVO'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="datos-encabezado flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="text-gray-700 dark:text-gray-300">
                                            <div className="font-semibold">Radicado el: {formatearFecha(proceso.FRAD29)}</div>
                                            <div className="text-sm">No. Cuenta: {proceso.NCTA29} - {proceso.DESC05}</div>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {obtenerFechaActual()}
                                        </div>
                                    </div>
                                </div>

                                {/* Valor vencido destacado */}
                                {proceso.VALOR_VENCIDO && (
                                    <div className="valor-vencido bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 text-center">
                                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                            VALOR VENCIDO: ${Number(proceso.VALOR_VENCIDO).toLocaleString('es-CO')}
                                        </div>
                                    </div>
                                )}

                                {/* Sección de identificación */}
                                <IdentificacionProcesoSection proceso={proceso} />

                                {/* Sección de partes */}
                                <PartesProcesoSection proceso={proceso} />

                                {/* Sección de medidas cautelares */}
                                <MedidasCautelaresSection proceso={proceso} />

                                {/* Sección de historial */}
                                <HistorialProcesoSection
                                    proceso={proceso}
                                    onVerGestion={handleVerGestion}
                                />

                                {/* Pie del documento */}
                                <div className="pie-documento bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="flex justify-between items-center">
                                        <div className="firma-digital text-center">
                                            <div className="linea-firma w-32 h-px bg-gray-400 dark:bg-gray-600 mx-auto mb-2"></div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Expediente generado electrónicamente
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {obtenerFechaActual()}
                                            </p>
                                        </div>

                                        <div className="codigo-consulta text-right">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">Expediente Interno:</span> {proceso.EXPEINT29 || '0000'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </Modal>

            <ModalGestionesJuridicas
                isOpen={modalGestionesAbierto}
                onClose={handleCloseGestiones}
                cuenta={cuentaParaGestiones}
                nombreCliente={proceso?.DESC05 || 'Cliente'}
            />
        </>
    );
};

export default ModalProcesoJuridico;