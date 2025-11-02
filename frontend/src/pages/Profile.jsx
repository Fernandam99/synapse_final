import React, { useEffect, useState } from 'react';
import { Edit2, Phone, Calendar, MapPin, Trash2 } from 'lucide-react';
import api from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import { logout } from '../services/auth';
import '../components/ProfileSettings.css';

export default function Profile({ defaultTab = 'info' }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const cached = localStorage.getItem('synapse_usuario');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [tareas, setTareas] = useState([]);
  const [logros] = useState([
    { nombre: 'Meditador Novato', icono: '🎯' },
    { nombre: 'Concentración 7 días', icono: '🎯' },
    { nombre: 'Primer Pomodoro', icono: '🎯' },
    { nombre: 'Explorador Zen', icono: '🎯' }
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState(defaultTab);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        setUsuario(res.data);
      } catch (e) {
        console.error('Error cargando usuario:', e);
        setUsuario({
          Username: 'Usuario',
          correo: '',
          telefono: '',
          ubicacion: '',
          fecha_nacimiento: null,
          avatar_url: null,
          nivel: 1,
          sesiones: 0,
          meditadas: '0h',
          descripcion: ''
        });
      }

      try {
        const res2 = await api.get('/tareas');
        setTareas(Array.isArray(res2.data) ? res2.data : res2.data.results || []);
      } catch (e) {
        console.error('Error cargando tareas:', e);
        setTareas([]);
      }
    };
    load();
  }, []);

  const handleDeleteAccount = async () => {
    try {
      await api.post('/auth/delete-account', { password });
      logout();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al eliminar la cuenta');
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await api.post('/auth/logout-all-devices', { password });
      logout();
    } catch (error) {
      setError(error.response?.data?.error || 'Error al cerrar sesión en todos los dispositivos');
    }
  };

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

  const displayName = usuario?.nombre_completo || usuario?.Username || usuario?.name || 'Usuario';
  const displayEmail = usuario?.correo || usuario?.email || '';

  const handleModalUpdated = (updatedUser) => {
    setUsuario(updatedUser);
    try {
      localStorage.setItem('synapse_usuario', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Error guardando en localStorage:', e);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!usuario) return;
    if (!window.confirm('¿Eliminar la foto de perfil?')) return;
    try {
      const fd = new FormData();
      fd.append('remove_avatar', '1');
      const res = await api.put('/auth/me', fd);
      setUsuario(res.data);
      try { localStorage.setItem('synapse_usuario', JSON.stringify(res.data)); } catch(e){}
    } catch (e) {
      console.error('Error eliminando avatar:', e);
      alert('No se pudo eliminar la foto');
    }
  };

  const handleDescripcionBlur = async () => {
    if (!usuario) return;
    try {
      const fd = new FormData();
      fd.append('descripcion', usuario.descripcion || '');
      const res = await api.put('/auth/me', fd);
      setUsuario(res.data);
      try {
        localStorage.setItem('synapse_usuario', JSON.stringify(res.data));
      } catch (e) {
        console.error('Error guardando en localStorage:', e);
      }
    } catch (e) {
      console.error('Error actualizando descripción:', e);
      alert('No se pudo actualizar la descripción');
    }
  };

  if (!usuario) return <div style={{ padding: 20 }}>Cargando perfil...</div>;

  return (
    <div style={{
      maxWidth: 1200,
      margin: '0 auto',
      padding: 20,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color:'var(--text-primary)' }}>
          Mi Perfil
        </h1>
        <p style={{ color: 'var(--text-primary)', fontSize: 14, margin: '4px 0 0 0' }}>
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        borderBottom: '2px solid #f0f0f0'
      }}>
        <button
          onClick={() => setTab('info')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'info' ? 'var(--primary-gradient)' : 'transparent',
            color: tab === 'info' ? 'white' : '#666',
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            transition: 'all 0.3s'
          }}
        >
          Información
        </button>
        <button
          onClick={() => setTab('stats')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'stats' ? 'var(--primary-gradient)' : 'transparent',
            color: tab === 'stats' ? 'white' : '#666',
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            transition: 'all 0.3s'
          }}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setTab('settings')}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: tab === 'settings' ? 'var(--primary-gradient)' : 'transparent',
            color: tab === 'settings' ? 'white' : '#666',
            borderRadius: '12px 12px 0 0',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            transition: 'all 0.3s'
          }}
        >
          Configuración
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'settings' && (
        <div className="settings-section">
          {error && <div className="error-message">{error}</div>}
          
          <div className="settings-group">
            <h3>Seguridad de la Cuenta</h3>
            
            <div className="settings-option">
              <button 
                className="danger-button"
                onClick={() => setShowLogoutAllConfirm(true)}
              >
                Cerrar sesión en todos los dispositivos
              </button>
            </div>

            <div className="settings-option">
              <button 
                className="danger-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar cuenta
              </button>
            </div>
          </div>

          {/* Modal de confirmación para cerrar sesión en todos los dispositivos */}
          {showLogoutAllConfirm && (
            <div className="modal-backdrop">
              <div className="confirmation-modal">
                <h3>Cerrar sesión en todos los dispositivos</h3>
                <p>Por favor, introduce tu contraseña para confirmar:</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                />
                <div className="modal-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowLogoutAllConfirm(false);
                      setPassword('');
                      setError('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="confirm-button"
                    onClick={handleLogoutAllDevices}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación para eliminar cuenta */}
          {showDeleteConfirm && (
            <div className="modal-backdrop">
              <div className="confirmation-modal">
                <h3>Eliminar cuenta</h3>
                <p>¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
                <p>Por favor, introduce tu contraseña para confirmar:</p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                />
                <div className="modal-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setPassword('');
                      setError('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="confirm-button danger"
                    onClick={handleDeleteAccount}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Información */}
      {tab === 'info' && (
        <div className="profile-info">
          {/* Profile Card */}
          <div style={{
            background: 'var(--primary-gradient)',
            borderRadius: 20,
            padding: 32,
            color: 'white',
            marginBottom: 24,
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 20, position: 'relative' }}>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: usuario?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      fontWeight: 800,
                      color: 'white',
                      border: '4px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 10px 30px rgba(16,24,40,0.12)'
                    }}
                  >
                    {usuario?.avatar_url ? (
                      <img
                        src={usuario.avatar_url}
                        alt="avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{getInitials(usuario)}</span>
                    )}
                  </div>
                  {usuario?.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      title="Eliminar foto"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: '1px solid #f3e8ff',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        cursor: 'pointer',
                        boxShadow: '0 6px 14px rgba(16,24,40,0.08)'
                      }}
                    >
                      <Trash2 size={14} color="#6b21a8" />
                    </button>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{displayName}</div>
                  <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{displayEmail}</div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setModalOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: 10,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Edit2 size={16} />
                  Editar perfil
                </button>
              </div>
            </div>
          </div>

          {/* Grid de información */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Información Personal */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a1a'
              }}>
                Información Personal
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                    <Phone size={18} color="#a855f7" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Teléfono</div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {usuario?.telefono || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                    <Calendar size={18} color="#a855f7" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Fecha de Nacimiento</div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {usuario?.fecha_nacimiento
                        ? new Date(usuario.fecha_nacimiento).toLocaleDateString('es-ES')
                        : '—'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#f3e8ff', padding: 8, borderRadius: 8 }}>
                    <MapPin size={18} color="#a855f7" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#666' }}>Ubicación</div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                      {usuario?.ubicacion || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logros Recientes */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a1a'
              }}>
                Logros Recientes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {logros.map((logro, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      background: '#faf5ff',
                      borderRadius: 10,
                      border: '1px solid #f3e8ff'
                    }}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 18
                    }}>
                      {logro.icono}
                    </div>
                    <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>
                      {logro.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sobre mí */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24,
            marginTop: 24
          }}>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: 18,
                fontWeight: 700,
                color: '#1a1a1a'
              }}>
                Sobre mí
              </h3>
              <input
                type="text"
                placeholder="Añade una breve biografía sobre ti."
                value={usuario.descripcion || ''}
                onChange={e => setUsuario(u => ({ ...u, descripcion: e.target.value }))}
                onBlur={handleDescripcionBlur}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Estadísticas */}
      {tab === 'stats' && (
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: 18,
            fontWeight: 700,
            color: '#1a1a1a'
          }}>
            Estadísticas
          </h3>
          <div>Mis tareas: {tareas.length}</div>
        </div>
      )}

      {/* Modal de edición */}
      <EditProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={usuario}
        onUpdated={handleModalUpdated}
      />
    </div>
  );
}