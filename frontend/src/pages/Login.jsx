import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// === VALIDACIÓN DE EMAIL IDÉNTICA AL BACKEND ===
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

export default function Login({ onSuccess, onSwitchMode }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);

  const validEmail = validateEmail(email);
  const validPassword = password.length >= 1; // No validamos complejidad en login

  const handle = async (e) => {
    e.preventDefault();
    setErr('');

    if (!email || !validEmail) {
      return setErr(t('err_invalid_email', 'Por favor ingresa un correo válido'));
    }
    if (!password) {
      return setErr(t('err_password_required', 'La contraseña es requerida'));
    }

    try {
      const res = await api.post(cfg.paths.login, { correo: email, password });
      const token = res.data[cfg.tokenField];
      const usuario = res.data[cfg.usuarioField];

      if (!token) {
        setErr(t('err_no_token', 'No access_token found in response'));
        return;
      }

      saveToken(token);
      try { const apiInstance = require('../services/api').default; apiInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch {}
      if (usuario) saveUsuario(usuario);
      if (onSuccess) { try { onSuccess('login'); } catch (e) { onSuccess(); } }
      else nav('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const msg = error.response?.data?.error || error.message || t('err_login_generic', 'Credenciales inválidas');
      setErr(msg);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('login')}</h2>
      </div>

      <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
        <span className="google-icon"><img src="/static/IMG/google.svg" alt={t('google_alt', 'Google')} /></span>
        <span>{t('continue_with_google', 'Continuar con Google')}</span>
      </button>

      {err && <div style={{ color: 'crimson', fontSize: 13, marginBottom: 8 }}>{err}</div>}

      <form onSubmit={handle}>
        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, email: true }))}>
          <span className="input-icon"><Mail size={18} /></span>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email_placeholder', 'Correo electrónico')}
          />
        </div>
        {!validEmail && touched.email && (
          <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>
            {t('err_invalid_email', 'Por favor ingresa un correo válido')}
          </div>
        )}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input
            className="auth-input"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('password_placeholder', 'Contraseña')}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? t('hide_password', 'Ocultar contraseña') : t('show_password', 'Mostrar contraseña')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={!(validEmail && password)}
          style={{
            opacity: (validEmail && password) ? 1 : 0.6,
            cursor: (validEmail && password) ? 'pointer' : 'not-allowed'
          }}
        >
          {t('login')}
        </button>
      </form>

      <div className="auth-footer">
        <span>{t('no_account', '¿No tienes cuenta?')} </span>
        <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>
          {t('register_here', 'Regístrate aquí')}
        </button>
      </div>
    </div>
  );
}