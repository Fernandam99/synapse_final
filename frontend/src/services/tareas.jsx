import api from './api';
import cfg from './config';

// CRUD completo para tareas
export const tareasService = {
    // Obtener todas las tareas (con filtros opcionales)
    getAll: (filters = {}) => {
        const q = new URLSearchParams(filters).toString();
        const url = cfg.paths.tareas + (q ? `?${q}` : '');
        return api.get(url);
    },

    // Crear una nueva tarea
    create: (data) => {
        return api.post(cfg.paths.tareas, data);
    },

    // Obtener una tarea por ID
    getById: (id) => {
        return api.get(cfg.paths.tareaById(id));
    },

    // Actualizar una tarea
    update: (id, data) => {
        return api.put(cfg.paths.tareaById(id), data);
    },

    // Eliminar una tarea
    delete: (id) => {
        return api.delete(cfg.paths.tareaById(id));
    },

    // Obtener estadísticas
    getStats: () => {
        return api.get(cfg.paths.estadisticasTareas);
    }
};