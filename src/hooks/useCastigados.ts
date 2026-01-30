import { useState, useEffect, useMemo } from 'react';
import { Castigado, Agencia, FiltrosState } from '../types/castigados';
import { fetchAndBearer } from '../components/api/FetchAndBearer';

export const useCastigados = () => {
  const [castigados, setCastigados] = useState<Castigado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosState>({
    fechaInicio: '',
    fechaFin: '',
    ordenFecha: 'asc',
    ordenValor: '',
    score: '',
    recaudacion: '',
    agenciasSeleccionadas: []
  });
  
  // Estados para agencias
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [todasAgenciasSeleccionadas, setTodasAgenciasSeleccionadas] = useState(false);

  // Obtener datos iniciales
  useEffect(() => {
    obtenerCastigados();
  }, []);

  const obtenerCastigados = async () => {
    try {
      setLoading(true);
      const res = await fetchAndBearer('/api/castigados?page=1&pageSize=2500');
      
      if (res.status === 401 || res.status === 403) {
        sessionStorage.clear();
        window.location.href = '/auth';
        return;
      }
      
      if (!res.ok) throw new Error('Error en la solicitud');
      
      const respuesta = await res.json();
      const datos = respuesta.data || respuesta;
      
      if (!Array.isArray(datos) || datos.length === 0) {
        // Puedes usar un toast aquí
        console.log('Sin registros');
        return;
      }
      
      setCastigados(datos);
      inicializarAgencias(datos);
      
    } catch (error) {
      console.error('Error al obtener castigados:', error);
      setError('No se pudo obtener la información.');
    } finally {
      setLoading(false);
    }
  };

  const inicializarAgencias = (datos: Castigado[]) => {
    const agenciasUnicas: Agencia[] = [];
    
    datos.forEach(a => {
      if (a.AAUX93 && a.DESC03) {
        const centroOperacion = `${a.AAUX93} - ${a.DESC03}`;
        if (!agenciasUnicas.find(ag => ag.codigo === a.AAUX93)) {
          agenciasUnicas.push({
            codigo: parseInt(a.AAUX93.toString()),
            nombre: a.DESC03,
            texto: centroOperacion
          });
        }
      }
    });
    
    agenciasUnicas.sort((a, b) => a.codigo - b.codigo);
    setAgencias(agenciasUnicas);
  };


  // Aplicar filtros
  const aplicarFiltros = () => {
    let datosFiltradosTemp = [...castigados];

    // Filtro por agencias
    const agenciasSeleccionadas = filtros.agenciasSeleccionadas;
    if (agenciasSeleccionadas.length > 0) {
      datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
        const centroOperacion = `${asociado.AAUX93} - ${asociado.DESC03}`;
        return agenciasSeleccionadas.includes(centroOperacion);
      });
    }

    // Filtro por fecha
    if (filtros.fechaInicio || filtros.fechaFin) {
      const fechaInicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
      const fechaFin = filtros.fechaFin ? new Date(filtros.fechaFin) : null;

      datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
        if (!asociado.FTAG05) return false;

        const fechaRaw = String(19000000 + parseInt(asociado.FTAG05.toString()));
        const fechaAsociado = new Date(fechaRaw.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"));

        if (fechaInicio && fechaAsociado < fechaInicio) return false;
        if (fechaFin && fechaAsociado > fechaFin) return false;

        return true;
      });
    }

    // Filtro por score
    if (filtros.score) {
      datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
        let score = asociado.Score;

        // Normalizar strings especiales
        if (typeof score === 'string') {
          if (score.toLowerCase().includes("falta")) score = "F/D";
          else if (score === "S/E") score = "S/E";
          else if (score.toLowerCase().includes("muerte")) score = "Q.E.P.D";
        }

        // Comparación con filtro
        if (filtros.score === "SE") return score === "S/E";
        if (filtros.score === "FD") return score === "F/D";
        if (filtros.score === "QEPD") return score === "Q.E.P.D";

        if (!isNaN(Number(score))) {
          const scoreNum = Number(score);
          if (filtros.score === "0-650") return scoreNum <= 650;
          if (filtros.score === "650+") return scoreNum > 650;
        }

        return false;
      });
    }

    // Filtro por recaudación
    if (filtros.recaudacion) {
      datosFiltradosTemp = datosFiltradosTemp.filter(asociado => {
        const depe93 = parseInt(asociado.DEPE93.toString());

        switch (filtros.recaudacion) {
          case 'LEY_INSOLVENCIA':
            return depe93 === 59;
          case 'SALDO_MINIMO':
            return depe93 === 0 || depe93 === 46;
          case 'SIN_MEDIDA_CAUTELAR':
            return depe93 === 51 || depe93 === 52 || depe93 === 53 || depe93 === 54;
          case 'CARTERA_PROBLEMA':
            return depe93 === 66;
          case 'EMBARGO_BIENES':
            return depe93 === 72;
          case 'EMBARGO_SECUESTRADO':
            return depe93 === 73;
          case 'CC_REMATE':
            return depe93 === 74;
          case 'SIN_AMNISTIA':
            return depe93 === 99;
          default:
            return true;
        }
      });
    }

    return datosFiltradosTemp;
  };

  // Ordenar datos
  const ordenarDatos = (datos: Castigado[]) => {
    const datosOrdenados = [...datos];
    
    return datosOrdenados.sort((a, b) => {
      if (filtros.ordenValor) {
        const valorA = (Number(a.ESCR93) || 0) + (Number(a.ORCR93) || 0);
        const valorB = (Number(b.ESCR93) || 0) + (Number(b.ORCR93) || 0);
        return filtros.ordenValor === 'asc' ? valorA - valorB : valorB - valorA;
      }
      
      const fechaA = a.FTAG05 ? new Date(
        String(19000000 + parseInt(a.FTAG05.toString())).replace(
          /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"
        )
      ) : new Date(9999, 11, 31);

      const fechaB = b.FTAG05 ? new Date(
        String(19000000 + parseInt(b.FTAG05.toString())).replace(
          /(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"
        )
      ) : new Date(9999, 11, 31);

      return filtros.ordenFecha === 'asc' ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  };

  // Datos filtrados y ordenados
  const datosFiltradosOrdenados = useMemo(() => {
    const filtrados = aplicarFiltros();
    return ordenarDatos(filtrados);
  }, [castigados, filtros]);

  // Handlers para filtros
  const handleCambiarFiltro = (campo: keyof FiltrosState, valor: unknown) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleToggleAgencia = (agenciaTexto: string) => {
    setFiltros(prev => {
      const nuevasAgencias = prev.agenciasSeleccionadas.includes(agenciaTexto)
        ? prev.agenciasSeleccionadas.filter(ag => ag !== agenciaTexto)
        : [...prev.agenciasSeleccionadas, agenciaTexto];
      
      return {
        ...prev,
        agenciasSeleccionadas: nuevasAgencias
      };
    });
  };

  const handleToggleTodasAgencias = () => {
    const nuevasTodasSeleccionadas = !todasAgenciasSeleccionadas;
    setTodasAgenciasSeleccionadas(nuevasTodasSeleccionadas);
    
    if (nuevasTodasSeleccionadas) {
      // Seleccionar todas
      setFiltros(prev => ({
        ...prev,
        agenciasSeleccionadas: agencias.map(ag => ag.texto)
      }));
    } else {
      // Deseleccionar todas
      setFiltros(prev => ({
        ...prev,
        agenciasSeleccionadas: []
      }));
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      ordenFecha: 'asc',
      ordenValor: '',
      score: '',
      recaudacion: '',
      agenciasSeleccionadas: []
    });
    setTodasAgenciasSeleccionadas(false);
  };

  return {
    datos: datosFiltradosOrdenados,
    loading,
    error,
    filtros,
    agencias,
    todasAgenciasSeleccionadas,
    handleCambiarFiltro,
    handleToggleAgencia,
    handleToggleTodasAgencias,
    handleLimpiarFiltros,
    obtenerCastigados
  };
};