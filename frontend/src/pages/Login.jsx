import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { saveToken, saveUsuario } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ onSuccess, onSwitchMode }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr('Por favor ingresa un correo válido');
  if (!password || password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres');

    try {
      const res = await api.post(cfg.paths.login, { correo: email, password });
      const data = res.data || {};
      const token = data[cfg.tokenField] || data.access_token || data.access;
      const usuario = data[cfg.usuarioField] || data.usuario || null;

  if (!token) return setErr('No se recibió el token de acceso');

      saveToken(token);
      try { const apiInstance = require('../services/api').default; apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch {}
      if (usuario) saveUsuario(usuario);
      if (onSuccess) onSuccess('login'); else nav('/dashboard');
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.error || error.response?.data || error.message || '';
      const normalized = typeof serverMsg === 'string' && /desactiv/i.test(serverMsg)
        ? 'Esta cuenta no existe, regístrate'
        : serverMsg;
      setErr(normalized || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 className="auth-title" style={{ margin: 0 }}>Iniciar sesión</h2>
      </div>

      <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
        <span className="google-icon"><img src="/static/IMG/google.svg" alt={'Google'} /></span>
        <span>Continuar con Google</span>
      </button>

      <div className="or-sep">o con tu correo</div>

      {err && <div style={{ color: 'crimson', fontSize: 13, marginBottom: 8 }}>{err}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-wrap" style={{ marginBottom: 10 }}>
          <span className="input-icon"><Mail size={18} /></span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={'Correo electrónico'} />
        </div>

        <div className="input-wrap">
          <span className="input-icon"><Lock size={18} /></span>
          <input className="auth-input" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={'Contraseña'} />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button type="submit" className="submit-btn" style={{ marginTop: 12 }}>Iniciar sesión</button>
      </form>

      <div className="auth-footer" style={{ marginTop: 12 }}>
        <span>¿No tienes cuenta? </span>
        <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>Regístrate aquí</button>
      </div>

      <style>{`
        [data-theme='dark'] h2 { color: white !important; }
        .google-btn { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: 9999px; border: none; cursor: pointer; background: linear-gradient(90deg,#7c3aed,#60a5fa); color: white; font-weight: 600; box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
        .google-btn .google-icon img { width: 20px; height: 20px; display: block; border-radius: 4px; }
        .google-btn span { display: inline-block; vertical-align: middle; }
      `}</style>
    </div>
  );
}

