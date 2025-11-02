import api from './api'

// Servicio para consumir endpoints de la API del backend existente (rutas en español)
// Normalizamos a las rutas que expone el backend actualmente.

export const getStats = () => api.get('/sesiones/estadisticas').then(r => r.data)

export const getSessions = ({ tecnica_id = null, page = 1, per_page = 10 } = {}) => {
  const params = { page, per_page }
  if (tecnica_id) params.tecnica_id = tecnica_id
  return api.get('/sesiones', { params }).then(r => r.data)
}

export const createSession = (payload) => api.post('/sesiones', payload).then(r => r.data)

export const getWeeklyProgress = () => api.get('/progreso/semana').then(r => r.data)

export const getMonthlyProgress = () => api.get('/progreso/mes').then(r => r.data)

export const getTechniqueStats = () => api.get('/tecnicas/populares').then(r => r.data)

export const getInsights = () => api.get('/progreso/estadisticas-generales').then(r => r.data)

// health check del backend (ruta raíz /health). Usamos la URL absoluta porque la ruta no está bajo /api
export const healthCheck = () => api.get('http://localhost:5000/health').then(r => r.data)

export default {
  getStats,
  getSessions,
  createSession,
  getWeeklyProgress,
  getMonthlyProgress,
  getTechniqueStats,
  getInsights,
  healthCheck,
}
