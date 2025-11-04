import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getUsuario } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const usuario = getUsuario();

  useEffect(() => {
    async function loadUsuarios() {
      try {
        const response = await api.get('/admin/usuarios');
        setUsuarios(response.data || []);
        setError('');
      } catch (e) {
        console.error('Error loading users:', e);
        setError('No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    }
    loadUsuarios();
  }, []);

  async function handleDeactivateUser(userId) {
    if (!window.confirm('¿Seguro que deseas desactivar este usuario?')) return;
    try {
      await api.post(`/admin/usuarios/${userId}/desactivar`);
      setUsuarios(usuarios.map(u => u.id_usuario === userId ? { ...u, activo: false } : u));
      setError('');
    } catch (e) {
      console.error('Error desactivando usuario:', e);
      setError('Error al desactivar usuario');
    }
  }

  function handleEditClick(user) {
    setEditUser(user);
    setEditForm({ ...user });
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleEditSave() {
    try {
      await api.put(`/admin/usuarios/${editUser.id_usuario}`, editForm);
      setUsuarios(usuarios.map(u => u.id_usuario === editUser.id_usuario ? { ...u, ...editForm } : u));
      setEditUser(null);
      setError('');
    } catch (e) {
      setError('Error al editar usuario');
    }
  }

  // Redirigir si no es admin
  useEffect(() => {
    if (!(usuario?.rol_id === 1)) {
      navigate('/');
    }
  }, [navigate, usuario]);

  const nombreAdmin = usuario?.nombre_completo || usuario?.Username || usuario?.correo;

  return (
    <div className="admin-panel">
      <h1>Bienvenido administrador {nombreAdmin}</h1>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div>Cargando usuarios...</div>
      ) : (
        <div className="users-table">
          <h2>Usuarios Registrados</h2>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id_usuario}>
                  <td>{user.Username}</td>
                  <td>{user.correo}</td>
                  <td>{user.rol_id === 1 ? 'Admin' : 'Cliente'}</td>
                  <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
                  <td>
                    <button 
                      onClick={() => handleDeactivateUser(user.id_usuario)}
                      className="deactivate-btn"
                      disabled={!user.activo}
                    >
                      Desactivar
                    </button>
                    <button 
                      onClick={() => handleEditClick(user)}
                      className="edit-btn"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editUser && (
        <div className="edit-modal">
          <h3>Editar usuario</h3>
          <div className="edit-form">
            <label>Username: <input name="Username" value={editForm.Username || ''} onChange={handleEditChange} /></label>
            <label>Email: <input name="correo" value={editForm.correo || ''} onChange={handleEditChange} /></label>
            <label>Nombre completo: <input name="nombre_completo" value={editForm.nombre_completo || ''} onChange={handleEditChange} /></label>
            <label>Teléfono: <input name="telefono" value={editForm.telefono || ''} onChange={handleEditChange} /></label>
            <label>Ubicación: <input name="ubicacion" value={editForm.ubicacion || ''} onChange={handleEditChange} /></label>
            <label>Fecha nacimiento: <input name="fecha_nacimiento" value={editForm.fecha_nacimiento || ''} onChange={handleEditChange} /></label>
            <label>Descripción: <input name="descripcion" value={editForm.descripcion || ''} onChange={handleEditChange} /></label>
            <label>Rol: <select name="rol_id" value={editForm.rol_id} onChange={handleEditChange}>
              <option value={1}>Admin</option>
              <option value={2}>Cliente</option>
            </select></label>
            <label>Activo: <select name="activo" value={editForm.activo ? 'true' : 'false'} onChange={e => setEditForm({ ...editForm, activo: e.target.value === 'true' })}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select></label>
            <div style={{ marginTop: 12 }}>
              <button onClick={handleEditSave} className="save-btn">Guardar</button>
              <button onClick={() => setEditUser(null)} className="cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .admin-panel {
          padding: 2rem;
        }
        .users-table {
          margin-top: 2rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 0.75rem;
          border: 1px solid #ddd;
        }
        th {
          background: #f5f5f5;
        }
        .deactivate-btn {
          background: #f59e42;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 6px;
        }
        .deactivate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .deactivate-btn:hover:not(:disabled) {
          background: #d97706;
        }
        .edit-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .edit-btn:hover {
          background: #1d4ed8;
        }
        .error-message {
          color: #dc3545;
          padding: 1rem;
          margin: 1rem 0;
          border: 1px solid #dc3545;
          border-radius: 4px;
        }
        .edit-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .edit-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          min-width: 320px;
        }
        .edit-form label {
          display: block;
          margin-bottom: 10px;
        }
        .save-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
        }
        .save-btn:hover {
          background: #1d4ed8;
        }
        .cancel-btn {
          background: #f3f4f6;
          color: #4b5563;
          border: 1px solid #e5e7eb;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .cancel-btn:hover {
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
