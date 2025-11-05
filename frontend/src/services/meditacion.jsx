import api from './api';

const meditacionService = {
    // Iniciar sesión de meditación
    iniciar: (data) => {
        return api.post('/bienestar/meditacion/iniciar', data);
    },
    // Finalizar sesión de meditación
    finalizar: (data) => {
        return api.post('/bienestar/meditacion/finalizar', data);
    },
    // Obtener historial de sesiones de meditación
    getHistorial: async () => {
        const res = await api.get('/sesiones');
        // Filtrar solo sesiones de meditación
        return res.data.filter(sesion =>
            sesion.tecnica_nombre?.toLowerCase().includes('meditacion') ||
            sesion.tecnica_nombre?.toLowerCase().includes('meditación')
        );
    }
};

export default meditacionService;