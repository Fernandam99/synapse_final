// frontend/src/services/meditacion.jsx
import api from './api';

const meditacionService = {
    // Iniciar una nueva sesión de meditación
    iniciar: async (data) => {
        try {
            const response = await api.post('/bienestar/meditacion/iniciar', data);
            return response.data;
        } catch (error) {
            console.error('Error al iniciar meditación:', error);
            throw error;
        }
    },

    // Finalizar una sesión de meditación
    finalizar: async (data) => {
        try {
            const response = await api.post('/bienestar/meditacion/finalizar', data);
            return response.data;
        } catch (error) {
            console.error('Error al finalizar meditación:', error);
            throw error;
        }
    },

    // Obtener historial de sesiones de meditación del usuario
    getHistorial: async () => {
        try {
            const response = await api.get('/bienestar/meditacion/historial');
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error al obtener historial de meditación:', error);
            // Retornar un array vacío en caso de error para evitar fallos en la UI
            return [];
        }
    }
};

// Exportación por defecto para que funcione con import meditacionService from '...'
export default meditacionService;