// components/sections/juridico/MedidasCautelaresSection.tsx
import React from 'react';
import { ProcesoJuridico } from '../../../types/proceso-juridico';
import { parsearMedidasCautelares, formatearFecha } from '../../utils/proceso-juridico';

interface MedidasCautelaresSectionProps {
    proceso: ProcesoJuridico;
}

const MedidasCautelaresSection: React.FC<MedidasCautelaresSectionProps> = ({ proceso }) => {
    const medidas = parsearMedidasCautelares(proceso.MEDIDAS_DETALLE);

    if (medidas.length === 0) {
        return (
            <div className="seccion-expediente">
                <h4 className="titulo-seccion text-gray-900 dark:text-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    MEDIDAS CAUTELARES
                </h4>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        No se han registrado medidas cautelares
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay medidas cautelares registradas para este proceso
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-gray-900 dark:text-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                MEDIDAS CAUTELARES
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medidas.map((medida, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="bg-green-600 dark:bg-green-800 p-3 text-white">
                            <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-sm">{medida.tipo}</h5>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="mb-3">
                                <div className="text-xs text-dark font-medium dark:text-gray-400 mb-1">Observación</div>
                                <p className="text-sm text-dark dark:text-gray-300">
                                    {medida.observacion || 'Sin observaciones registradas'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <div className="text-xs text-dark dark:text-gray-400">Fecha</div>
                                    <div className="text-dark dark:text-gray-300">
                                        {formatearFecha(parseInt(medida.fecha))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Usuario</div>
                                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                                        {medida.usuario || 'Sin usuario'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedidasCautelaresSection;