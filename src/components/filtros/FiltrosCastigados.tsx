import React from 'react';
import { FiltrosState, Agencia } from '../../types/castigados';

interface FiltrosCastigadosProps {
    filtros: FiltrosState;
    agencias: Agencia[];
    todasSeleccionadas: boolean;
    onCambiarFiltro: (campo: keyof FiltrosState, valor: any) => void;
    onToggleAgencia: (agenciaTexto: string) => void;
    onToggleTodasAgencias: () => void;
    onLimpiarFiltros: () => void;
}

const FiltrosCastigados: React.FC<FiltrosCastigadosProps> = ({
    filtros,
    agencias,
    todasSeleccionadas,
    onCambiarFiltro,
    onToggleAgencia,
    onToggleTodasAgencias,
    onLimpiarFiltros
}) => {
    const [mostrarFiltros, setMostrarFiltros] = React.useState(false);

    return (
        <div>
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
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!mostrarFiltros && 'hidden'}`}>

                {/* Filtro de Fechas */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha Inicio</label>
                    <input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => onCambiarFiltro('fechaInicio', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Fecha Fin</label>
                    <input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => onCambiarFiltro('fechaFin', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    />
                </div>

                {/* Ordenar por Fecha */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ordenar por Fecha</label>
                    <select
                        value={filtros.ordenFecha}
                        onChange={(e) => onCambiarFiltro('ordenFecha', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    >
                        <option value="asc">Más antiguos primero</option>
                        <option value="desc">Más recientes primero</option>
                    </select>
                </div>

                {/* Ordenar por Valor */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Ordenar por Valor</label>
                    <select
                        value={filtros.ordenValor}
                        onChange={(e) => onCambiarFiltro('ordenValor', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    >
                        <option value="">Sin orden</option>
                        <option value="asc">Menor a Mayor</option>
                        <option value="desc">Mayor a Menor</option>
                    </select>
                </div>

                {/* Filtro de Score */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Score</label>
                    <select
                        value={filtros.score}
                        onChange={(e) => onCambiarFiltro('score', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    >
                        <option value="">Todos</option>
                        <option value="0-650">0-650</option>
                        <option value="650+">650+</option>
                        <option value="SE">S/E</option>
                        <option value="FD">F/D</option>
                        <option value="QEPD">Q.E.P.D</option>
                    </select>
                </div>

                {/* Filtro de Recaudación */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Recaudación</label>
                    <select
                        value={filtros.recaudacion}
                        onChange={(e) => onCambiarFiltro('recaudacion', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/40 dark:focus:border-blue-800"
                    >
                        <option value="">Todos</option>
                        <option value="LEY_INSOLVENCIA">Ley Insolvencia</option>
                        <option value="SALDO_MINIMO">Saldo Mínimo</option>
                        <option value="SIN_MEDIDA_CAUTELAR">Sin Medida Cautelar</option>
                        <option value="CARTERA_PROBLEMA">Cartera Problema</option>
                        <option value="EMBARGO_BIENES">Embargo Bienes</option>
                        <option value="EMBARGO_SECUESTRADO">Embargo Secuestrado</option>
                        <option value="CC_REMATE">CC Remate</option>
                        <option value="SIN_AMNISTIA">Sin Amnistía</option>
                    </select>
                </div>

                {/* Filtro de Agencias */}
                <div className="lg:col-span-3">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">Agencias</label>

                        {/* Seleccionar todas */}
                        <div className="mb-3">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={todasSeleccionadas}
                                    onChange={onToggleTodasAgencias}
                                    className="h-4 w-4 rounded border-gray-300 bg-transparent text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-white/[0.03]"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar todas las agencias</span>
                            </label>
                        </div>

                        {/* Badges de agencias seleccionadas */}
                        <div className="mb-3 flex flex-wrap gap-2">
                            {filtros.agenciasSeleccionadas.length === 0 ? (
                                <span className="text-sm text-gray-500 dark:text-gray-400">Ninguna agencia seleccionada</span>
                            ) : (
                                filtros.agenciasSeleccionadas.map(agencia => (
                                    <span
                                        key={agencia}
                                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    >
                                        {agencia}
                                        <button
                                            onClick={() => onToggleAgencia(agencia)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>

                        {/* Lista de agencias */}
                        <div className="max-h-48 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                            {agencias.map(agencia => (
                                <label key={agencia.codigo} className="flex items-center gap-2 rounded p-2 hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                                    <input
                                        type="checkbox"
                                        checked={filtros.agenciasSeleccionadas.includes(agencia.texto)}
                                        onChange={() => onToggleAgencia(agencia.texto)}
                                        className="h-4 w-4 rounded border-gray-300 bg-transparent text-blue-500 focus:ring-blue-400 dark:border-gray-600 dark:bg-white/[0.03]"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{agencia.texto}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Botón Limpiar Filtros */}
                <div className="lg:col-span-3">
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

export default FiltrosCastigados;