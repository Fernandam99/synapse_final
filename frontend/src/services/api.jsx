import axios from 'axios';
import cfg from './config';
import { getToken } from './auth';

// Enable a lightweight mock mode ONLY when VITE_USE_MOCK_API is explicitly set to 'true'.
// By default mocks are disabled so the frontend talks to the real backend.
const useMock = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_API === 'true';

const api = axios.create({ baseURL: cfg.apiBase, timeout:12000 });

// If mock mode is enabled, short-circuit specific requests with canned responses
if (useMock) {
	const mockAdapter = (mockResponse) => (config) => {
		return Promise.resolve({
			data: mockResponse,
			status: 200,
			statusText: 'OK',
			headers: {},
			config,
			request: {}
		});
	};

	api.interceptors.request.use((config) => {
		// Only mock GET requests for a small set of public endpoints used on the homepage
		try {
			const url = (config.url || '').toLowerCase();
			if (config.method === 'get') {
				if (url.endsWith('/home') || url === '/home' || url.endsWith('/api/home')) {
					config.adapter = mockAdapter({ message: 'ok', server: 'mock', version: '1.0' });
				}
				if (url.endsWith('/tareas/estadisticas') || url.endsWith('/estadisticas') ) {
					config.adapter = mockAdapter({ total: 12, completed: 8, pending: 4 });
				}
			}
		} catch (e) {
			// ignore
		}
		return config;
	});
}

// Use getToken() helper so token access is centralized and avoid issues with timing
api.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
