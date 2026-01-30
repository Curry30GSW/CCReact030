import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import { CastigadoDetalle } from '../../types/castigados-detalles';
import { fetchAndBearer } from '../../components/api/FetchAndBearer';
import DatosAsociadoSection from '../sections/modalDetallesAsociado/DatosAsociadoSection';
import SituacionFinancieraSection from '../sections/modalDetallesAsociado/SituacionFinancieraSection';
import ReferenciasSection from '../sections/modalDetallesAsociado/ReferenciasSection';
import AgenciaSection from '../sections/modalDetallesAsociado/AgenciaSection';
import InformacionAdicionalSection from '../sections/modalDetallesAsociado/InformacionAdicionalSection';
import ContactoSection from '../sections/modalDetallesAsociado/ContactoSection';

interface FotoAsociado {
    cedula: string;
    contentType: string;
    imageBase64: string;
}

interface ModalDetalleAsociadoProps {
    isOpen: boolean;
    onClose: () => void;
    cedula: string | null;
}

const ModalDetalleAsociado: React.FC<ModalDetalleAsociadoProps> = ({
    isOpen,
    onClose,
    cedula
}) => {
    const [detalle, setDetalle] = useState<CastigadoDetalle | null>(null);
    const [foto, setFoto] = useState<FotoAsociado | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingFoto, setLoadingFoto] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && cedula) {
            cargarDetallesAsociado(cedula);
            cargarFotoAsociado(cedula);
        } else {
            resetStates();
        }
    }, [isOpen, cedula]);

    const resetStates = () => {
        setDetalle(null);
        setFoto(null);
        setError(null);
        setLoading(false);
        setLoadingFoto(false);
    };

    const cargarDetallesAsociado = async (cedulaParam: string) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetchAndBearer(`/api/castigos/${cedulaParam}`);

            if (!res.ok) {
                throw new Error('Error al cargar los datos del asociado');
            }

            const data = await res.json();
            setDetalle(data[0] || data);

        } catch (error) {
            console.error('Error cargando detalles:', error);
            setError(`Error al cargar los detalles: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const cargarFotoAsociado = async (cedulaParam: string) => {
        try {
            setLoadingFoto(true);
            const res = await fetch(`http://localhost:5000/api/fotos/${cedulaParam}`);

            if (!res.ok) {
                setFoto(null);
                return;
            }

            const data: FotoAsociado = await res.json();
            setFoto(data);

        } catch (error) {
            console.error('Error cargando foto:', error);
            setFoto(null);
        } finally {
            setLoadingFoto(false);
        }
    };

    // const imprimirHistorial = () => {
    //     window.print();
    // };

    // Construir URL de la imagen
    const fotoUrl = foto?.imageBase64 && foto?.contentType
        ? `data:${foto.contentType};base64,${foto.imageBase64}`
        : null;

    // Función para formatear fecha
    const formatearFecha = () => {
        return new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="bg-white dark:bg-gray-900"
            creditos={detalle?.creditos || []}
        >
            {/* Header del modal */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Expediente de Asociado
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {detalle ? `Nombre: ${detalle.DCTA93 || 'No disponible'}` : 'Cargando...'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            {detalle ? `Cuenta: ${detalle.NCTA93 || 'No disponible'}` : 'Cargando...'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <button
                            onClick={imprimirHistorial}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
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
            <div className="print-area">
                <div className="overflow-y-auto px-6 py-4 max-h-[70vh]">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full"></div>
                            <p className="ml-3 text-gray-600 dark:text-gray-400">Cargando detalles del asociado...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
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
                    ) : detalle ? (
                        <div className="space-y-6">
                            {/* Encabezado con foto */}
                            <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        {/* Contenedor de la foto */}
                                        <div className="relative">
                                            <div className="h-40 w-40 rounded-lg border-3 border-white bg-gray-100 shadow-lg overflow-hidden dark:border-gray-800 dark:bg-gray-800">
                                                {loadingFoto ? (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                                    </div>
                                                ) : fotoUrl ? (
                                                    <img
                                                        src={fotoUrl}
                                                        alt={`Foto de ${detalle.DCTA93}`}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            console.error('Error cargando la imagen');
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                        <svg
                                                            className="h-12 w-12 text-gray-400 dark:text-gray-500"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="1.5"
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                            Sin foto
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {fotoUrl && (
                                                <div className="absolute -bottom-2 -right-2">
                                                    <div className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-sm">
                                                        Foto
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                                EXPEDIENTE DE ASOCIADO
                                            </h2>
                                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                                No. Cuenta: <span className="font-bold">{detalle.NCTA93 || 'S/N'}</span>
                                            </p>
                                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                                Nombre: <span className="font-bold">{detalle.DCTA93 || 'No disponible'}</span>
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    Cédula: {Number(detalle.NNIT93).toLocaleString('es-CO') || 'No registrada'}
                                                </span>
                                                {fotoUrl && (
                                                    <span className="rounded bg-green-100 px-3 py-1 text-md font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Foto disponible
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="inline-block rounded-lg border-2 border-red-400 bg-white px-4 py-2 shadow-sm dark:border-red-600 dark:bg-gray-800">
                                            <span className="font-bold text-red-600 dark:text-red-400">CARTERA CASTIGADA</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Corte: {formatearFecha()}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Agencia: </span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {detalle.AAUX93} - {detalle.DESC03}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Secciones de contenido */}
                            <div className="grid gap-6">
                                <DatosAsociadoSection detalle={detalle} />

                                <SituacionFinancieraSection
                                    creditos={detalle.creditos || []}
                                    creditoOrdinario={detalle.ORCR93}
                                    creditoEspecial={detalle.ESCR93}
                                    cedula={detalle.NNIT93?.toString() || ''}
                                    cuenta={detalle.NCTA93 || ''}
                                    agencia={detalle.AAUX93 || ''}
                                />

                                <ContactoSection detalle={detalle} />

                                <ReferenciasSection detalle={detalle} />

                                <InformacionAdicionalSection detalle={detalle} />

                                <AgenciaSection detalle={detalle} />
                            </div>

                            {/* Pie del documento */}
                            <div className="rounded-lg border-t-4 border-blue-500 bg-white p-6 shadow-sm dark:border-blue-400 dark:bg-gray-800">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 h-px w-32 bg-gray-300 dark:bg-gray-700"></div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Expediente generado electrónicamente
                                    </p>
                                    <div className="mt-3 flex items-center justify-center gap-4">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Cédula:</span> {Number(detalle.NNIT93).toLocaleString('es-CO')}
                                        </div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Cuenta:</span> {detalle.NCTA93}
                                        </div>
                                        {fotoUrl && (
                                            <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
                                                <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-xs font-medium text-green-800 dark:text-green-200">Foto verificada</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                                        {formatearFecha()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
};

export default ModalDetalleAsociado;