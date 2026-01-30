import React from 'react';
import { CastigadoDetalle } from '../../../types/castigados-detalles';

// Definir estados del asociado
const estadosAsociado: Record<number, { texto: string; clase: string }> = {
    0: { texto: 'ACTIVO', clase: 'bg-green-600 text-white' },
    2: { texto: 'RETIRADO', clase: 'bg-red-600 text-white' },
    3: { texto: 'CODEUDOR', clase: 'bg-blue-600 text-white' },
    4: { texto: 'CUENTAS CONTROL', clase: 'bg-blue-500 text-white' },
    5: { texto: 'BENEFICIARIO FALLECIDO', clase: 'bg-purple-600 text-white' },
    6: { texto: 'CUENTA H', clase: 'bg-yellow-500 text-black' },
    7: { texto: 'CUENTA FRAUDE', clase: 'bg-yellow-600 text-black' },
    8: { texto: 'STAND BY', clase: 'bg-yellow-400 text-black' },
    9: { texto: 'BLOQUEADO CONSEJO', clase: 'bg-red-700 text-white' }
};


interface DatosAsociadoSectionProps {
    detalle: CastigadoDetalle;
}

const DatosAsociadoSection: React.FC<DatosAsociadoSectionProps> = ({ detalle }) => {
    // Función para formatear fecha
    const formatearFecha = (fechaNumero?: number): string | null => {
        if (!fechaNumero || fechaNumero === 0) return null;

        try {
            const fechaStr = fechaNumero.toString().padStart(8, '0');
            const year = fechaStr.substring(0, 4);
            const month = fechaStr.substring(4, 6);
            const day = fechaStr.substring(6, 8);

            return `${day}/${month}/${year}`;
        } catch {
            return null;
        }
    };


    function formatearFechaCast(fechaNumero?: number | string): string {
        if (!fechaNumero) return 'No disponible';

        const fechaRaw = String(19000000 + parseInt(String(fechaNumero)));
        const anio = fechaRaw.substring(0, 4);
        const mesNumero = parseInt(fechaRaw.substring(4, 6)) - 1; // JS usa 0-11
        const dia = fechaRaw.substring(6, 8);
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return `${dia}/${meses[mesNumero]}/${anio}`;
    }

    // Función para obtener badge de score
    const getScoreBadge = (score?: string | number): React.ReactNode => {
        if (!score) {
            return (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-md font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    No disponible
                </span>
            );
        }

        const scoreNum = typeof score === 'string' ? Number(score) : score;

        let colorClass = '';
        let textColor = '';
        let label: string | number = score; // 👈 texto visible por defecto

        // 1️⃣ Casos especiales (STRING)
        if (score === 'S/E') {
            colorClass = 'bg-yellow-100 dark:bg-yellow-900/30';
            textColor = 'text-yellow-800 dark:text-yellow-300';

        } else if (score === 'CANCELADA POR MUERTE') {
            colorClass = 'bg-purple-800 dark:bg-purple-900';
            textColor = 'text-white dark:text-white';
            label = 'Q.E.P.D'; // 👈 reemplazo visible

        } else if (score === 'F/D') {
            colorClass = 'bg-dark dark:bg-dark';
            textColor = 'text-white dark:text-white';
        }

        // 2️⃣ Casos numéricos
        else if (!isNaN(scoreNum)) {
            if (scoreNum >= 700) {
                colorClass = 'bg-blue-600 dark:bg-blue-600';
                textColor = 'text-white dark:text-white';

            } else if (scoreNum >= 500) {
                colorClass = 'bg-yellow-100 dark:bg-yellow-900/30';
                textColor = 'text-yellow-800 dark:text-yellow-300';

            } else {
                colorClass = 'bg-red-600 dark:bg-red-600';
                textColor = 'text-white dark:text-white';
            }
        }

        // 3️⃣ Fallback defensivo
        else {
            colorClass = 'bg-gray-200 dark:bg-gray-700';
            textColor = 'text-gray-700 dark:text-gray-300';
        }

        return (
            <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colorClass} ${textColor}`}
            >
                <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-70"></span>
                {label}
            </span>
        );
    };

    // Función para obtener semáforo HTML
    const getSemaforoHTML = (fechaInsercion?: string): React.ReactNode => {
        if (!fechaInsercion) {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-600"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-600"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-600 dark:bg-gray-600"></div>
                    </div>
                    <span className="text-sm text-gray-800 dark:text-gray-400">Sin información</span>
                </div>
            );
        }

        const fecha = new Date(fechaInsercion);
        const hoy = new Date();
        const diffTime = hoy.getTime() - fecha.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let estado = '';
        let color = '';

        if (diffDays <= 170) {
            estado = 'Vigente';
            color = 'text-green-600 dark:text-green-400';

        } else if (diffDays >= 171 && diffDays <= 179) {
            estado = 'Moderado';
            color = 'text-yellow-600 dark:text-yellow-400';

        } else if (diffDays >= 180) {
            estado = 'Vencido';
            color = 'text-red-600 dark:text-red-400';
        }


        return (
            <div className="flex items-center gap-3">
                <div className="semaforo flex gap-1">
                    <div className={`h-4 w-4 rounded-full ${diffDays < 170 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`h-4 w-4 rounded-full ${diffDays >= 171 && diffDays < 180 ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`h-4 w-4 rounded-full ${diffDays >= 180 ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                </div>
                <div>
                    <span className={`text-md font-medium ${color}`}>{estado}</span>
                    <div className="text-md text-gray-900 dark:text-gray-400">{diffDays} días</div>
                </div>
            </div>
        );
    };

    return (
        <div className="seccion-expediente">
            <div className="mb-6 flex items-center justify-between">
                <h4 className="titulo-seccion text-gray-900 dark:text-gray-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    DATOS DEL ASOCIADO
                </h4>

                <div className="flex items-center gap-2">
                    {detalle.INDC05 !== undefined && estadosAsociado[Number(detalle.INDC05)] && (
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
                            ${estadosAsociado[Number(detalle.INDC05)].clase}`}
                        >
                            {estadosAsociado[Number(detalle.INDC05)].texto}
                        </span>
                    )}


                    {detalle.FRIP05 !== 0 && detalle.FRIP05 !== undefined && (
                        <span className="rounded-full bg-purple-500 px-3 py-1 text-xs font-medium text-white">
                            <svg className="mr-1 inline h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.795-.833-2.565 0L5.347 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Q.E.P.D
                        </span>
                    )}

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nombre completo */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Nombre completo</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {detalle.DCTA93 || 'No disponible'}
                    </span>
                </div>

                {/* Cédula */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Cédula</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {detalle.NNIT93 ? Number(detalle.NNIT93).toLocaleString('es-CO') : 'No registrada'}
                    </span>
                </div>


                {/* Nómina */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Nómina</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {detalle.DNOM93 || 'No disponible'}
                    </span>
                </div>


                {/* Recaudación */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Recaudación</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {detalle.DIST93 || '0'}-{detalle.DEPE93 || '0'} {detalle.DDEP93 || ''}
                    </span>
                </div>

                {/* Fecha de castigo */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">Fecha de castigo</span>
                    </div>
                    <span className="valor text-gray-800 dark:text-gray-200">
                        {typeof detalle.FTAG05 === 'string' || typeof detalle.FTAG05 === 'number'
                            ? formatearFechaCast(detalle.FTAG05)
                            : 'No disponible'}
                    </span>
                </div>


                {/* Score Datacrédito */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">
                            Score DATACRÉDITO
                        </span>
                    </div>

                    <span className="valor text-gray-800 dark:text-gray-200">
                        {getScoreBadge(detalle.Score)}
                    </span>
                </div>


                {/* Vigencia */}
                <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 mr-2 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="etiqueta font-medium text-gray-900 dark:text-gray-400">
                            Vigencia
                        </span>
                    </div>

                    <span className="valor text-gray-800 dark:text-gray-200">
                        {getSemaforoHTML(detalle.FechaInsercion)}
                    </span>
                </div>


                {/* Fecha fallecido */}
                {typeof detalle.FRIP05 === 'number' && detalle.FRIP05 > 0 && (
                    <div className="dato-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-3">
                            <svg
                                className="w-6 h-6 mr-2 text-red-600 dark:text-red-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.795-.833-2.565 0L5.347 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                            <span className="etiqueta font-medium text-red-600 dark:text-red-400">
                                Fecha fallecido
                            </span>
                        </div>

                        <span className="valor text-red-700 dark:text-red-300 font-semibold">
                            {formatearFecha(detalle.FRIP05)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatosAsociadoSection;