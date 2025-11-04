import api from './api';

const sesionGrupalService = {
    // POST /api/sesiones
    crearSesion: (data) => {
        return api.post('/sesiones', data);
    },

    // POST /api/sesiones/iniciar
    iniciarSesion: (data) => {
        return api.post('/sesiones/iniciar', data);
    },

    // POST /api/sesiones/<id>/finalizar
    finalizarSesion: (sesionId, data = {}) => {
        return api.post(`/sesiones/${sesionId}/finalizar`, data);
    },

    // GET /api/sesiones
    getSesiones: () => {
        return api.get('/sesiones');
    },

    // GET /api/salas/publicas
    getSalasPublicas: () => {
        return api.get('/salas/publicas');
    },

    // POST /api/salas/unirse
    unirseASala: (sala_id, codigo_acceso = null) => {
        return api.post('/salas/unirse', { sala_id, codigo_acceso });
    }
};

export default sesionGrupalService;