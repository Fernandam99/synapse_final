import api from './api';
import cfg from './config';

export const iniciar = (data) => {
    return api.post(cfg.paths.meditacionIniciar, data).then(res => res.data);
};

export const finalizar = (data) => {
    return api.post(cfg.paths.meditacionFinalizar(''), data).then(res => res.data);
    // Nota: El backend acepta finalización sin ID en el path, usando el cuerpo o el JWT.
    // Si tu backend requiere ID, cambia a:
    // return api.post(`/bienestar/meditacion/finalizar/${sessionId}`, data);
};

export const getHistorial = async () => {
    const res = await api.get(cfg.paths.meditacionHistorial);
    return Array.isArray(res.data) ? res.data : [];
};