import { MedidaCautelar, ZonaJuridica } from '../../types/proceso-juridico';

// Definir zonas jurídicas
export const zonasJuridicas: ZonaJuridica[] = [
  {
    codigo: '21',
    nombre: 'JURÍDICO ZONA CENTRO',
    agencias: [48, 80, 89, 94, 83, 13, 68, 73, 76, 90, 91, 92, 96, 93, 95]
  },
  {
    codigo: '22',
    nombre: 'JURÍDICO ZONA NORTE',
    agencias: [87, 86, 85, 81, 84, 88, 98, 97, 82]
  },
  {
    codigo: '23',
    nombre: 'JURÍDICO ZONA SUR',
    agencias: [77, 49, 70, 42, 46, 45, 47, 78, 74, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 29]
  }
];

// Determinar zona jurídica basada en la agencia
export const determinarZonaJuridica = (agencia?: string): ZonaJuridica => {
  if (!agencia) {
    return { codigo: '00', nombre: 'Zona no determinada', agencias: [] };
  }

  const agenciaNum = parseInt(agencia);
  
  for (const zona of zonasJuridicas) {
    if (zona.agencias.includes(agenciaNum)) {
      return zona;
    }
  }

  return { codigo: '00', nombre: 'Zona no determinada', agencias: [] };
};

// Obtener descripción de zona por código
export const obtenerDescripcionZona = (codigoZona?: string): string => {
  if (!codigoZona) return 'Zona no determinada';
  
  const zona = zonasJuridicas.find(z => z.codigo === codigoZona);
  return zona ? zona.nombre : `Zona ${codigoZona}`;
};

// Formatear fecha
export const formatearFecha = (fechaNumero?: number): string => {
  if (!fechaNumero) return 'No disponible';
  
  try {
    const fechaStr = fechaNumero.toString().padStart(8, '0');
    const year = fechaStr.substring(0, 4);
    const month = fechaStr.substring(4, 6);
    const day = fechaStr.substring(6, 8);
    
    return `${day}/${month}/${year}`;
  } catch  {
    return 'Fecha inválida';
  }
};

// Formatear fecha general (para historial)
export const formatearFechaGeneral = (fechaNumero?: number): string => {
  if (!fechaNumero) return 'Fecha no disponible';
  
  const fecha = formatearFecha(fechaNumero);
  return fecha;
};

// Formatear hora (para historial)
export const formatearHoraGeneral = (fechaNumero?: number): string => {
  if (!fechaNumero) return 'Hora no disponible';
  
  const fecha = formatearFecha(fechaNumero);
  return fecha;
};

// Parsear medidas cautelares
export const parsearMedidasCautelares = (medidasDetalle?: string): MedidaCautelar[] => {
  if (!medidasDetalle) return [];

  const medidas: MedidaCautelar[] = [];
  const lineas = medidasDetalle.split('\n');

  for (const linea of lineas) {
    const partes = linea.split('|').map(p => p.trim());
    
    if (partes.length >= 4) {
      const tipoParte = partes[0];
      const obsParte = partes[1];
      const fecParte = partes[2];
      const usrParte = partes[3];

      const medida: MedidaCautelar = {
        tipo: tipoParte || '',
        observacion: obsParte ? obsParte.replace('OBS: ', '') : '',
        fecha: fecParte ? fecParte.replace('FEC: ', '') : '',
        usuario: usrParte ? usrParte.replace('USR: ', '') : ''
      };

      medidas.push(medida);
    }
  }

  return medidas;
};

// Obtener clase CSS para estado
export const obtenerClaseEstado = (estado?: string): string => {
  switch (estado?.toLowerCase()) {
    case 'activo':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'suspendido':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'terminado':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'archivado':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
};