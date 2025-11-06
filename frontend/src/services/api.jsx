// frontend/src/services/api.jsx
import axios from 'axios';

// Usar VITE_API_URL si está definida, si no usar localhost:5000 (backend)
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
	baseURL: `${apiBase}/api`,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	}
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(config => {
	const token = localStorage.getItem('synapse_token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			// Token expirado o inválido
			localStorage.removeItem('synapse_token');
			localStorage.removeItem('synapse_usuario');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;