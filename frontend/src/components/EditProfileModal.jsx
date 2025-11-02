import React, { useEffect, useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function EditProfileModal({ open, onClose, usuario, onUpdated }) {
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && usuario) {
      setForm({
        Username: usuario.Username || '',
        nombre_completo: usuario.nombre_completo || '',
        correo: usuario.correo || '',
        telefono: usuario.telefono || '',
        ubicacion: usuario.ubicacion || '',
        fecha_nacimiento: usuario.fecha_nacimiento || '',
        descripcion: usuario.descripcion || ''
      });
      setAvatarPreview(usuario.avatar_url || null);
    }
  }, [open, usuario]);

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    
    // Validar tamaño (2MB)
    if (f.size > 2 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 2MB.');
      return;
    }
    
    setForm(prev => ({ ...prev, avatar: f }));
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleRemoveNow = async () => {
    if (!window.confirm('¿Eliminar la foto de perfil?')) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('remove_avatar', '1');
      const res = await api.put('/auth/me', fd);
      // clear local preview and form
      setAvatarPreview(null);
      setForm(f => ({ ...f, avatar: null, remove_avatar: false }));
      try {
        localStorage.setItem('synapse_usuario', JSON.stringify(res.data));
      } catch (e) {}
      onUpdated && onUpdated(res.data);
    } catch (e) {
      console.error('Error removing avatar:', e);
      alert('No se pudo eliminar la foto');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.Username) fd.append('Username', form.Username);
      if (form.nombre_completo) fd.append('nombre_completo', form.nombre_completo);
      if (form.correo) fd.append('correo', form.correo);
      if (form.telefono) fd.append('telefono', form.telefono);
      if (form.ubicacion) fd.append('ubicacion', form.ubicacion);
      if (form.fecha_nacimiento) fd.append('fecha_nacimiento', form.fecha_nacimiento);
      if (form.descripcion) fd.append('descripcion', form.descripcion);
      if (form.avatar) fd.append('avatar', form.avatar);
  // If user marked remove_avatar, include that flag so backend can delete existing file
  if (form.remove_avatar) fd.append('remove_avatar', '1');

      // Don't set Content-Type manually so the browser can add the multipart boundary
      const res = await api.put('/auth/me', fd);

      // Try to fetch fresh user data from the server (in case PUT returns partial data)
      let fresh = res.data;
      try {
        const meRes = await api.get('/auth/me');
        if (meRes && meRes.data) fresh = meRes.data;
      } catch (e) {
        // ignore, we'll use res.data
      }

      try {
        localStorage.setItem('synapse_usuario', JSON.stringify(fresh));
      } catch (e) {
        // ignore storage errors
      }

      onUpdated && onUpdated(fresh);
      onClose && onClose();
    } catch (e) {
      console.error('Error saving profile:', e);
      if (e?.response?.status === 409) {
        alert('El correo ya está en uso');
      } else {
        alert('No se pudo actualizar el perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  // getInitials robusta: acepta string o objeto usuario
  const getInitials = (nameOrUser) => {
    if (!nameOrUser) return 'U';
    let str = '';
    if (typeof nameOrUser === 'string') {
      str = nameOrUser;
    } else if (typeof nameOrUser === 'object') {
      str = nameOrUser.nombre_completo || nameOrUser.name || nameOrUser.Username || nameOrUser.username || nameOrUser.email || '';
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

      {/* Modal */}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Columna Izquierda */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={form.Username || ''}
                  onChange={e => setForm(f => ({ ...f, Username: e.target.value }))}
                  placeholder="Ingresa tu nombre completo"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={form.correo || ''}
                  onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                  placeholder="tu@email.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.telefono || ''}
                  onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  placeholder="+34 612 345 678"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Ubicación
                </label>
                <input
                  type="text"
                  value={form.ubicacion || ''}
                  onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
                  placeholder="Madrid, España"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={form.fecha_nacimiento || ''}
                  onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Columna Derecha */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Foto de perfil
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    padding: 20,
                    border: '2px dashed #e5e7eb',
                    borderRadius: 12,
                    background: '#fafafa'
                  }}
                >
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                      fontWeight: 800,
                      color: 'white',
                      border: '4px solid rgba(255,255,255,0.7)',
                      boxShadow: '0 8px 24px rgba(16,24,40,0.2)'
                    }}
                  >
                    <div style={{position: 'relative', width: '100%', height: '100%'}}>
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="avatar"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{width: '100%', height: '100%', display:'flex',alignItems:'center',justifyContent:'center'}}>{getInitials(form.Username || usuario?.Username)}</div>
                      )}
                      {/* Small delete button top-right */}
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

                  <label
                    htmlFor="avatar-upload"
                    style={{
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
                    }}
                  >
                    <Upload size={16} />
                    Seleccionar archivo
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    style={{ display: 'none' }}
                  />
                  <p
                    style={{
                      margin: 0,
                      color: '#9ca3af',
                      fontSize: 12,
                      textAlign: 'center'
                    }}
                  >
                    PNG, JPG — máximo 2MB
                  </p>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 6
                  }}
                >
                  Biografía
                </label>
                <textarea
                  value={form.descripcion || ''}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Cuéntanos sobre ti..."
                  style={{
                    width: '100%',
                    minHeight: 120,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            background: '#fafafa'
          }}
        >
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
              background: 'var(--primary-gradient)',
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