import { GestionJuridica } from '../../types/gestion-juridica';

// Función para formatear fecha desde formato numérico (AS400)
export const formatearFecha = (fechaNumerica?: string | number): string => {
    if (!fechaNumerica || isNaN(Number(fechaNumerica))) return 'No disponible';

    const fechaStr = String(fechaNumerica);
    const anio = fechaStr.substring(0, 4);
    const mes = parseInt(fechaStr.substring(4, 6)) - 1;
    const dia = fechaStr.substring(6, 8);

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${dia}/${meses[mes]}/${anio}`;
};

// Función para formatear hora
export const formatearHora = (horaString?: string | number): string => {
    if (!horaString) return 'Hora no válida';

    const horaStr = horaString.toString();

    // Si ya viene en formato HH:MM:SS o H:MM:SS
    if (horaStr.includes(':')) {
        const partes = horaStr.split(':');
        if (partes.length < 2) return 'Hora no válida';

        const horas = parseInt(partes[0], 10);
        const minutos = parseInt(partes[1], 10);

        if (isNaN(horas) || isNaN(minutos)) return 'Hora no válida';

        const ampm = horas >= 12 ? 'PM' : 'AM';
        const horas12 = horas % 12 || 12;

        return `${horas12}:${minutos.toString().padStart(2, '0')} ${ampm}`;
    }

    // Si viene en formato HHMMSS
    const str = horaStr.padStart(6, '0');
    const horas = parseInt(str.substring(0, 2), 10);
    const minutos = parseInt(str.substring(2, 4), 10);

    if (isNaN(horas) || isNaN(minutos)) return 'Hora no válida';

    const ampm = horas >= 12 ? 'PM' : 'AM';
    const horas12 = horas % 12 || 12;

    return `${horas12}:${minutos.toString().padStart(2, '0')} ${ampm}`;
};

// Formatear fecha general para gestiones
export const formatearFechaGestion = (fechaStr?: string, origen?: string): string => {
    if (!fechaStr) return 'Fecha no disponible';

    try {
        if (origen === "MySQL") {
            const partes = fechaStr.split(" ").filter(p => p.toLowerCase() !== "de");
            
            if (partes.length < 3) return fechaStr;

            const dia = partes[0].padStart(2, "0");
            const mesTexto = partes[1].toLowerCase();
            const anio = partes[2];

            const mesesMap: { [key: string]: string } = {
                ene: "Ene", enero: "Ene",
                feb: "Feb", febrero: "Feb",
                mar: "Mar", marzo: "Mar",
                abr: "Abr", abril: "Abr",
                may: "May", mayo: "May",
                jun: "Jun", junio: "Jun",
                jul: "Jul", julio: "Jul",
                ago: "Ago", agosto: "Ago",
                sep: "Sep", sept: "Sep", septiembre: "Sep",
                oct: "Oct", octubre: "Oct",
                nov: "Nov", noviembre: "Nov",
                dic: "Dic", diciembre: "Dic"
            };

            const mes = mesesMap[mesTexto] || mesTexto;
            return `${dia}/${mes}/${anio}`;
        } 
        // Para AS400 u otros orígenes, usar el formateo numérico
        else {
            return formatearFecha(fechaStr);
        }
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Fecha inválida';
    }
};

// Formatear hora para gestiones
export const formatearHoraGestion = (horaStr?: string): string => {
    if (!horaStr) return 'Hora no disponible';
    
    try {
        // Usar la función formatearHora para todos los formatos
        return formatearHora(horaStr);
    } catch (error) {
        console.error('Error formateando hora:', error);
        return horaStr;
    }
};

// Determinar origen de la gestión para estilos
export const obtenerClaseOrigen = (origen?: string): string => {
    switch (origen?.toLowerCase()) {
        case 'mysql':
        case 'software cartera cast.':
            return 'software-cartera'; // ✅ ahora coincide con CSS
        case 'as400':
            return 'as400';
        default:
            return 'default';
    }
};

// Obtener color para badge de origen
export const obtenerColorOrigen = (origen?: string): { bg: string; text: string } => {
    switch (origen?.toLowerCase()) {
        case 'mysql':
        case 'software cartera cast.':
            return { 
                bg: 'bg-green-100 dark:bg-green-900/30', 
                text: 'text-green-800 dark:text-green-300' 
            };
        case 'as400':
            return { 
                bg: 'bg-blue-100 dark:bg-blue-900/30', 
                text: 'text-blue-800 dark:text-blue-300' 
            };
        default:
            return { 
                bg: 'bg-gray-100 dark:bg-gray-700', 
                text: 'text-gray-800 dark:text-gray-300' 
            };
    }
};

// Obtener texto descriptivo para origen
export const obtenerDescripcionOrigen = (origen?: string): string => {
    switch (origen?.toLowerCase()) {
        case 'mysql':
        case 'software cartera cast.':
            return 'Software Cartera Cast.';
        case 'as400':
            return 'Plataforma AS400';
        default:
            return origen || 'Sistema desconocido';
    }
};

// Obtener usuario de la gestión
export const obtenerUsuarioGestion = (gestion: GestionJuridica): string => {
    const usuarioGestion = gestion.usuario_gestion?.trim().toUpperCase();
    const usuarioPregunta = gestion.usuario_pregunta?.trim().toUpperCase();
    
    if (usuarioGestion && usuarioGestion !== '') {
        return usuarioGestion;
    }
    
    if (usuarioPregunta && usuarioPregunta !== '') {
        return usuarioPregunta;
    }
    
    return 'Usuario no registrado';
};

// Función de utilidad para formatear fecha y hora juntas
export const formatearFechaHoraCompleta = (fecha?: string, hora?: string, origen?: string): string => {
    const fechaFormateada = formatearFechaGestion(fecha, origen);
    const horaFormateada = formatearHoraGestion(hora);
    
    if (fechaFormateada === 'Fecha no disponible' && horaFormateada === 'Hora no disponible') {
        return 'Fecha/Hora no disponible';
    }
    
    if (fechaFormateada === 'Fecha no disponible') {
        return horaFormateada;
    }
    
    if (horaFormateada === 'Hora no disponible') {
        return fechaFormateada;
    }
    
    return `${fechaFormateada} ${horaFormateada}`;
};