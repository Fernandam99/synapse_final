import React, { useEffect, useState } from 'react';
import { getUsuario } from '../services/auth';
import { createSala, getMySalas, getPublicSalas, getSalaDetalle, unirseSala, salirSala } from '../services/sala';

export default function SalaPage() {
  const usuario = getUsuario();
  const [mySalas, setMySalas] = useState([]);
  const [publicSalas, setPublicSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nombre: '', descripcion: '', es_privada: false, max_participantes: 0 });
  const [selectedSala, setSelectedSala] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mine, pub] = await Promise.all([getMySalas(), getPublicSalas()]);
      setMySalas(mine || []);
      setPublicSalas(pub || []);
    } catch (e) {
      setError('Error cargando salas');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (!payload.nombre) return setError('El nombre es requerido');
      const created = await createSala(payload);
      // reload lists
      await loadData();
      // Mostrar código de acceso solo si el creador lo recibe (salas privadas)
      if (created.codigo_acceso) {
        // Mostrar en alerta y copiar al portapapeles
        try { await navigator.clipboard.writeText(created.codigo_acceso); } catch (e) {}
        alert(`Sala creada. ID: ${created.id_sala}\nCódigo de acceso (copiado al portapapeles): ${created.codigo_acceso}`);
      } else {
        alert('Sala creada');
      }
      setForm({ nombre: '', descripcion: '', es_privada: false, max_participantes: 0 });
    } catch (err) {
      setError(err.response?.data?.error || String(err));
    }
  }

  async function handleOpenSala(salaId) {
    setError('');
    try {
      const det = await getSalaDetalle(salaId);
      setSelectedSala(det);
    } catch (err) {
      setError(err.response?.data?.error || String(err));
    }
  }

  async function handleJoin(salaId) {
    setError('');
    try {
      await unirseSala(salaId, joinCode);
      await loadData();
      alert('Te uniste a la sala');
    } catch (err) {
      setError(err.response?.data?.error || String(err));
    }
  }

  async function handleLeave(salaId) {
    setError('');
    try {
      await salirSala(salaId);
      setSelectedSala(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || String(err));
    }
  }

  return (
    <div className="container">
      <h1>Salas</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Crear sala</h2>
          <form onSubmit={handleCreate}>
            <label>Nombre<br /><input name="nombre" value={form.nombre} onChange={handleChange} /></label><br />
            <label>Descripción<br /><input name="descripcion" value={form.descripcion} onChange={handleChange} /></label><br />
            <label>Privada <input type="checkbox" name="es_privada" checked={form.es_privada} onChange={handleChange} /></label><br />
            <label>Max participantes<br /><input name="max_participantes" type="number" value={form.max_participantes} onChange={handleChange} /></label><br />
            <button type="submit">Crear</button>
          </form>

          <h2>Mis salas</h2>
          {loading ? <div>Cargando...</div> : (
            <ul>
              {mySalas.map(s => (
                <li key={s.id_sala}>
                  <strong>{s.nombre}</strong> {s.es_privada ? '(Privada)' : ''} — creado por ti
                  <button onClick={() => handleOpenSala(s.id_sala)} style={{ marginLeft: 8 }}>Abrir</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h2>Salas públicas</h2>
          {loading ? <div>Cargando...</div> : (
            <ul>
              {publicSalas.map(s => (
                <li key={s.id_sala}>
                  <strong>{s.nombre}</strong> — creador: {s.creador?.username || s.creador?.correo}
                  <button onClick={() => handleOpenSala(s.id_sala)} style={{ marginLeft: 8 }}>Ver detalles</button>
                </li>
              ))}
            </ul>
          )}

          <h3>Unirse a sala privada</h3>
          <div>
            <input placeholder="ID de sala" id="joinId" />
            <input placeholder="Código de acceso" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            <button onClick={() => handleJoin(document.getElementById('joinId').value)}>Unirse</button>
          </div>
        </div>
      </div>

      {selectedSala && (
        <div style={{ marginTop: 20, border: '1px solid #ddd', padding: 12 }}>
          <h3>Detalle sala: {selectedSala.nombre}</h3>
          <p>{selectedSala.descripcion}</p>
          <p>Creada por: {selectedSala.creador_id}</p>
          <p>Participantes: {selectedSala.total_participantes}</p>
          {selectedSala.participantes && (
            <ul>
              {selectedSala.participantes.map(p => (
                <li key={p.id_usuario}>{p.username || p.Username || p.correo}</li>
              ))}
            </ul>
          )}

          {/* Mostrar botón salir o eliminar si eres líder */}
          {selectedSala.creador_id === usuario?.id_usuario && (
            <div>
              <em>Eres el creador/leader de esta sala.</em>
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            <button onClick={() => setSelectedSala(null)}>Cerrar</button>
            <button onClick={() => handleLeave(selectedSala.id_sala)} style={{ marginLeft: 8 }}>Salir</button>
          </div>
        </div>
      )}
    </div>
  );
}
