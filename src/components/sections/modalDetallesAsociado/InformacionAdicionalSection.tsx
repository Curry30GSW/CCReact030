import React from 'react';
import { CastigadoDetalle } from '../../../types/castigados-detalles';

interface InformacionAdicionalSectionProps {
    detalle: CastigadoDetalle;
}

const InformacionAdicionalSection: React.FC<InformacionAdicionalSectionProps> = ({ detalle }) => {
    // Función para formatear fecha de nacimiento
    const formatearFechaNacimiento = (fechaNumero?: number): string => {
        if (!fechaNumero) return 'No disponible';

        const fechaStr = fechaNumero.toString();
        const year = fechaStr.substring(0, 4);
        const month = fechaStr.substring(4, 6);
        const day = fechaStr.substring(6, 8);

        return `${day}/${month}/${year}`;
    };

    // Función para calcular edad
    const calcularEdad = (fechaNumero?: number): string => {
        if (!fechaNumero) return 'No disponible';

        const fechaStr = fechaNumero.toString();
        const year = parseInt(fechaStr.substring(0, 4), 10);
        const month = parseInt(fechaStr.substring(4, 6), 10) - 1;
        const day = parseInt(fechaStr.substring(6, 8), 10);

        const fechaNacimiento = new Date(year, month, day);
        const hoy = new Date();

        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        return `${edad} años`;
    };

    // Función para obtener estado civil
    const obtenerEstadoCivil = (codigo?: string): string => {
        const estados: Record<string, string> = {
            'S': 'Soltero(a)',
            'C': 'Casado(a)',
            'U': 'Unión Libre',
            'D': 'Divorciado(a)',
            'V': 'Viudo(a)',
            'O': 'Otro'
        };

        return codigo ? estados[codigo] || codigo : 'No disponible';
    };

    // Función para obtener HTML del estado civil
    const obtenerEstadoCivilHTML = (codigo?: string): React.ReactNode => {
        const estado = obtenerEstadoCivil(codigo);
        let colorClass = 'text-gray-700 dark:text-gray-300';

        switch (codigo) {
            case 'C':
                colorClass = 'text-green-600 dark:text-green-400';
                break;
            case 'S':
                colorClass = 'text-blue-600 dark:text-blue-400';
                break;
            case 'D':
                colorClass = 'text-red-600 dark:text-red-400';
                break;
            case 'V':
                colorClass = 'text-purple-600 dark:text-purple-400';
                break;
        }

        return (
            <span className={colorClass}>
                {estado}
                {codigo === 'C' && <i className="fas fa-ring ml-2 text-xs text-yellow-500"></i>}
                {codigo === 'S' && <i className="fas fa-user ml-2 text-xs text-blue-500"></i>}
            </span>
        );
    };

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-lg font-semibold text-gray-800 dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                INFORMACIÓN ADICIONAL
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Lugar de nacimiento:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{detalle.LNAC05 || 'No disponible'}</span>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Fecha de nacimiento:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{formatearFechaNacimiento(detalle.FECN05)}</span>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Edad:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{calcularEdad(detalle.FECN05)}</span>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Estado civil:</span>
                    </div>
                    <div className="valor">{obtenerEstadoCivilHTML(detalle.ESTC05)}</div>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Cargo:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{detalle.CARG05 || 'No disponible'}</span>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Vivienda:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{detalle.MVIV05 || 'No Registrada'}</span>
                </div>

                <div className="dato-adicional bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 mr-2 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Vehículo:</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">{detalle.PLAC05 || 'No Registrada'}</span>
                </div>
            </div>
        </div>
    );
};

export default InformacionAdicionalSection;