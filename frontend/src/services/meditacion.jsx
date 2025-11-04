import api from './api';

const meditacionService = {
    // POST /api/bienestar/meditacion/iniciar
    iniciar: (data) => {
        return api.post('/bienestar/meditacion/iniciar', data);
    },

    // POST /api/bienestar/meditacion/finalizar
    finalizar: (data) => {
        return api.post('/bienestar/meditacion/finalizar', data);
    },

    // GET /api/bienestar/meditacion/sesion-actual
    getSesionActual: () => {
        return api.get('/bienestar/meditacion/sesion-actual');
    }
};

export default meditacionService;