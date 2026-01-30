import { useState, useCallback } from 'react';
import { GestionJuridica, HistorialGestiones } from '../types/gestion-juridica';
import { fetchAndBearer } from '../components/api/FetchAndBearer';

export const useGestionesJuridicas = () => {
  const [historial, setHistorial] = useState<HistorialGestiones | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarGestiones = useCallback(async (cuenta: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetchAndBearer(`/api/castigos/gestion/${cuenta}`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!data || data.length === 0) {
        throw new Error('No se encontraron gestiones');
      }

      // Ordenar gestiones por fecha (más reciente primero)
      const gestionesOrdenadas = data.sort((a: GestionJuridica, b: GestionJuridica) => {
        const fechaA = a.fecha_gestion ? new Date(a.fecha_gestion) : new Date(0);
        const fechaB = b.fecha_gestion ? new Date(b.fecha_gestion) : new Date(0);
        return fechaB.getTime() - fechaA.getTime();
      });

      const historialData: HistorialGestiones = {
        cuenta,
        nombreCliente: data[0]?.nombre || 'Cliente',
        totalGestiones: data.length,
        gestiones: gestionesOrdenadas,
        ultimaGestion: gestionesOrdenadas[0]
      };

      setHistorial(historialData);
      return historialData;

    } catch (error) {
      console.error('Error al cargar gestiones:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarHistorial = useCallback(() => {
    setHistorial(null);
    setError(null);
  }, []);

  return {
    historial,
    loading,
    error,
    cargarGestiones,
    limpiarHistorial
  };
};