import React, { useEffect, useState } from 'react';

import { Edit2, Phone, MapPin, Trash2, Calendar, Mail, User, Shield, Lock, Trash, Eye, EyeOff } from 'lucide-react';


import api from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import { logout } from '../services/auth';
import '../components/ProfileSettings.css';

export default function Profile({ defaultTab = 'info' }) {

  // Estados del componente


  const [usuario, setUsuario] = useState(() => {
    try {
      const cached = localStorage.getItem('synapse_usuario');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {

      console.error('Error al cargar usuario de localStorage:', e);
      return null;
    }
  });
  
  const [tareas, setTareas] = useState([]);
  const [logros] = useState([
    { nombre: 'Meditador Novato', icono: '🎯' },
    { nombre: 'Concentración 7 días', icono: '🔥' },
    { nombre: 'Primer Pomodoro', icono: '🍅' },
    { nombre: 'Explorador Zen', icono: '🧘' }
  ]);
  

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

  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [showCurrentPwdChange, setShowCurrentPwdChange] = useState(false);
  const [showNewPwdChange, setShowNewPwdChange] = useState(false);
  const [showConfirmPwdChange, setShowConfirmPwdChange] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');
  const [error, setError] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState('');
  
  // Estados para preferencias
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false
  });

  // Carga inicial de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = res.data;
        setUsuario(userData);
        
        if (userData.created_at) {
          const fecha = new Date(userData.created_at);
          setFechaRegistro(fecha.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
        } else {
          setFechaRegistro('No disponible');
        }
        
        localStorage.setItem('synapse_usuario', JSON.stringify(userData));

  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/me');
        setUsuario(res.data);

      } catch (e) {
        console.error('Error cargando usuario:', e);
        setUsuario({

          username: 'Usuario',

          Username: 'Usuario',

          correo: 'correo@ejemplo.com',
          telefono: '',
          ubicacion: '',


          correo: '',
          telefono: '',
          ubicacion: '',
          fecha_nacimiento: null,

          avatar_url: null,
          nivel: 1,
          sesiones: 0,
          meditadas: '0h',

          descripcion: '',
          es_premium: false
        });
        setFechaRegistro('No disponible');

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

    loadData();
  }, []);

  // Manejo de preferencias
  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Aquí puedes agregar la lógica para guardar en el backend
  };

  // Manejo de Seguridad
  const handleDeleteAccount = async () => {
    setError('');
    if (!password) {
      setError('Por favor, introduce tu contraseña para confirmar la eliminación.');
      return;
    }
    try {
      // Preferir DELETE a /api/usuarios/:id (soft delete implementado en backend)
      const userId = usuario?.id_usuario || usuario?.id || usuario?.usuario_id;
      if (userId) {
        await api.delete(`/usuarios/${userId}`);
        // Backend performs a soft-delete (activo=false). Luego cerramos sesión localmente.
        logout();
        return;
      }

      // Si no hay id, intentar endpoint legacy (no garantizado)
      await api.post('/auth/delete-account', { password });
      logout();
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      const msg = error?.response?.data?.error || error?.response?.data || error?.message || 'Error al eliminar la cuenta.';
      setError(msg);
    }
  };
  const handleLogoutAllDevices = async () => {
    setError('');
    try {
      // Intentamos pedir al backend que cierre todas las sesiones sin contraseña.
      // Si el backend requiere contraseña, ignoramos el error y hacemos un logout local para no bloquear al usuario.
      await api.post('/auth/logout-all-devices', {});
      logout();
    } catch (error) {
      console.warn('logout-all-devices falló, se procede a cerrar sesión localmente', error?.response?.data || error);
      // Fallback: cerrar sesión localmente aunque el backend haya pedido contraseña
      logout();
    }
  };

  const handleChangePassword = async () => {
    setChangeError('');
    setChangeSuccess('');
    if (!changeCurrentPassword || !changeNewPassword || !changeConfirmPassword) {
      setChangeError('Completa todos los campos.');
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      setChangeError('Las nuevas contraseñas no coinciden.');
      return;
    }
    try {
      const res = await api.put('/auth/change-password', {
        current_password: changeCurrentPassword,
        new_password: changeNewPassword
      });
      setChangeSuccess(res.data?.message || 'Contraseña actualizada correctamente.');
      // Limpieza y cierre
      setChangeCurrentPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangeSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      setChangeError(err.response?.data?.error || 'No se pudo cambiar la contraseña.');
    }
  };

  // Funciones de utilidad

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

      str = nameOrUser.nombre_completo || nameOrUser.name || nameOrUser.username || nameOrUser.username || nameOrUser.email || '';


      str = nameOrUser.nombre_completo || nameOrUser.name || nameOrUser.Username || 
            nameOrUser.username || nameOrUser.correo || nameOrUser.email || '';

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

  const displayName = usuario?.nombre_completo || usuario?.username || usuario?.name || 'Usuario';
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

      localStorage.setItem('synapse_usuario', JSON.stringify(res.data));

      try { localStorage.setItem('synapse_usuario', JSON.stringify(res.data)); } catch(e){}

    } catch (e) {
      console.error('Error eliminando avatar:', e);
      alert('No se pudo eliminar la foto');
    }
  };

  const handleDescripcionBlur = async () => {

    if (!usuario || usuario.descripcion === undefined || usuario.descripcion === null) return;
    

    if (!usuario) return;

    try {
      const fd = new FormData();
      fd.append('descripcion', usuario.descripcion || '');
      const res = await api.put('/auth/me', fd);
      setUsuario(res.data);

      localStorage.setItem('synapse_usuario', JSON.stringify(res.data));

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


  // Componente auxiliar para items de información
  const InfoItem = ({ icon: Icon, title, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ 
        background: '#f3e8ff', 
        padding: 8, 
        borderRadius: 8, 
        flexShrink: 0 
      }}>
        <Icon size={18} color="#a855f7" />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#666' }}>{title}</div>
        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{value || '—'}</div>
      </div>
    </div>
  );


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

        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          margin: 0, 
          color: 'var(--text-primary, #1a1a1a)' 
        }}>
          Mi Perfil
        </h1>
        <p style={{ 
          color: 'var(--text-secondary, #666)', 
          fontSize: 14, 
          margin: '4px 0 0 0' 
        }}>

        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, color:'var(--text-primary)' }}>
          Mi Perfil
        </h1>
        <p style={{ color: 'var(--text-primary)', fontSize: 14, margin: '4px 0 0 0' }}>

          Gestiona tu información personal y preferencias
        </p>
      </div>


      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />


      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        borderBottom: '2px solid #f0f0f0'
      }}>

        {['info', 'stats', 'settings'].map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: tab === tabName ? 'var(--primary-gradient, linear-gradient(135deg, #a855f7, #ec4899))' : 'transparent',
              color: tab === tabName ? 'white' : '#666',
              borderRadius: '12px 12px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.3s'
            }}
          >
            {tabName === 'info' && 'Información'}
            {tabName === 'stats' && 'Estadísticas'}
            {tabName === 'settings' && 'Configuración'}
          </button>
        ))}
      </div>

      {/* Tab Content: Información */}

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

            background: 'var(--primary-gradient, linear-gradient(135deg, #a855f7, #ec4899))',

            background: 'var(--primary-gradient)',

            borderRadius: 20,
            padding: 32,
            color: 'white',
            marginBottom: 24,
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)'
          }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 20, position: 'relative' }}>
                  <div style={{
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
                  }}>
                    {usuario?.avatar_url ? (
                      <img src={usuario.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

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

            {/* Contacto y Ubicación */}

            {/* Información Personal */}

            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>

              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                Contacto y Ubicación
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <InfoItem icon={Phone} title="Teléfono" value={usuario?.telefono} />
                <InfoItem icon={MapPin} title="Ubicación" value={usuario?.ubicacion} />
              </div>
            </div>

            {/* Información de la Cuenta */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                Información de la Cuenta
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <InfoItem icon={User} title="Nombre de Usuario" value={usuario?.Username} />
                <InfoItem icon={Mail} title="Email" value={usuario?.correo} />
                <InfoItem icon={Shield} title="Tipo de Cuenta" value={usuario?.es_premium ? 'Premium ⭐' : 'Básica'} />
              </div>
            </div>

            {/* Sobre mí */}
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              gridColumn: '1 / span 2'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                Sobre mí
              </h3>
              <textarea
                placeholder="Añade una breve biografía sobre ti..."
                value={usuario.descripcion || ''}
                onChange={e => setUsuario(u => ({ ...u, descripcion: e.target.value }))}
                onBlur={handleDescripcionBlur}
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />

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

              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              gridColumn: '1 / span 2'
            }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
                Logros Recientes
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12
              }}>

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

                      background: 'var(--primary-gradient, linear-gradient(135deg, #a855f7, #ec4899))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',

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

        </div>
      )}

      {/* Tab Content: Estadísticas */}


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

          <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>
            Estadísticas de Productividad
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div style={{ padding: 20, background: '#faf5ff', borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#a855f7' }}>{tareas.length}</div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Tareas Totales</div>
            </div>
            <div style={{ padding: 20, background: '#fef3f8', borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#ec4899' }}>
                {tareas.filter(t => t.completada).length}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Tareas Completadas</div>
            </div>
            <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>
                Nivel {usuario?.nivel || 1}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Nivel de Enfoque</div>
            </div>
            <div style={{ padding: 20, background: '#fef9f3', borderRadius: 12 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>
                {usuario?.sesiones || 0}
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>Sesiones Completadas</div>
            </div>
          </div>
          <div style={{ marginTop: 24, padding: 20, background: '#f9fafb', borderRadius: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>
              Tiempo Total de Concentración
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#a855f7' }}>
              {usuario?.meditadas || '0h'}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Configuración */}
      {tab === 'settings' && (
        <div className="settings-section">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Preferencias */}
          <div className="settings-group">
            <h3>Preferencias</h3>
            
            <div className="settings-option">
              <div className="settings-option-info">
                <div className="settings-option-title">Notificaciones push</div>
                <div className="settings-option-description">
                  Recibe notificaciones para tus sesiones
                </div>
              </div>
              <button
                className={`toggle-switch ${preferences.pushNotifications ? 'active' : ''}`}
                onClick={() => togglePreference('pushNotifications')}
              />
            </div>

            <div className="settings-option">
              <div className="settings-option-info">
                <div className="settings-option-title">Actualizaciones por email</div>
                <div className="settings-option-description">
                  Recibe noticias y consejos por correo
                </div>
              </div>
              <button
                className={`toggle-switch ${preferences.emailNotifications ? 'active' : ''}`}
                onClick={() => togglePreference('emailNotifications')}
              />
            </div>
          </div>

          {/* Configuración de Cuenta */}
          <div className="settings-group">
            <h3>Configuración de Cuenta</h3>
            
            <div className="settings-option">
              <div className="settings-option-info">
                <div className="settings-option-title">Cambiar Contraseña</div>
                <div className="settings-option-description">
                  Actualiza tu contraseña de acceso
                </div>
              </div>
                <button className="action-button" onClick={() => { setShowChangePasswordModal(true); setChangeError(''); setChangeSuccess(''); }}>
                  <Lock size={18} />
                  Cambiar Contraseña
                </button>
            </div>
          </div>

          {/* Zona Peligrosa */}
          <div className="settings-group">
            <h3>Zona Peligrosa</h3>
            
            <div className="settings-option">
              <div className="settings-option-info">
                <div className="settings-option-title">Cerrar sesión en todos los dispositivos</div>
                <div className="settings-option-description">
                  Cierra tu sesión en todos los dispositivos excepto este
                </div>
              </div>
              <button
                className="action-button"
                onClick={() => {
                  setShowLogoutAllConfirm(true);
                  setPassword('');
                  setError('');
                }}
              >
                Cerrar sesiones
              </button>
            </div>

            <div className="settings-option">
              <div className="settings-option-info">
                <div className="settings-option-title">Eliminar Cuenta</div>
                <div className="settings-option-description">
                  Elimina permanentemente tu cuenta y todos tus datos
                </div>
              </div>
              <button
                className="danger-button"
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setPassword('');
                  setError('');
                }}
              >
                <Trash size={18} />
                Eliminar Cuenta
              </button>
            </div>
          </div>

          {/* Modal: Cerrar sesión en todos los dispositivos */}
          {showLogoutAllConfirm && (
            <div className="modal-backdrop">
              <div className="confirmation-modal">
                <h3>Cerrar sesión en todos los dispositivos</h3>
                <p>¿Deseas cerrar la sesión en todos los dispositivos? Esta acción cerrará las sesiones remotas pero no afectará a esta ventana.</p>
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
                    onClick={() => { setShowLogoutAllConfirm(false); handleLogoutAllDevices(); }}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Eliminar cuenta */}
          {showDeleteConfirm && (
            <div className="modal-backdrop">
              <div className="confirmation-modal">
                <h3>Eliminar cuenta</h3>
                <p>¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.</p>
                <p>Por favor, introduce tu contraseña para confirmar:</p>
                <div className="input-wrap">
                  <span className="input-icon"><Lock size={16} /></span>
                  <input
                    className="auth-input"
                    type={showDeletePassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(s => !s)}
                    aria-label={showDeletePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showDeletePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                    disabled={!password}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Cambiar contraseña */}
          {showChangePasswordModal && (
            <div className="modal-backdrop">
              <div className="confirmation-modal">
                <h3>Cambiar contraseña</h3>
                {changeError && <div className="error-message">{changeError}</div>}
                {changeSuccess && <div style={{ padding: 12, background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8, color: '#065f46', marginBottom: 12 }}>{changeSuccess}</div>}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Contraseña actual</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      className="auth-input"
                      type={showCurrentPwdChange ? 'text' : 'password'}
                      value={changeCurrentPassword}
                      onChange={(e) => setChangeCurrentPassword(e.target.value)}
                      placeholder="Contraseña actual"
                    />
                    <button type="button" onClick={() => setShowCurrentPwdChange(s => !s)} aria-label={showCurrentPwdChange ? 'Ocultar' : 'Mostrar'}>
                      {showCurrentPwdChange ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Nueva contraseña</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      className="auth-input"
                      type={showNewPwdChange ? 'text' : 'password'}
                      value={changeNewPassword}
                      onChange={(e) => setChangeNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                    />
                    <button type="button" onClick={() => setShowNewPwdChange(s => !s)} aria-label={showNewPwdChange ? 'Ocultar' : 'Mostrar'}>
                      {showNewPwdChange ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Confirmar nueva contraseña</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Lock size={16} /></span>
                    <input
                      className="auth-input"
                      type={showConfirmPwdChange ? 'text' : 'password'}
                      value={changeConfirmPassword}
                      onChange={(e) => setChangeConfirmPassword(e.target.value)}
                      placeholder="Confirmar nueva contraseña"
                    />
                    <button type="button" onClick={() => setShowConfirmPwdChange(s => !s)} aria-label={showConfirmPwdChange ? 'Ocultar' : 'Mostrar'}>
                      {showConfirmPwdChange ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setChangeError('');
                      setChangeSuccess('');
                      setChangeCurrentPassword('');
                      setChangeNewPassword('');
                      setChangeConfirmPassword('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handleChangePassword}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

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