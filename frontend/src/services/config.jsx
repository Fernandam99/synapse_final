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
