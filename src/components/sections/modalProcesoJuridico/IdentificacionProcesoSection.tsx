import React from 'react';
import { ProcesoJuridico } from '../../../types/proceso-juridico';
import { formatearFecha, determinarZonaJuridica, obtenerClaseEstado } from '../../utils/proceso-juridico';

interface IdentificacionProcesoSectionProps {
    proceso: ProcesoJuridico;
}

const IdentificacionProcesoSection: React.FC<IdentificacionProcesoSectionProps> = ({ proceso }) => {
    const zonaJuridica = determinarZonaJuridica(proceso.AGENCIA29);

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-gray-900 dark:text-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                IDENTIFICACIÓN DEL PROCESO
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="dato-legal bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="etiqueta font-medium text-gray-700 dark:text-gray-300">Juzgado:</span>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {proceso.JUZG29 || 'No asignado'} - {proceso.DEJ129 || ''}
                    </span>
                </div>

                <div className="dato-legal bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="etiqueta font-medium text-gray-700 dark:text-gray-300">Zona Jurídica:</span>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {zonaJuridica.codigo} - {zonaJuridica.nombre}
                    </span>
                </div>

                <div className="dato-legal bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="etiqueta font-medium text-gray-700 dark:text-gray-300">Expediente Interno:</span>
                    <span className="valor text-gray-800 dark:text-gray-200 font-mono">
                        {proceso.EXPEINT29 || '0000'}
                    </span>
                </div>

                <div className="dato-legal bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="etiqueta font-medium text-gray-700 dark:text-gray-300">Fecha Expediente:</span>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {formatearFecha(proceso.FCHA29)}
                    </span>
                </div>

                <div className="dato-legal bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="etiqueta font-medium text-gray-700 dark:text-gray-300">Estado Actual:</span>
                    <span className={`valor px-3 py-1 rounded-full text-xs font-medium ${obtenerClaseEstado(proceso.ESTADO29)}`}>
                        {proceso.ES_DESCR || 'Activo'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default IdentificacionProcesoSection;