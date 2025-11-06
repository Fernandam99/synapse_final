
import api from './api';

// Guarda el token de acceso en el localStorage y en el header de Axios
export function saveToken(token) {
  try {
    localStorage.setItem('synapse_token', token);
  } catch (e) {
    /* ignore storage errors */
  }
  try {
    if (api && api.defaults && api.defaults.headers) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
}

// Obtiene el token de acceso desde el localStorage
export function getToken() {
  try {
    return localStorage.getItem('synapse_token');
  } catch (e) {
    return null;
  }
}

// Guarda los datos del usuario en el localStorage
export function saveUsuario(u) {
  try {
    localStorage.setItem('synapse_usuario', JSON.stringify(u));
  } catch (e) {}
}

// Obtiene los datos del usuario desde el localStorage
export function getUsuario() {
  try {
    const raw = localStorage.getItem('synapse_usuario');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Elimina el token y los datos del usuario del localStorage y limpia headers
export function logout() {
  try { localStorage.removeItem('synapse_token'); } catch (e) {}
  try { localStorage.removeItem('synapse_usuario'); } catch (e) {}
  try { if (api && api.defaults && api.defaults.headers) delete api.defaults.headers.common['Authorization']; } catch (e) {}
  // Redirect to home (public)
  try { window.location.href = '/'; } catch (e) {}
}

