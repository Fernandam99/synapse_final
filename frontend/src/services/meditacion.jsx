// frontend/src/services/meditacion.jsx
import api from './api';

const meditacionService = {
    // Confirmar inicio de sesión en frontend (no crea sesión en DB)
    iniciar: async (data) => {
        try {
            const response = await api.post('/bienestar/meditacion/iniciar', data);
            console.log("Respuesta iniciar meditación (frontend):", response.data); // Log para depuración
            return response.data;
        } catch (error) {
            console.error('Error al confirmar inicio de meditación:', error);
            throw error;
        }
    },

    // Guardar sesión finalizada en la base de datos
    guardar: async (data) => {
        try {
            const response = await api.post('/bienestar/meditacion/guardar', data);
            console.log("Respuesta guardar meditación:", response.data); // Log para depuración
            return response.data;
        } catch (error) {
            console.error('Error al guardar meditación:', error);
            throw error;
        }
    },

    // Obtener historial de sesiones de meditación del usuario
    getHistorial: async () => {
        try {
            const response = await api.get('/bienestar/meditacion/historial');
            console.log("Respuesta historial meditación:", response.data); // Log para depuración
            return Array.isArray(response.data) ? response.data : response.data.historial || [];
        } catch (error) {
            console.error('Error al obtener historial de meditación:', error);
            return [];
        }
    },

    // Obtener tipos de meditación
    getTipos: async () => {
        try {
            const response = await api.get('/bienestar/meditacion/tipos');
            console.log("Respuesta tipos meditación:", response.data); // Log para depuración
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener tipos de meditación:', error);
            return [];
        }
    }
};

export default meditacionService;