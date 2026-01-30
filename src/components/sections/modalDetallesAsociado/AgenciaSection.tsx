import React from 'react';
import { CastigadoDetalle } from '../../../types/castigados-detalles';

interface AgenciaSectionProps {
    detalle: CastigadoDetalle;
}

const AgenciaSection: React.FC<AgenciaSectionProps> = ({ detalle }) => {
    // Función para formatear teléfonos
    const formatearTelefonos = (telefonos?: string): React.ReactNode => {
        if (!telefonos) return 'No disponible';

        const telefonosArray = telefonos.split(',').map(tel => tel.trim());

        return (
            <div className="space-y-1">
                {telefonosArray.map((tel, index) => (
                    <div key={index} className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">{tel}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-lg font-semibold text-gray-800 dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                INFORMACIÓN DE AGENCIA
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="agencia-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 dark:text-gray-200">Agencia</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Código y nombre</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 mr-3">
                                {detalle.AAUX93 || 'N/A'}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {detalle.DESC03 || 'No disponible'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="agencia-card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 dark:text-gray-200">Dirección</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ubicación de la agencia</p>
                        </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        {detalle.DIRO03 || 'No disponible'}
                    </p>
                </div>

                <div className="agencia-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-lg mr-4">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-800 dark:text-gray-200">Teléfonos</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Contacto de la agencia</p>
                        </div>
                    </div>
                    <div className="telefonos-container">
                        {formatearTelefonos(detalle.TELS03)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgenciaSection;