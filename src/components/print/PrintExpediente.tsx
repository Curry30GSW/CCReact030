import React from 'react';
import { CastigadoDetalle } from '../../types/castigados-detalles';

interface PrintExpedienteProps {
    detalle: CastigadoDetalle;
    onClose?: () => void;
}

const PrintExpediente: React.FC<PrintExpedienteProps> = ({ onClose }) => {
    const imprimir = () => {
        window.print();
        if (onClose) setTimeout(onClose, 100);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-900 bg-opacity-75 print:bg-white print:relative">
            <div className="min-h-screen py-8 px-4 print:py-0 print:px-0">
                <div className="relative mx-auto w-full max-w-6xl rounded-lg bg-white shadow-xl print:shadow-none">
                    {/* Header de control de impresión */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 print:hidden">
                        <h2 className="text-lg font-semibold text-gray-800">Vista Previa de Impresión</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={imprimir}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contenido a imprimir */}
                    <div className="p-8 print:p-0">
                        <div className="expediente-impreso">
                            {/* Mismo contenido que en la modal */}
                            {/* ... */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintExpediente;