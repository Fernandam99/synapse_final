import api from './api';

let _meditacionTecnicaId = null;

const obtenerIdMeditacion = () => {
    if (_meditacionTecnicaId) return Promise.resolve(_meditacionTecnicaId);
    return api.get('/tecnicas').then(r => {
        const tecnicas = Array.isArray(r.data) ? r.data : [];
        const med = tecnicas.find(t =>
            t.nombre?.toLowerCase().includes('meditacion') ||
            t.nombre?.toLowerCase().includes('meditación')
        );
        if (med) {
            _meditacionTecnicaId = med.id_tecnica;
            return _meditacionTecnicaId;
        }
        throw new Error('Técnica de Meditación no encontrada');
    });
};

export const iniciar = (data) => {
    return api.post('/bienestar/meditacion/iniciar', data).then(r => r.data);
};

export const finalizar = (data) => {
    return api.post('/bienestar/meditacion/finalizar', data).then(r => r.data);
};

export const getHistorial = () => {
    return obtenerIdMeditacion().then(id_tecnica => {
        return api.get('/sesiones', { params: { id_tecnica } }).then(r => {
            return Array.isArray(r.data) ? r.data : r.data?.sessions || [];
        });
    });
};

export default {
    iniciar,
    finalizar,
    getHistorial
};
