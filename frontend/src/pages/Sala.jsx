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

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      alert('Código copiado al portapapeles');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); alert('Código copiado al portapapeles'); } catch (err) { prompt('Copia el código manualmente:', text); }
      ta.remove();
    }
  }

  return (
    <div className="container">
      <h1>Salas</h1>
      {error && <div className="error-text">{error}</div>}
      <div className="sala-grid">
        <div className="sala-column">
          <div className="card">
            <h2 className="card-title">Crear sala</h2>
            <form onSubmit={handleCreate} className="form-stack">
              <label className="field">Nombre<br /><input name="nombre" value={form.nombre} onChange={handleChange} className="input" /></label>
              <label className="field">Descripción<br /><input name="descripcion" value={form.descripcion} onChange={handleChange} className="input" /></label>
              <label className="field">Privada <input type="checkbox" name="es_privada" checked={form.es_privada} onChange={handleChange} /></label>
              <label className="field">Max participantes<br /><input name="max_participantes" type="number" value={form.max_participantes} onChange={handleChange} className="input" /></label>
              <button type="submit" className="btn primary">Crear</button>
            </form>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h2 className="card-title">Mis salas</h2>
            {loading ? <div>Cargando...</div> : (
              <div className="sala-list">
                {mySalas.map(s => (
                  <div className="sala-card" key={s.id_sala}>
                    <div className="sala-info">
                      <div className="sala-name">{s.nombre} {s.es_privada ? <span className="tag">Privada</span> : null}</div>
                      <div className="sala-meta">{s.descripcion}</div>
                    </div>
                    <div className="sala-actions">
                      <button className="btn" onClick={() => handleOpenSala(s.id_sala)}>Abrir</button>
                      {s.creador_id === usuario?.id_usuario && s.codigo_acceso && (
                        <button className="btn copy-btn" onClick={() => copyText(s.codigo_acceso)}>Copiar código</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sala-column">
          <div className="card">
            <h2 className="card-title">Salas públicas</h2>
            {loading ? <div>Cargando...</div> : (
              <div className="sala-list">
                {publicSalas.map(s => (
                  <div className="sala-card" key={s.id_sala}>
                    <div className="sala-info">
                      <div className="sala-name">{s.nombre}</div>
                      <div className="sala-meta">creador: {s.creador?.username || s.creador?.correo}</div>
                    </div>
                    <div className="sala-actions">
                      <button className="btn" onClick={() => handleOpenSala(s.id_sala)}>Ver detalles</button>
                      {s.creador_id === usuario?.id_usuario && s.codigo_acceso && (
                        <button className="btn copy-btn" onClick={() => copyText(s.codigo_acceso)}>Copiar código</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ marginTop: 12 }}>Unirse a sala privada</h3>
            <div className="form-inline">
              <input placeholder="ID de sala" id="joinId" className="input" />
              <input placeholder="Código de acceso" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="input" />
              <button className="btn" onClick={() => handleJoin(document.getElementById('joinId').value)}>Unirse</button>
            </div>
          </div>
        </div>
      </div>

      {selectedSala && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Detalle sala: {selectedSala.nombre}</h3>
          <p className="sala-desc">{selectedSala.descripcion}</p>
          <p>Creada por: {selectedSala.creador_id}</p>
          <p>Participantes: {selectedSala.total_participantes}</p>
          {selectedSala.participantes && (
            <ul className="participants-list">
              {selectedSala.participantes.map(p => (
                <li key={p.id_usuario}>{p.username || p.Username || p.correo}</li>
              ))}
            </ul>
          )}

          {selectedSala.creador_id === usuario?.id_usuario && selectedSala.codigo_acceso && (
            <div className="access-block">
              <div>Código de acceso:</div>
              <div className="access-code">{selectedSala.codigo_acceso}</div>
              <button className="btn copy-btn" onClick={() => copyText(selectedSala.codigo_acceso)}>Copiar código</button>
            </div>
          )}

          {selectedSala.creador_id === usuario?.id_usuario && (
            <div style={{ marginTop: 8 }}><em>Eres el creador/leader de esta sala.</em></div>
          )}

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => setSelectedSala(null)}>Cerrar</button>
            <button className="btn" onClick={() => handleLeave(selectedSala.id_sala)} style={{ marginLeft: 8 }}>Salir</button>
          </div>
        </div>
      )}
    </div>
  );
}
