// frontend/src/services/auth.jsx
import api from './api';
import config from './config';

// Guarda el token de acceso en el localStorage y en el header de Axios
export function saveToken(token) {
  localStorage.setItem('synapse_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Obtiene el token de acceso desde el localStorage
export function getToken() {
  return localStorage.getItem('synapse_token');
}

// Guarda los datos del usuario en el localStorage
export function saveUsuario(u) {
  localStorage.setItem('synapse_usuario', JSON.stringify(u));
}

// Obtiene los datos del usuario desde el localStorage
export function getUsuario() {
  try {
    const raw = localStorage.getItem('synapse_usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Elimina el token y los datos del usuario del localStorage para cerrar sesión
export function logout() {
  localStorage.removeItem('synapse_token');
  localStorage.removeItem('synapse_usuario');
  delete api.defaults.headers.common['Authorization'];
  window.location.href = '/';
}