export default {
  // Base URL relativo: usar '/api' permite que Vite proxee las llamadas al backend
  // y también hace que el frontend funcione sin tocar el backend en desarrollo/producción.
  apiBase: '/api',

  paths: {
    login: '/auth/login',
    register: '/auth/register',
    // Ajuste: usar la ruta plural que expone el backend (/api/tareas)
    tareas: '/tareas',
    estadisticas: '/tareas/estadisticas'
  },
  tokenField: 'access_token',
  usuarioField: 'usuario'
};


  // Rutas de la API (relativas a apiBase)
  paths: {
    // Autenticación
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',

    // Usuarios
    usuarios: '/usuarios',
    usuarioById: (id) => `/usuarios/${id}`,
    searchUsuarios: '/usuarios/search',

    // Tareas
    tareas: '/tareas',
    tareaById: (id) => `/tareas/${id}`,
    tareasPorSala: (salaId) => `/tareas/sala/${salaId}`,
    estadisticasTareas: '/tareas/estadisticas',

    // Sesiones
    sesiones: '/sesion',
    sesionById: (id) => `/sesion/${id}`,
    estadisticasSesiones: '/sesion/estadisticas',

    // Salas
    salas: '/sala',
    salaById: (id) => `/sala/${id}`,
    salasPublicas: '/sala/publicas',
    unirseSala: (id) => `/sala/${id}/unirse`,
    salirSala: (id) => `/sala/${id}/salir`,

    // Técnicas
    tecnicas: '/tecnica',
    tecnicaById: (id) => `/tecnica/${id}`,
    tecnicasPopulares: '/tecnica/populares',

    // Recompensas
    recompensas: '/recompensa',
    recompensaById: (id) => `/recompensa/${id}`,
    misRecompensas: '/recompensa/mis-recompensas',
    recompensasDisponibles: '/recompensa/disponibles',
    otorgarRecompensa: '/recompensa/otorgar',

    // Progreso
    progresoHoy: '/progreso/hoy',
    progresoSemana: '/progreso/semana',
    progresoMes: '/progreso/mes',
    progresoUsuario: '/progreso/usuario',
    estadisticasGenerales: '/progreso/estadisticas'
  },

  // Nombres de campos en la respuesta de autenticación
  tokenField: 'access_token',
  usuarioField: 'usuario'
};

