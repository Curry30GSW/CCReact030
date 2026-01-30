import React from 'react';
import { CastigadoDetalle } from '../../../types/castigados-detalles';

interface ContactoSectionProps {
    detalle: CastigadoDetalle;
}

const ContactoSection: React.FC<ContactoSectionProps> = ({ detalle }) => {
    // Función para validar y formatear email
    const formatearEmail = (email?: string): React.ReactNode => {
        if (!email || email === 'No disponible') {
            return (
                <span className="text-dark dark:text-white italic">No disponible</span>
            );
        }

        return (
            <a
                href={`mailto:${email}`}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
            </a>
        );
    };

    // Función para validar y formatear teléfono
    const formatearTelefono = (telefono?: string, tipo: 'fijo' | 'celular' = 'fijo'): React.ReactNode => {
        if (!telefono || telefono === 'No disponible') {
            return (
                <span className="text-dark dark:text-white italic">No disponible</span>
            );
        }

        const icon = tipo === 'celular' ? (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        );

        return (
            <a
                href={`tel:${telefono.replace(/\s/g, '')}`}
                className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
            >
                {icon}
                {telefono}
            </a>
        );
    };

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-lg font-semibold text-gray-800 dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                INFORMACIÓN DE CONTACTO
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="contacto-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md mr-3">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Dirección</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Residencia principal</p>
                        </div>
                    </div>
                    <p className="text-dark dark:text-gray-300 pl-11">
                        {detalle.DIRE05 || 'No disponible'}
                    </p>
                </div>

                <div className="contacto-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md mr-3">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Teléfono Fijo</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Línea residencial</p>
                        </div>
                    </div>
                    <div className="pl-11">
                        {formatearTelefono(detalle.TELE05, 'fijo')}
                    </div>
                </div>

                <div className="contacto-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md mr-3">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Celular</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono móvil</p>
                        </div>
                    </div>
                    <div className="pl-11">
                        {formatearTelefono(detalle.TCEL05, 'celular')}
                    </div>
                </div>

                <div className="contacto-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-md mr-3">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">Correo Electrónico</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email principal</p>
                        </div>
                    </div>
                    <div className="pl-11">
                        {formatearEmail(detalle.MAIL05)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactoSection;