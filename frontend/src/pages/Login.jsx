import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { saveToken, saveUsuario } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login({ onSuccess, onSwitchMode }) {
  // App is Spanish-only; no translation hook needed
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr('Por favor ingresa un correo válido');
  if (!password || password.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres');

    try {
  // Backend expects 'correo' and 'password'
  const res = await api.post(cfg.paths.login, { correo: email, password });
      const data = res.data || {};
      const token = data[cfg.tokenField] || data.access_token || data.access;
      const usuario = data[cfg.usuarioField] || data.usuario || null;

      if (!token) {
        setErr('No se encontró token de acceso en la respuesta');
        return;
      }

      saveToken(token);
      try { const apiInstance = require('../services/api').default; apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch {}
  if (usuario) saveUsuario(usuario);
  if (onSuccess) { try { onSuccess('login'); } catch (e) { try { onSuccess(); } catch {} } }
  // Navegar siempre al dashboard después de un login exitoso
  nav('/dashboard');
    } catch (error) {
      console.error(error);

      // Normalize backend messages: map 'Cuenta desactivada' or similar to 'Cuenta no existe'
      const serverMsg = error.response?.data?.error || error.response?.data || error.message || '';
      const normalized = typeof serverMsg === 'string' && /desactiv/i.test(serverMsg)
        ? 'Esta cuenta no existe, registate'
        : serverMsg;
      setErr(normalized);

      setErr(error.response?.data?.error || error.response?.data || error.message);

    }
  };

  return (
   <div className="auth-panel"> 

<<<<<<< HEAD
      <div className="auth-header">
          <h2 className="auth-title">Iniciar sesión</h2>
      </div>

      <button className="google-btn" type="button">
        <span className="google-icon"><img src="/static/IMG/google.svg" alt="Google" /></span>
        <span>Continuar con Google</span>
=======

  <div style={{ textAlign: 'center', marginBottom: 24 }}>
    <h2 className="auth-title" style={{ margin: 0 }}>{t('login')}</h2>
  </div>

      <button className="google-btn" type="button">
        <span className="google-icon">
          {/* Inline simplified Google-style mark to avoid missing asset */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-6C34.6 3 29.8 1 24 1 14.8 1 6.9 6.8 3.2 14.9l7.4 5.7C12.6 15.1 17.7 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.5 24c0-1.6-.1-2.8-.4-4H24v8.1h12.6c-.5 3-2.7 7.3-8.6 9.6 0 0 13.5-4.2 18.9-13.7C46.6 26.9 46.5 25.5 46.5 24z"/>
            <path fill="#FBBC05" d="M10.6 29.9C9.4 27.5 8.8 25 8.8 23s.6-4.5 1.8-6.9L3.2 10.9C1.2 14.5 0 18.7 0 24s1.2 9.5 3.2 13.1l7.4-5.7z"/>
            <path fill="#4285F4" d="M24 46.9c6.1 0 11.2-2 14.9-5.4l-7.3-5.9c-2 1.4-5.1 2.8-7.6 2.8-6.4 0-11.8-4.5-13.7-10.6l-7.4 5.7C6.9 41.2 14.8 46.9 24 46.9z"/>
          </svg>
        </span>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('login')}</h2>
      </div>

      <button className="google-btn" type="button">
        <span className="google-icon"><img src="/static/IMG/google.svg" alt={t('google_alt', 'Google')} /></span>

        <span>{t('continue_with_google', 'Continuar con Google')}</span>
>>>>>>> main
      </button>

      <div className="or-sep">o con tu correo</div>

      {err && <div className="error-message" style={{ marginBottom: 8 }}>{err}</div>}

      <form onSubmit={handle}>
        <div className="input-wrap">
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
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

  <button type="submit" className="submit-btn">Iniciar sesión</button>
      </form>

      <div className="auth-footer">
  <span>¿No tienes cuenta? </span>
  <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>Regístrate aquí</button>
      </div>
    </div>
  );

}

}

