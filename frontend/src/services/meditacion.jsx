import api from './api';

export default {
    iniciarMeditacion: (data) => {
        return api.post('/bienestar/meditacion/iniciar', data).then(res => {
            console.log('Meditación iniciada:', res.data);
            return res.data;
        });
    },

    // Si en el futuro tienes GET /bienestar/sesiones, añádelo aquí
    getSesiones: () => {
        // Por ahora, no existe en tu backend, así que devuelve vacío
        return Promise.resolve([]);
    }
};