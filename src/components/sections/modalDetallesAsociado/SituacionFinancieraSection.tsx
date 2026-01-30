import React, { useState } from 'react';
import { Credito } from '../../../types/castigados-detalles';
import Swal from 'sweetalert2';
import { fetchAndBearer } from '../../api/FetchAndBearer';

interface SituacionFinancieraSectionProps {
    creditos?: Credito[];
    creditoOrdinario?: number;
    creditoEspecial?: number;
    cedula?: string;
    cuenta?: string;
    agencia?: string;
}

const SituacionFinancieraSection: React.FC<SituacionFinancieraSectionProps> = ({
    creditos = [],
    creditoOrdinario = 0,
    creditoEspecial = 0,
    cedula = '',
    cuenta = '',
    agencia = ''
}) => {
    // Estados para cada crédito individualmente
    const [pdfStates, setPdfStates] = useState<{
        [key: string]: {
            preview: string | null;
            file: File | null;
            loading: boolean;
        }
    }>({});

    // Función para calcular total crédito
    const calcularTotalCredito = (credito: Credito) => {
        return (credito.saldo_capital || 0) +
            (credito.interes || 0) +
            (credito.interes_mora || 0) +
            (credito.scjo || 0) +
            (credito.interes_contingente || 0);
    };

    // Calcular total castigado
    const totalCastigado = (creditoOrdinario || 0) + (creditoEspecial || 0);

    const [creditosState, setCreditosState] = useState<Credito[]>(creditos);


    // Manejar cambio de archivo para un crédito específico
    const handleFileChange = (numeroCredito: string, file: File | null) => {
        if (file) {
            const preview = URL.createObjectURL(file);
            setPdfStates(prev => ({
                ...prev,
                [numeroCredito]: {
                    ...prev[numeroCredito],
                    preview,
                    file,
                    loading: false
                }
            }));
        } else {
            // Limpiar preview si se elimina el archivo
            if (pdfStates[numeroCredito]?.preview) {
                URL.revokeObjectURL(pdfStates[numeroCredito].preview!);
            }

            setPdfStates(prev => ({
                ...prev,
                [numeroCredito]: {
                    preview: null,
                    file: null,
                    loading: false
                }
            }));
        }
    };

    // Confirmar subida de pagaré
    const handleConfirmarPagaré = async (credito: Credito) => {
        const numeroCredito = credito.numero;
        const currentState = pdfStates[numeroCredito];

        if (!currentState?.file) {
            Swal.fire({
                icon: 'warning',
                title: 'Archivo faltante',
                text: 'Por favor, adjunta un archivo PDF antes de confirmar.'
            });
            return;
        }

        setPdfStates(prev => ({
            ...prev,
            [numeroCredito]: { ...prev[numeroCredito], loading: true }
        }));

        try {
            const formData = new FormData();
            formData.append("cedula", cedula);
            formData.append("cuenta", cuenta);
            formData.append("pagare", numeroCredito);
            formData.append("pagare_pdf", currentState.file);
            formData.append("agencia", agencia);

            const response = await fetchAndBearer("/api/pagares", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en la subida');
            }

            const data = await response.json();
            // 👆 si el backend devuelve el nombre del archivo, mejor

            // ✅ AQUÍ ESTÁ LA CLAVE
            setCreditosState(prev =>
                prev.map(c =>
                    c.numero === numeroCredito
                        ? {
                            ...c,
                            pagare_pdf: data.pagare_pdf || 'subido'
                        }
                        : c
                )
            );

            // Limpiar estado del archivo
            setPdfStates(prev => ({
                ...prev,
                [numeroCredito]: {
                    preview: null,
                    file: null,
                    loading: false
                }
            }));

            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Pagaré cargado correctamente ✅',
                confirmButtonText: 'Aceptar'
            });

        } catch (error: unknown) {
            console.error("Error al cargar pagaré:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cargar el pagaré ❌'
            });
        } finally {
            setPdfStates(prev => ({
                ...prev,
                [numeroCredito]: { ...prev[numeroCredito], loading: false }
            }));
        }
    };


    // Limpiar memoria al desmontar el componente
    React.useEffect(() => {
        return () => {
            Object.values(pdfStates).forEach(state => {
                if (state.preview) {
                    URL.revokeObjectURL(state.preview);
                }
            });
        };
    });

    React.useEffect(() => {
        setCreditosState(creditos);
    }, [creditos]);


    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-gray-900 dark:text-gray-100 mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                SITUACIÓN FINANCIERA
            </h4>

            {/* Créditos detallados */}
            {creditos.length > 0 ? (
                <div className="mb-8">
                    <h5 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        CRÉDITOS CASTIGADOS
                    </h5>

                    <div className="contenedor-cards-horizontal">
                        {creditosState.map((credito, index) => {
                            const totalCredito = calcularTotalCredito(credito);
                            const numeroCredito = credito.numero;
                            const currentState = pdfStates[numeroCredito] || {
                                preview: null,
                                file: null,
                                loading: false
                            };

                            return (
                                <div key={index} className="tarjeta-credito-horizontal">
                                    <div className="encabezado-credito">
                                        <span className="numero-credito font-semibold text-blue-600 dark:text-blue-400">
                                            Pagaré #{credito.numero}
                                        </span>
                                        <span className="tipo-credito text-sm text-gray-600 dark:text-white">
                                            Línea: {credito.tipo_credito}-{credito.descripcion_tipo_credito}
                                        </span>
                                    </div>

                                    <div className="detalle-credito">
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Garantia:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                {credito.moga}-{credito.descripcion_moga}
                                            </span>
                                        </div>
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Saldo Capital:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                ${Number(credito.saldo_capital || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Interés Ordinario:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                ${Number(credito.interes || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Interés de Mora:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                ${Number(credito.interes_mora || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Interés Contingente:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                ${Number(credito.interes_contingente || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="fila-detalle">
                                            <span className="concepto text-gray-600 dark:text-white">Costas Judiciales:</span>
                                            <span className="monto text-gray-800 dark:text-gray-200">
                                                ${Number(credito.scjo || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="fila-detalle total">
                                            <span className="concepto font-semibold text-gray-700 dark:text-gray-300">Total Crédito:</span>
                                            <span className="monto font-bold text-dark dark:text-white">
                                                ${Number(totalCredito).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ===================== SECCIÓN PAGARÉ ===================== */}
                                    <div className="adjuntar-pdf space-y-3">

                                        {/* ===== SI YA EXISTE PAGARÉ ===== */}
                                        {credito.pagare_pdf ? (
                                            <div className="space-y-3">
                                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                    ✔ Pagaré adjunto
                                                </p>

                                                <a
                                                    href={`http://localhost:5000/uploads/${credito.pagare_pdf}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Ver Pagaré
                                                </a>
                                            </div>

                                        ) : (
                                            <>
                                                {/* ===== SUBIDA DE PAGARÉ (LO QUE YA TENÍAS) ===== */}

                                                {/* Selector */}
                                                <div className="file-upload-container">
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        id={`fileInput-${credito.numero}`}
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            handleFileChange(credito.numero, file);
                                                        }}
                                                    />

                                                    <label
                                                        htmlFor={`fileInput-${credito.numero}`}
                                                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                                                    >
                                                        <svg className="mb-2 h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>

                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {currentState.file
                                                                ? `Archivo seleccionado: ${currentState.file.name}`
                                                                : 'Seleccionar archivo PDF'}
                                                        </span>

                                                        {currentState.file && (
                                                            <span className="mt-1 text-xs italic text-gray-500">
                                                                {(currentState.file.size / 1024).toFixed(2)} KB
                                                            </span>
                                                        )}
                                                    </label>
                                                </div>

                                                {/* Preview */}
                                                {currentState.preview && (
                                                    <div className="mt-2">
                                                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Vista previa:
                                                        </p>
                                                        <iframe
                                                            src={currentState.preview}
                                                            className="h-48 w-full rounded-lg border border-gray-300 dark:border-gray-600"
                                                            title={`Previsualización Pagaré ${credito.numero}`}
                                                        />
                                                    </div>
                                                )}

                                                {/* Botón Confirmar */}
                                                <button
                                                    onClick={() => handleConfirmarPagaré(credito)}
                                                    disabled={!currentState.file || currentState.loading}
                                                    className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition flex items-center justify-center gap-2
          ${currentState.file && !currentState.loading
                                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {currentState.loading ? 'Subiendo...' : 'Confirmar Subida'}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">No se encontraron créditos registrados</p>
                </div>
            )}

            {/* Resumen financiero */}
            <div className="resumen-financiero">
                <div className="dato-financiero">
                    <span className="concepto text-gray-700 dark:text-gray-300">Crédito Ordinario</span>
                    <span className="monto text-gray-800 dark:text-gray-200">
                        ${Number(creditoOrdinario || 0).toLocaleString()}
                    </span>
                </div>

                <div className="dato-financiero">
                    <span className="concepto text-gray-700 dark:text-gray-300">Crédito Especial</span>
                    <span className="monto text-gray-800 dark:text-gray-200">
                        ${Number(creditoEspecial || 0).toLocaleString()}
                    </span>
                </div>

                <div className="dato-financiero total">
                    <span className="concepto font-bold dark:text-dark">TOTAL CASTIGADO</span>
                    <span className="monto monto-blink font-bold text-red-800 dark:text-red-400">
                        ${Number(totalCastigado).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SituacionFinancieraSection;