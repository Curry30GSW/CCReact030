import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchAndBearer } from "../api/FetchAndBearer";
import { Modal } from '../ui/modal';

interface ModalCrearGestionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface ClienteInfo {
    agencia: string;
    nombre: string;
    cedula: string;
    cuenta: string;
    nomina: string;
    valorCastigado: string;
}

export default function ModalCrearGestion({
    isOpen,
    onClose,
    onSuccess
}: ModalCrearGestionProps) {
    const [busqueda, setBusqueda] = useState("");
    const [buscarPor, setBuscarPor] = useState<"cedula" | "cuenta">("cedula");
    const [loading, setLoading] = useState(false);
    const [clienteEncontrado, setClienteEncontrado] = useState<ClienteInfo | null>(null);
    const [gestion, setGestion] = useState("");
    const [caracteresRestantes, setCaracteresRestantes] = useState(250);

    const MAX_CARACTERES = 250;

    useEffect(() => {
        if (!isOpen) {
            setBusqueda("");
            setClienteEncontrado(null);
            setGestion("");
            setCaracteresRestantes(MAX_CARACTERES);
        }
    }, [isOpen]);

    useEffect(() => {
        setCaracteresRestantes(MAX_CARACTERES - gestion.length);
    }, [gestion]);

    const buscarCliente = async () => {
        if (!busqueda.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Campo vacío",
                text: `Por favor ingrese una ${buscarPor === "cedula" ? "cédula" : "cuenta"}`,
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetchAndBearer(
                `/api/buscar-cliente?tipo=${buscarPor}&valor=${busqueda}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    Swal.fire({
                        icon: "error",
                        title: "No encontrado",
                        text: `No se encontró un cliente con ${buscarPor === "cedula" ? "esa cédula" : "esa cuenta"}`,
                    });
                } else {
                    throw new Error("Error en la búsqueda");
                }
                return;
            }

            const data = await response.json();

            if (data && data.length > 0) {
                const cliente = data[0];

                setClienteEncontrado({
                    agencia: (cliente.AAUX93 && cliente.DESC03)
                        ? `${cliente.AAUX93} - ${cliente.DESC03}`
                        : "No disponible",
                    nombre: cliente.DCTA93 || "No disponible",
                    cedula: cliente.NNIT93 || busqueda,
                    cuenta: cliente.NCTA93 || "No disponible",
                    nomina: cliente.DNOM93 || "No disponible",
                    valorCastigado: cliente.ESCR93
                        ? `$ ${Number(cliente.ESCR93).toLocaleString("es-CO")}`
                        : "No disponible",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "No encontrado",
                    text: `No se encontró un cliente con ${buscarPor === "cedula" ? "esa cédula" : "esa cuenta"}`,
                });
                setClienteEncontrado(null);
            }

        } catch (error) {
            console.error("Error buscando cliente:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Ocurrió un error al buscar el cliente",
            });
            setClienteEncontrado(null);
        } finally {
            setLoading(false);
        }
    };

    const guardarGestion = async () => {
        if (!clienteEncontrado) {
            Swal.fire({
                icon: "warning",
                title: "Cliente requerido",
                text: "Primero debe buscar y seleccionar un cliente",
            });
            return;
        }

        if (!gestion.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Gestión vacía",
                text: "Debe ingresar una gestión",
            });
            return;
        }

        if (gestion.length > MAX_CARACTERES) {
            Swal.fire({
                icon: "warning",
                title: "Límite excedido",
                text: `La gestión no puede superar ${MAX_CARACTERES} caracteres`,
            });
            return;
        }

        try {

            const response = await fetchAndBearer("/api/gestion", {
                method: "POST",
                body: JSON.stringify({
                    cedula: clienteEncontrado.cedula,
                    nombre: clienteEncontrado.nombre.toUpperCase(),
                    cuenta: clienteEncontrado.cuenta,
                    gestion: gestion.trim().toUpperCase()
                }),
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Sesión expirada",
                    text: "Por favor inicie sesión nuevamente",
                }).then(() => {
                    window.location.href = "/auth";
                });
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al guardar la gestión");
            }

            await response.json();
            onClose();

            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Gestión registrada correctamente ✅",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                if (onSuccess) onSuccess();
            });

        } catch (error: unknown) {
            console.error("Error guardando gestión:", error);
            const errorMessage = error instanceof Error ? error.message : "No se pudo registrar el acta de gestión";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });
        }
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            buscarCliente();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="max-h-[90vh] overflow-hidden border-0"
        >
            {/* Header profesional jurídico */}
            <div className="sticky top-0 z-20 border-b border-gray-200 bg-gradient-to-r from-[#1a3a2f] to-[#005E56] px-6 py-4 dark:border-gray-700">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-white/10 p-2">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Acta de Diligencia Jurídica</h3>
                            <p className="text-xs text-white/80">Sistema de Gestión de Cartera Castigada</p>
                        </div>
                    </div>
                </div>

                {/* Línea de tiempo integrada en header */}
                <div className="relative">
                    {/* Línea de conexión */}
                    <div className="absolute left-0 right-0 top-3.5 h-0.5 bg-gray-300/30 dark:bg-gray-600/50"></div>

                    <div className="relative z-10 flex justify-between">
                        {/* Paso 1 */}
                        <div className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${busqueda ? 'bg-white text-[#005E56] shadow-md' : 'bg-white/30 text-white'}`}>
                                1
                            </div>
                            <span className="mt-1.5 text-xs font-medium text-white/90">Identificación</span>
                        </div>

                        {/* Paso 2 */}
                        <div className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${clienteEncontrado ? 'bg-white text-[#005E56] shadow-md' : 'bg-white/30 text-white'}`}>
                                2
                            </div>
                            <span className="mt-1.5 text-xs font-medium text-white/90">Verificación</span>
                        </div>

                        {/* Paso 3 */}
                        <div className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${gestion.trim() ? 'bg-white text-[#005E56] shadow-md' : 'bg-white/30 text-white'}`}>
                                3
                            </div>
                            <span className="mt-1.5 text-xs font-medium text-white/90">Acta</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {/* Paso 1: Identificación */}
                <div className="mb-4">
                    <h1 className="mb-1 text-md font-semibold text-gray-800 dark:text-white">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-md dark:bg-gray-700">1</span>
                        Identificación del Asociado
                    </h1>

                    <div className="mb-1">
                        <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
                            Seleccione criterio de búsqueda
                        </label>
                        <div className="mb-3 inline-flex rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-700">
                            <button
                                type="button"
                                onClick={() => setBuscarPor("cedula")}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${buscarPor === "cedula"
                                    ? "bg-white shadow-sm text-[#005E56] dark:bg-gray-800 dark:text-white"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    }`}
                            >
                                Cédula de Ciudadanía
                            </button>
                            <button
                                type="button"
                                onClick={() => setBuscarPor("cuenta")}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${buscarPor === "cuenta"
                                    ? "bg-white shadow-sm text-[#005E56] dark:bg-gray-800 dark:text-white"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    }`}
                            >
                                Número de Cuenta
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={`Ingrese ${buscarPor === "cedula" ? "número de cédula" : "número de cuenta"}`}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-[#005E56] focus:outline-none focus:ring-2 focus:ring-[#005E56]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={buscarCliente}
                                disabled={loading || !busqueda.trim()}
                                className="rounded-lg bg-gradient-to-r from-[#1a3a2f] to-[#005E56] px-4 py-2.5 text-xs font-medium text-white shadow-sm hover:from-[#153026] hover:to-[#004a44] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Consultando
                                    </div>
                                ) : (
                                    "Verificar Identidad"
                                )}
                            </button>
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">
                            {buscarPor === "cedula" ? "Ejemplo: 1019059411" : "Ejemplo: 122613"}
                        </p>
                    </div>
                </div>

                {/* Paso 2: Información del Cliente */}
                {clienteEncontrado && (
                    <div className="mb-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:border-green-600 dark:bg-gray-900/30">
                        <h1 className="mb-3 text-md font-semibold text-gray-800 dark:text-white">
                            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-md text-white">2</span>
                            Información del Asociado Verificada
                        </h1>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Agencia</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{clienteEncontrado.agencia}</span>
                                </div>
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Nombre Completo</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{clienteEncontrado.nombre}</span>
                                </div>
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Documento</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{clienteEncontrado.cedula}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Número de Cuenta</span>
                                    <span className="text-sm font-medium text-[#005E56] dark:text-white">{clienteEncontrado.cuenta}</span>
                                </div>
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Nómina</span>
                                    <span className="text-sm font-medium text-gray-800 dark:text-white">{clienteEncontrado.nomina}</span>
                                </div>
                                <div className="rounded bg-white p-2 dark:bg-gray-800">
                                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#005E56] dark:text-[#4fd1c7]">Valor Castigado</span>
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{clienteEncontrado.valorCastigado}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Paso 3: Acta de Diligencia */}
                {clienteEncontrado && (
                    <div>
                        <h1 className="mb-1 text-md font-semibold text-gray-800 dark:text-white">
                            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-md text-white">3</span>
                            Acta de Diligencia Jurídica
                        </h1>

                        <div className="relative">
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Narrativa de la Gestión Realizada
                                </label>
                                <span className={`text-xs font-medium ${caracteresRestantes < 50 ? 'text-red-500' : 'text-blue-600'}`}>
                                    {caracteresRestantes} caracteres disponibles
                                </span>
                            </div>

                            <textarea
                                value={gestion}
                                onChange={(e) => setGestion(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                placeholder="Ingrese la narrativa detallada de la gestión realizada con el asociado..."
                                maxLength={MAX_CARACTERES}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
                <div className="flex items-center justify-end">
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancelar Proceso
                        </button>
                        <button
                            onClick={guardarGestion}
                            disabled={!clienteEncontrado || !gestion.trim() || gestion.length > MAX_CARACTERES}
                            className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#1a3a2f] to-[#005E56] px-4 py-2 text-xs font-medium text-white shadow-sm hover:from-[#153026] hover:to-[#004a44] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Guardar Gestión
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}