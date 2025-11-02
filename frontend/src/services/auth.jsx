// Guarda el token de acceso en el localStorage
export function saveToken(token) {
  localStorage.setItem('synapse_token', token);
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
    return JSON.parse(localStorage.getItem('synapse_usuario') || 'null');
  } catch {
    return null;
  }
}

// Elimina el token y los datos del usuario del localStorage para cerrar sesión
export function logout() {
  localStorage.removeItem('synapse_token');
  localStorage.removeItem('synapse_usuario');
  // Redirect to public Home after logout
  window.location.href = '/';
}
