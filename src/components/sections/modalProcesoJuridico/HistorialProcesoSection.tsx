// components/sections/juridico/HistorialProcesoSection.tsx
import React from 'react';
import { ProcesoJuridico } from '../../../types/proceso-juridico';
import { formatearFechaGeneral, formatearHoraGeneral } from '../../utils/proceso-juridico';

interface HistorialProcesoSectionProps {
    proceso: ProcesoJuridico;
    onVerGestion: (cuenta: string) => void;
}

const HistorialProcesoSection: React.FC<HistorialProcesoSectionProps> = ({ proceso, onVerGestion }) => {
    return (
        <div className="seccion-expediente">
            <div className="flex justify-between items-center mb-4">
                <h4 className="titulo-seccion text-gray-900 dark:text-gray-100 mb-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    HISTORIAL
                </h4>

                <button
                    onClick={() => onVerGestion(proceso.NCTA29)}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-dark hover:bg-yellow-600 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    VER GESTIÓN
                </button>
            </div>

            <div className="timeline-gestiones">
                {/* Evento: Inicio del proceso */}
                <div className="evento-gestion">
                    <div className="timeline-marker">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <circle cx="10" cy="10" r="8" />
                        </svg>
                    </div>
                    <div className="timeline-content">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="timeline-header mb-2">
                                <div className="flex items-center justify-between">
                                    <h5 className="font-semibold text-blue-600 dark:text-blue-400">Inicio del proceso</h5>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatearFechaGeneral(proceso.FCHA29)}
                                    </span>
                                </div>
                            </div>
                            <div className="timeline-body">
                                <p className="text-gray-700 dark:text-gray-300">
                                    Radicado en Juzgado {proceso.JUZG29 || 'juzgado no especificado'} - {proceso.DEJ129 || ''}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evento: Radicación formal */}
                {proceso.FRAD29 && (
                    <div className="evento-gestion">
                        <div className="timeline-marker">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" />
                            </svg>
                        </div>
                        <div className="timeline-content">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="timeline-header mb-2">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-semibold text-green-600 dark:text-green-400">Radicación formal</h5>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatearHoraGeneral(proceso.FRAD29)}
                                        </span>
                                    </div>
                                </div>
                                <div className="timeline-body">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Expediente {proceso.EXPEJUZ29 || 'no especificado'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialProcesoSection;