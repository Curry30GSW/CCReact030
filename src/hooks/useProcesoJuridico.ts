import { useState, useCallback } from 'react';
import { ProcesoJuridico } from '../types/proceso-juridico';
import { fetchAndBearer } from '../components/api/FetchAndBearer';

export const useProcesoJuridico = () => {
  const [proceso, setProceso] = useState<ProcesoJuridico | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarProcesoJuridico = useCallback(async (cuenta: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchAndBearer(`/api/estado-proceso/${cuenta}`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const result = await res.json();

      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No se encontró información del proceso jurídico');
      }

      setProceso(result.data[0]);
      return result.data[0];

    } catch (error) {
      console.error('Error al cargar proceso jurídico:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarProceso = useCallback(() => {
    setProceso(null);
    setError(null);
  }, []);

  return {
    proceso,
    loading,
    error,
    cargarProcesoJuridico,
    limpiarProceso
  };
};