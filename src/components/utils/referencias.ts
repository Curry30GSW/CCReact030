// Función para obtener el parentesco
export const obtenerParentesco = (codigo?: string): string => {
  const parentescos: Record<string, string> = {
    '0': 'Madre',
    '1': 'Cónyuge',
    '2': 'Hijo(a)',
    '4': 'Padre'
  };

  return codigo ? parentescos[codigo] || 'Otro' : 'Otro';
};

// Función para obtener icono según tipo de referencia
export const obtenerIconoTipoReferencia = (tipo: string): string => {
  if (tipo === 'P') {
    return 'fas fa-user';
  } else if (tipo === 'F') {
    return 'fas fa-user-friends';
  }
  return 'fas fa-user-tag';
};

// Función para obtener clase de color según tipo de referencia
export const obtenerColorReferencia = (tipo: string): { 
  border?: string; 
  bg: string; 
  text: string;
  iconBg?: string;
  iconText?: string;
} => {
  switch (tipo) {
    case 'P':
      return {
          bg: 'bg-blue-500',
                text: 'text-blue-600 dark:text-blue-400',
                iconBg: 'bg-blue-100 dark:bg-blue-900',
                iconText: 'text-blue-600 dark:text-blue-300'
      };    
    case 'F':
      return {
        bg: 'bg-green-500',
                text: 'text-green-600 dark:text-green-400',
                iconBg: 'bg-green-100 dark:bg-green-900',
                iconText: 'text-green-600 dark:text-green-300'
      };
    default:
      return {
        bg: 'bg-gray-500',
                text: 'text-gray-600 dark:text-gray-400',
                iconBg: 'bg-gray-100 dark:bg-gray-900',
                iconText: 'text-gray-600 dark:text-gray-300'
      };
  }
};