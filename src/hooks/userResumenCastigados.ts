// hooks/useResumenCastigados.ts
import { useState,  useCallback } from 'react';
import { CastigoAsociado, DetalleCastigo, AnioFiltro, FiltroRecaudacion } from '../types/resumen';
import { fetchAndBearer } from '../components/api/FetchAndBearer';

export const useResumenCastigados = () => {
    const [asociados, setAsociados] = useState<CastigoAsociado[]>([]);
    const [detalles, setDetalles] = useState<DetalleCastigo[]>([]);
    const [anios, setAnios] = useState<AnioFiltro[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAsociados = useCallback(async (filtroRecaudacion: FiltroRecaudacion = '', aniosSeleccionados: string[] = []) => {
        setLoading(true);
        setError(null);
        
        try {
            let url = '/api/resumen-agencias';
            
            const params = new URLSearchParams();
            if (filtroRecaudacion) params.append('filtroRecaudacion', filtroRecaudacion);
            if (aniosSeleccionados.length > 0) params.append('anios', aniosSeleccionados.join(','));
            
            if (params.toString()) url += `?${params.toString()}`;
            
            const res = await fetchAndBearer(url);
            
            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }
            
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            
            const respuesta = await res.json();
            
            // Manejar diferentes estructuras de respuesta
            const datos = respuesta.data || respuesta;
            
            if (!Array.isArray(datos) || datos.length === 0) {
                setError('No se encontraron registros');
                setAsociados([]);
                return;
            }
            
            setAsociados(datos);
            
        } catch (err) {
            console.error('❌ Error al cargar asociados:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos');
            setAsociados([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDetalles = useCallback(async (codigoAgencia: string, filtroRecaudacion: FiltroRecaudacion = '', aniosSeleccionados: string[] = []) => {
        setLoading(true);
        setError(null);
        
        try {
            let url = `/api/por-agencia/${codigoAgencia}`;
            
            const params = new URLSearchParams();
            if (filtroRecaudacion) params.append('filtroRecaudacion', filtroRecaudacion);
            if (aniosSeleccionados.length > 0) params.append('anios', aniosSeleccionados.join(','));
            
            if (params.toString()) url += `?${params.toString()}`;
            
            const res = await fetchAndBearer(url);
            
            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return [];
            }
            
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            
            const respuesta = await res.json();
            
            // Manejar diferentes estructuras de respuesta
            const datos = respuesta.data || respuesta;
            
            if (!Array.isArray(datos)) {
                setError('Formato de respuesta inválido');
                setDetalles([]);
                return [];
            }
            
            setDetalles(datos);
            return datos;
            
        } catch (err) {
            console.error('❌ Error al cargar detalles:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido al cargar los detalles');
            setDetalles([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnios = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetchAndBearer('/api/castigos/anios');
            
            if (res.status === 401 || res.status === 403) {
                sessionStorage.clear();
                window.location.href = '/auth';
                return;
            }
            
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            
            const respuesta = await res.json();
            
            // Manejar diferentes estructuras de respuesta
            const datos = respuesta.data || respuesta;
            
            if (!Array.isArray(datos)) {
                setError('Formato de años inválido');
                setAnios([]);
                return;
            }
            
            setAnios(datos);
            
        } catch (err) {
            console.error('❌ Error al cargar años:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido al cargar los años');
            setAnios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para limpiar el estado
    const limpiarDetalles = useCallback(() => {
        setDetalles([]);
        setError(null);
    }, []);

    return {
        // Estado
        asociados,
        detalles,
        anios,
        loading,
        error,
        
        // Acciones
        fetchAsociados,
        fetchDetalles,
        fetchAnios,
        limpiarDetalles,
        
        // Setters (si los necesitas)
        setAsociados,
        setDetalles,
        setAnios,
        setError
    };
};