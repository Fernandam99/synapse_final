import React, { useEffect, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import api from '../services/api';
import { getToken, getUsuario } from '../services/auth';

/**
 * Modal para editar la información de perfil del usuario.
 * @param {object} props
 * @param {boolean} props.open - Controla si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {object} props.usuario - El objeto de usuario actual.
 * @param {function} props.onUpdated - Función que se llama cuando el perfil se actualiza con éxito.
 */
export default function EditProfileModal({ open, onClose, usuario, onUpdated }) {
  // Estados para el formulario, la previsualización del avatar y el estado de guardado.
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // Estado para manejar errores

  /**
   * Inicializa el formulario y la previsualización del avatar cuando el modal se abre o el usuario cambia.
   */
  useEffect(() => {
    if (open && usuario) {
      // SOLO incluimos los campos que sí se pueden editar
      setForm({
        Username: usuario.Username || '',
        nombre_completo: usuario.nombre_completo || usuario.Username || '',
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
        descripcion: usuario.descripcion || ''
      });
      setAvatarPreview(usuario.avatar_url || null);
      setError(null); // Limpiar errores al abrir
    }
  }, [open, usuario]);

  // Si el modal no está abierto, no renderizamos nada.
  if (!open) return null;

  /**
   * Helper tolerante para actualizar el perfil: intenta PUT, si devuelve 405 intenta PATCH, luego POST.
   * Esto se define en el scope del componente para que pueda ser reutilizado por varias funciones.
   */
  const updateMe = async (formData) => {
    // If backend exposes a user-specific PUT endpoint, try it first (/api/usuarios/:id)
    try {
      // Ensure we have a JWT token
      const token = getToken();
      if (!token) {
        const err = new Error('No hay token de autenticación. Inicia sesión de nuevo.');
        err.response = { status: 401 };
        throw err;
      }

      // Ensure we have the usuario id (try prop then localStorage)
      const currentUser = usuario && usuario.id_usuario ? usuario : getUsuario();
      if (currentUser && currentUser.id_usuario) {
        // Build a JSON payload from fields the backend may accept.
        const jsonPayload = {};
        if (form.nombre_completo !== undefined) jsonPayload.username = form.nombre_completo;
        if (form.telefono !== undefined) jsonPayload.celular = form.telefono;
        // Note: backend's update_usuario accepts username, correo, rol_id, activo, password
        // It does not currently accept avatar_url, ubicacion or descripcion. We still send celular (if present) in case it's handled.
        try {
          // Note: api.baseURL is '/api', so use the route relative to that prefix
          const res = await api.put(`/usuarios/${currentUser.id_usuario}`, jsonPayload);
          return res;
        } catch (ePut) {
          // If server rejects method or endpoint, we'll continue with other strategies below
          // console.debug('PUT /api/usuarios/:id failed, falling back to other strategies', ePut);
        }
      }
    } catch (e) {
      // ignore and continue to other strategies
    }
    // utilidades locales
    const hasFile = (fd) => {
      try {
        for (let pair of fd.entries()) {
          const v = pair[1];
          if (v && typeof v === 'object' && (v instanceof File || v instanceof Blob)) return true;
        }
      } catch (e) { /* ignore */ }
      return false;
    };

    const fdToObject = (fd) => {
      const obj = {};
      try {
        for (let pair of fd.entries()) {
          const k = pair[0];
          const v = pair[1];
          // skip files when converting to json
          if (v && typeof v === 'object' && (v instanceof File || v instanceof Blob)) continue;
          // If key already exists, turn into array
          if (obj[k] !== undefined) {
            if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
            obj[k].push(v);
          } else {
            obj[k] = v;
          }
        }
      } catch (e) { /* ignore */ }
      return obj;
    };

    const tryEndpoints = ['/auth/me', '/users/me', '/user/me'];

    // strategy attempts
    for (const endpoint of tryEndpoints) {
      // 1) If there is a file, try with multipart FormData using PUT->PATCH->POST
      if (formData instanceof FormData && hasFile(formData)) {
        try {
          return await api.put(endpoint, formData);
        } catch (e) {
          if (e?.response?.status === 405) {
            try { return await api.patch(endpoint, formData); } catch (e2) {
              if (e2?.response?.status === 405) {
                try { return await api.post(endpoint, formData); } catch (e3) { throw e3; }
              }
              throw e2;
            }
          }
          // If other error, rethrow to be handled outside
          throw e;
        }
      }

      // 2) If no file or previous attempts failed with 405, try JSON payload (some backends expect JSON)
      try {
        const json = (formData instanceof FormData) ? fdToObject(formData) : (formData || {});
        return await api.put(endpoint, json);
      } catch (e) {
        if (e?.response?.status === 405) {
          try { return await api.patch(endpoint, (formData instanceof FormData) ? fdToObject(formData) : formData); } catch (e2) {
            if (e2?.response?.status === 405) {
              // Try POST with JSON
              try { return await api.post(endpoint, (formData instanceof FormData) ? fdToObject(formData) : formData); } catch (e3) {
                // continue to next endpoint
              }
            }
          }
        }
        // otherwise continue to next endpoint
      }

      // 3) Try method-override via FormData _method field (some servers accept POST + _method=PATCH)
      if (formData instanceof FormData) {
        const fdClone = new FormData();
        try {
          for (let pair of formData.entries()) fdClone.append(pair[0], pair[1]);
          fdClone.append('_method', 'PATCH');
          try {
            return await api.post(endpoint, fdClone);
          } catch (e) {
            // continue to next endpoint
          }
        } catch (e) { /* ignore cloning issues */ }
      }
    }

    // If none of the strategies returned, throw a generic error so caller can show a message
    const err = new Error('No se pudo actualizar: el servidor no acepta los métodos probados (PUT/PATCH/POST) en los endpoints habituales.');
    err.response = { status: 405, data: 'Method Not Allowed' };
    throw err;
  };

  /**
   * Maneja la selección de un nuevo archivo de avatar.
   */
  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;

    // Validar tamaño (Máximo 2MB)
    if (f.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 2MB.');
      return;
    }

    setForm(prev => ({ ...prev, avatar: f, remove_avatar: false })); // Establece el archivo y anula la eliminación
    setAvatarPreview(URL.createObjectURL(f)); // Crea la URL de previsualización local
  };

  /**
   * Maneja la eliminación inmediata del avatar (llama a la API).
   */
  const handleRemoveNow = async () => {
    if (!window.confirm('¿Eliminar la foto de perfil?')) return;
    try {
      setSaving(true);
      setError(null);
      const fd = new FormData();
      fd.append('remove_avatar', '1');

      // Usamos el helper `updateMe` definido en el scope del componente (intenta PUT -> PATCH -> POST)
      const res = await updateMe(fd);
      
      // Limpiar previsualización y formulario
      setAvatarPreview(null);
      setForm(f => ({ ...f, avatar: null, remove_avatar: false }));
      
      // Actualizar caché y notificar al componente padre
      try {
        localStorage.setItem('synapse_usuario', JSON.stringify(res.data));
      } catch (e) { /* ignore */ }
      
      onUpdated && onUpdated(res.data);
    } catch (e) {
      console.error('Error removing avatar:', e);
      // Mostrar mensaje útil al usuario
      const resp = e?.response;
      let msg = 'No se pudo eliminar la foto. Intenta de nuevo.';
      if (resp) {
        if (resp.data) {
          msg = resp.data.error || resp.data.message || resp.data.detail || msg;
          if (Array.isArray(resp.data.errors)) msg = resp.data.errors.map(x => x.msg || x.message || x).join(', ');
        } else {
          msg = `Error ${resp.status}: ${resp.statusText}`;
        }
      } else if (e?.message) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Guarda los cambios del formulario.
   */
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      
  // Agrega solo los campos editables al FormData, asegurando que estén definidos
  if (form.nombre_completo !== undefined) fd.append('nombre_completo', form.nombre_completo);
  // correo, fecha_nacimiento NO se agregan (email no editable desde este modal)
      if (form.telefono !== undefined) fd.append('telefono', form.telefono);
      if (form.ubicacion !== undefined) fd.append('ubicacion', form.ubicacion);
      if (form.descripcion !== undefined) fd.append('descripcion', form.descripcion);
      
      // Adjunta el archivo de avatar si existe
      if (form.avatar) fd.append('avatar', form.avatar);
      
      // Si el usuario marcó para eliminar el avatar (pero no lo hizo inmediatamente)
      if (form.remove_avatar) fd.append('remove_avatar', '1'); 

      // La API debe manejar la actualización (PUT)
  const res = await updateMe(fd);

      // Intenta obtener datos frescos si es necesario (el endpoint PUT debería devolver el objeto actualizado)
      let fresh = res.data;
      try {
        const meRes = await api.get('/auth/me');
        if (meRes && meRes.data) fresh = meRes.data;
      } catch (e) {
        // Ignorar, usaremos res.data
      }
      
      // Actualizar caché y notificar al componente padre
      try {
        localStorage.setItem('synapse_usuario', JSON.stringify(fresh));
      } catch (e) { /* ignore storage errors */ }
      
      onUpdated && onUpdated(fresh);
      onClose && onClose();
    } catch (e) {
      console.error('Error saving profile:', e);
      const resp = e?.response;
      let msg = 'No se pudo actualizar el perfil. Intenta de nuevo.';
      if (resp) {
        // Try multiple common fields returned by different backends
        if (resp.data) {
          if (typeof resp.data === 'string') {
            // If server returned HTML (like a 405 page), detect and show a friendlier message
            const s = resp.data.trim();
            if (s.startsWith('<!doctype') || s.startsWith('<html') || s.includes('<h1>Method Not Allowed</h1>')) {
              msg = `Error ${resp.status}: Method Not Allowed — el servidor devolvió una página HTML. Puede que el endpoint no acepte este método desde el frontend.`;
            } else {
              msg = resp.data;
            }
          } else {
            msg = resp.data.error || resp.data.message || resp.data.detail || msg;
            if (Array.isArray(resp.data.errors)) {
              // Some backends return an array of { msg, param } or strings
              const parts = resp.data.errors.map(x => (typeof x === 'string' ? x : x.msg || x.message || JSON.stringify(x))).filter(Boolean);
              if (parts.length) msg = parts.join('; ');
            }
          }
        } else {
          msg = `Error ${resp.status}: ${resp.statusText}`;
        }
      } else if (e?.message) {
        msg = e.message;
      }

      // Si el error indica que el servidor no acepta los métodos probados, guardamos los cambios localmente
      if (e?.message && e.message.includes('No se pudo actualizar: el servidor no acepta')) {
        try {
          const localUser = Object.assign({}, usuario || {});
          // Mapeo de campos locales que el backend no soporta aun
          if (form.nombre_completo !== undefined) localUser.username = form.nombre_completo;
          if (form.telefono !== undefined) localUser.celular = form.telefono;
          if (form.ubicacion !== undefined) localUser.ubicacion = form.ubicacion;
          if (form.descripcion !== undefined) localUser.descripcion = form.descripcion;
          if (avatarPreview) localUser.avatar_url = avatarPreview;
          localStorage.setItem('synapse_usuario', JSON.stringify(localUser));
          onUpdated && onUpdated(localUser);
          onClose && onClose();
          setError('Cambios guardados localmente. El backend no expone un endpoint de actualización para estos campos.');
        } catch (e2) {
          setError(msg);
        }
      } else {
        if (resp?.status === 409) {
          setError('El correo ya está en uso');
        } else {
          setError(msg);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Genera las iniciales a partir del nombre o los datos del usuario.
   */
  const getInitials = (nameOrUser) => {
    if (!nameOrUser) return 'U';
    let str = '';
    if (typeof nameOrUser === 'string') {
      str = nameOrUser;
    } else if (typeof nameOrUser === 'object') {
      // Preferimos nombre_completo si está disponible
      str = nameOrUser.nombre_completo || nameOrUser.Username || nameOrUser.username || nameOrUser.correo || nameOrUser.email || '';
    } else {
      str = String(nameOrUser || '');
    }
    if (!str) return 'U';
    return String(str)
      .split(' ')
      .map(n => (n && n[0]) ? n[0] : '')
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  const initialsForAvatar = () => getInitials(form.nombre_completo || usuario?.nombre_completo || form.Username || usuario?.Username);

  // 🖼️ Renderizado del Modal
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        style={{
          position: 'relative',
          width: 560,
          maxWidth: '95%',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1201,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1a1a1a' }}>
            Editar Perfil
          </h2>
          <button
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: 4, 
              color: '#666', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: 6, 
              transition: 'background 0.2s' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {/* Mensaje de Error */}
          {error && (
            <div style={{ padding: 10, marginBottom: 16, background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: 8, fontSize: 14 }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Columna Izquierda: Inputs de Texto */}
            <div>
              {/* CAMPO DE NOMBRE COMPLETO FUE ELIMINADO */}
              {/* CAMPO DE EMAIL FUE ELIMINADO */}
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={form.nombre_completo || ''} 
                  onChange={e => setForm(f => ({ ...f, nombre_completo: e.target.value }))} 
                  placeholder="Sin espacios ni caracteres especiales" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} 
                  onFocus={e => e.target.style.borderColor = '#a855f7'} 
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} 
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Teléfono</label>
                <input 
                  type="text" 
                  value={form.telefono || ''} 
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} 
                  placeholder="+34 612 345 678" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} 
                  onFocus={e => e.target.style.borderColor = '#a855f7'} 
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} 
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Ubicación</label>
                <input 
                  type="text" 
                  value={form.ubicacion || ''} 
                  onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} 
                  placeholder="Madrid, España" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }} 
                  onFocus={e => e.target.style.borderColor = '#a855f7'} 
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} 
                />
              </div>
              
              {/* CAMPO DE FECHA DE NACIMIENTO FUE ELIMINADO */}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Biografía</label>
                <textarea 
                  value={form.descripcion || ''} 
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} 
                  placeholder="Cuéntanos sobre ti..." 
                  style={{ width: '100%', minHeight: 120, padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', resize: 'vertical', transition: 'border-color 0.2s', fontFamily: 'inherit' }} 
                  onFocus={e => e.target.style.borderColor = '#a855f7'} 
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} 
                />
              </div>
            </div>

            {/* Columna Derecha: Avatar Upload */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Foto de perfil</label>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20, border: '2px dashed #e5e7eb', borderRadius: 12, background: '#fafafa' }}>
                  <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: 'white', border: '4px solid rgba(255,255,255,0.7)', boxShadow: '0 8px 24px rgba(16,24,40,0.2)' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initialsForAvatar()}</div>
                      )}
                      
                      {/* Botón para eliminar foto (visible si hay preview o url previa) */}
                      {(avatarPreview || usuario?.avatar_url) && (
                        <button 
                          type="button" 
                          onClick={handleRemoveNow} 
                          disabled={saving} 
                          style={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8, 
                            background: 'white', 
                            color: '#6b21a8', 
                            border: '1px solid #e9d5ff', 
                            borderRadius: '50%', 
                            width: 30, 
                            height: 30, 
                            padding: 0, 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            boxShadow: '0 4px 10px rgba(16,24,40,0.08)' 
                          }} 
                          title="Eliminar foto"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Label para el input de archivo */}
                  <label htmlFor="avatar-upload" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6, 
                    padding: '8px 16px', 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: 8, 
                    cursor: 'pointer', 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#374151', 
                    transition: 'all 0.2s' 
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.borderColor = '#a855f7'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.background = 'white'; 
                    e.currentTarget.style.borderColor = '#e5e7eb'; 
                  }}>
                    <Upload size={16} /> Seleccionar archivo
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: 12, textAlign: 'center' }}>PNG, JPG — máximo 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12, justifyContent: 'flex-end', background: '#fafafa' }}>
          <button 
            onClick={onClose} 
            disabled={saving} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: 8, 
              border: '1px solid #e5e7eb', 
              background: 'white', 
              color: '#374151', 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: saving ? 'not-allowed' : 'pointer', 
              opacity: saving ? 0.5 : 1, 
              transition: 'all 0.2s' 
            }} 
            onMouseEnter={e => !saving && (e.currentTarget.style.background = '#f9fafb')} 
            onMouseLeave={e => !saving && (e.currentTarget.style.background = 'white')}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={saving} 
            style={{ 
              padding: '10px 20px', 
              borderRadius: 8, 
              border: 'none', 
              background: 'var(--primary-gradient)', // Asumiendo que esta variable está definida en tu CSS
              color: 'white', 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: saving ? 'not-allowed' : 'pointer', 
              opacity: saving ? 0.7 : 1, 
              transition: 'all 0.2s', 
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.12)' 
            }} 
            onMouseEnter={e => !saving && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.18)')} 
            onMouseLeave={e => !saving && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.12)')}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}