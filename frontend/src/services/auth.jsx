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
  try {
    // Normalizar forma mínima esperada por la app
    const normalized = {
      // username puede llegar como username o Username
      username: (u.username || u.Username || u.usuario || '').toString(),
      correo: (u.correo || u.email || u.correo_electronico || u.email_address || '').toString(),
      // rol_id puede venir como number o string o como objeto rol: { id, nombre }
      rol_id: u.rol_id ? Number(u.rol_id) : (u.rol && (u.rol.id || u.rol_id) ? Number(u.rol.id || u.rol_id) : undefined),
      // mantener campo activo si existe
      activo: typeof u.activo === 'boolean' ? u.activo : (u.activo === 'true' || u.activo === '1'),
      // mantener cualquier otro dato útil
      ...u
    };
    localStorage.setItem('synapse_usuario', JSON.stringify(normalized));
    // Asegurar que axios tenga el token si ya existe
    const token = getToken();
    if (token) {
      try { api.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch(e){}
    }
  } catch (e) {
    try { localStorage.setItem('synapse_usuario', JSON.stringify(u)); } catch(_){}
  }
}

// Obtiene los datos del usuario desde el localStorage
export function getUsuario() {
  try {
    const raw = localStorage.getItem('synapse_usuario');
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed) return null;
    // Asegurar tipos
    if (parsed.rol_id) parsed.rol_id = Number(parsed.rol_id);
    if (parsed.activo === 'true' || parsed.activo === '1') parsed.activo = true;
    if (parsed.activo === 'false' || parsed.activo === '0') parsed.activo = false;
    return parsed;
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