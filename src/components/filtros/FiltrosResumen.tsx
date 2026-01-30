import React from 'react';
import { FiltrosResumenState, AnioFiltro } from '../../types/resumen';

interface FiltrosResumenProps {
    filtros: FiltrosResumenState;
    anios: AnioFiltro[];
    todasSeleccionadas: boolean;
    onCambiarFiltro: (campo: keyof FiltrosResumenState, valor: any) => void;
    onToggleFecha: (anio: string) => void;
    onToggleTodasFechas: () => void;
    onLimpiarFiltros: () => void;
}

const FiltrosResumen: React.FC<FiltrosResumenProps> = ({
    filtros,
    anios,
    todasSeleccionadas,
    onCambiarFiltro,
    onToggleFecha,
    onToggleTodasFechas,
    onLimpiarFiltros
}) => {
    const [mostrarFiltros, setMostrarFiltros] = React.useState(false);

    return (
        <div>
            {/* Botón para mostrar/ocultar filtros */}
            <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="
                    inline-flex items-center gap-2
                    rounded-lg
                    border border-amber-600
                    bg-amber-100
                    px-3.5 py-2
                    text-sm font-medium
                    text-amber-700
                    shadow-theme-xs
                    hover:bg-amber-200 hover:text-amber-800
                    dark:border-amber-500
                    dark:bg-amber-900/20
                    dark:text-amber-400
                    dark:hover:bg-amber-900/40
                    dark:hover:text-amber-300
                "
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                </svg>
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>

            {/* Contenedor de filtros */}
            <div className={`mt-4 ${!mostrarFiltros && 'hidden'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro de Fechas */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Fechas
                        </label>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            {/* Seleccionar todas */}
                            <div className="mb-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={todasSeleccionadas}
                                        onChange={onToggleTodasFechas}
                                        className="h-4 w-4 rounded border-gray-300 bg-transparent text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-white/[0.03]"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Seleccionar todas las fechas
                                    </span>
                                </label>
                            </div>

                            {/* Badges de fechas seleccionadas */}
                            <div className="mb-3 flex flex-wrap gap-2">
                                {filtros.aniosSeleccionados.length === 0 ? (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Ninguna fecha seleccionada
                                    </span>
                                ) : (
                                    filtros.aniosSeleccionados.map(anio => (
                                        <span
                                            key={anio}
                                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                        >
                                            {anio === 'SIN_FECHA' ? 'Sin fecha' : anio}
                                            <button
                                                onClick={() => onToggleFecha(anio)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                )}
                            </div>

                            {/* Lista de fechas */}
                            <div className="max-h-48 overflow-y-auto grid grid-cols-1 gap-2">
                                {anios.map(anioData => (
                                    <label key={anioData.ANIO} className="flex items-center gap-2 rounded p-2 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                                        <input
                                            type="checkbox"
                                            checked={filtros.aniosSeleccionados.includes(anioData.ANIO)}
                                            onChange={() => onToggleFecha(anioData.ANIO)}
                                            className="h-4 w-4 rounded border-gray-300 bg-transparent text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-white/[0.03]"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {anioData.ANIO === 'SIN_FECHA' ? 'Sin fecha' : anioData.ANIO}
                                            <span className="text-gray-500 ml-1">({anioData.TOTAL})</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filtro de Recaudación */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                            Recaudación
                        </label>
                        <select
                            value={filtros.filtroRecaudacion}
                            onChange={(e) => onCambiarFiltro('filtroRecaudacion', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                        >
                            <option value="">Todos</option>
                            <option value="LEY_INSOLVENCIA">Ley Insolvencia</option>
                            <option value="SALDO_MINIMO">Saldo menor a Salario Mínimo</option>
                            <option value="SIN_MEDIDA_CAUTELAR">Sin Medida Cautelar</option>
                            <option value="CARTERA_PROBLEMA">CC - Problema</option>
                            <option value="EMBARGO_BIENES">CC - Embargo Bien Mueble/Inmueble</option>
                            <option value="EMBARGO_SECUESTRADO">CC - Embargo Bien Secuestrado</option>
                            <option value="CC_REMATE">CC - Remate</option>
                            <option value="SIN_AMNISTIA">CC - Sin Amnistía</option>
                        </select>
                    </div>
                </div>

                {/* Botón Limpiar Filtros */}
                <div className="mt-4">
                    <button
                        onClick={onLimpiarFiltros}
                        className="
                            rounded-lg
                            border border-red-500
                            bg-red-50
                            px-4 py-2
                            text-sm font-medium
                            text-red-700
                            shadow-theme-xs
                            hover:bg-red-100 hover:text-red-800
                            dark:border-red-600
                            dark:bg-red-900/20
                            dark:text-red-400
                            dark:hover:bg-red-900/40
                            dark:hover:text-red-300
                        "
                    >
                        Limpiar Todos los Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiltrosResumen;