// components/sections/juridico/PartesProcesoSection.tsx
import React from 'react';
import { ProcesoJuridico } from '../../../types/proceso-juridico';
import { obtenerDescripcionZona } from '../../utils/proceso-juridico';

interface PartesProcesoSectionProps {
    proceso: ProcesoJuridico;
}

const PartesProcesoSection: React.FC<PartesProcesoSectionProps> = ({ proceso }) => {
    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-gray-900 dark:text-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                PARTES
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tarjeta de Abogado */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 overflow-hidden">
                    <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h5 className="text-lg font-semibold">ABOGADO RESPONSABLE</h5>
                        </div>
                    </div>

                    <div className="p-5">
                        {proceso.NOM ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Nombre completo</div>
                                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                            {proceso.NOM} {proceso.APE1} {proceso.APE2 || ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Identificación</div>
                                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                            {proceso.CABO29 || 'No registrada'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Zona Jurídica</div>
                                        <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                            {proceso.ZONA} - {obtenerDescripcionZona(proceso.ZONA)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No hay abogado asignado</h4>
                                {proceso.CABO29 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Cédula registrada: {proceso.CABO29}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tarjeta de Demandado */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-700 overflow-hidden">
                    <div className="bg-red-600 dark:bg-red-800 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h5 className="text-lg font-semibold">DEMANDADO</h5>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Nombre</div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                    {proceso.DESC05 || 'No disponible'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Identificación</div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                    {proceso.NNIT05 || 'No registrada'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">N° Cuenta</div>
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200 font-mono">
                                    {proceso.NCTA29}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartesProcesoSection;