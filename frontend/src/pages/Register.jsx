import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Register({ onSuccess, onSwitchMode }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  // derived validation state
  const validName = name.trim().length >= 2;
  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  // Match backend password policy: >=8 chars, uppercase, lowercase, digit and special char
  const validPassword = (() => {
    if (!password || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) return false;
    return true;
  })();
  const passwordsMatch = password === password2 && password2.length > 0;
  const validations = [validName, validEmail, validPassword, passwordsMatch];
  const progress = Math.round((validations.filter(Boolean).length / validations.length) * 100);

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
      if (!name || name.length < 2) return setErr(t('err_name_length', 'El nombre debe tener al menos 2 caracteres'));
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr(t('err_invalid_email', 'Por favor ingresa un correo válido'));
  if (!password || password.length < 8) return setErr(t('err_password_length', 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial'));
      if (password !== password2) return setErr(t('err_password_mismatch', 'Las contraseñas no coinciden'));

    try {
      // Backend expects fields: username, correo, password
      await api.post(cfg.paths.register, { username: name, correo: email, password });
      if (onSuccess) onSuccess('register');
    } catch (error) {
      console.error(error);
      setErr(error.response?.data?.error || error.response?.data || error.message);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 className="auth-title" style={{ margin: 0 }}>{t('register')}</h2>
      </div>

      <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
        <span className="google-icon"><img src="/static/IMG/google.svg" alt={t('google_alt', 'Google')} /></span>
        <span>{t('continue_with_google', 'Continuar con Google')}</span>
      </button>

      {err && <div style={{ color: 'crimson', fontSize: 13, marginBottom: 8 }}>{err}</div>}

      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 8, background: '#eef2ff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#667eea)', transition: 'width 220ms ease' }} />
        </div>
  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{t('progress_label', 'Progress: {{progress}}%', { progress })}</div>
      </div>

      <form onSubmit={handle}>
        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, name: true }))}>
          <span className="input-icon"><User size={18} /></span>
          <input className="auth-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('name_placeholder', 'Nombre')} />
        </div>
  {!validName && touched.name && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{t('err_name_length', 'El nombre debe tener al menos 2 caracteres')}</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, email: true }))}>
          <span className="input-icon"><Mail size={18} /></span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('email_placeholder', 'Correo electrónico')} />
        </div>
  {!validEmail && touched.email && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{t('err_invalid_email', 'Ingresa un correo válido')}</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input className="auth-input" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password_placeholder', 'Contraseña')} />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? t('hide_password', 'Hide password') : t('show_password', 'Show password')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
  {!validPassword && touched.password && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{t('err_password_length', 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial')}</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password2: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input className="auth-input" type={show2 ? 'text' : 'password'} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder={t('confirm_password_placeholder', 'Confirmar contraseña')} />
          <button
            type="button"
            onClick={() => setShow2(s => !s)}
            aria-label={show2 ? t('hide_password', 'Hide password') : t('show_password', 'Show password')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
  {!passwordsMatch && touched.password2 && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{t('err_password_mismatch', 'Las contraseñas no coinciden')}</div>}

  <button type="submit" className="submit-btn" disabled={!(validName && validEmail && validPassword && passwordsMatch)} style={{ opacity: (validName && validEmail && validPassword && passwordsMatch) ? 1 : 0.6, cursor: (validName && validEmail && validPassword && passwordsMatch) ? 'pointer' : 'not-allowed' }}>{t('register')}</button>
      </form>

      <div className="auth-footer">
  <span>{t('already_have_account', '¿Ya tienes cuenta?')} </span>
  <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>{t('login')}</button>
      </div>
          <style>{`
          [data-theme='dark'] h2 {
          color: white !important;
          }
          `}</style>
    </div>

  );
}
