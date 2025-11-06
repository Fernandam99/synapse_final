
import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// === VALIDACIONES IDÉNTICAS AL BACKEND ===
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(email.trim());
}

function validatePassword(password) {
  if (password.length < 8) return 'err_password_length';
  if (!/[A-Z]/.test(password)) return 'err_password_uppercase';
  if (!/[a-z]/.test(password)) return 'err_password_lowercase';
  if (!/[0-9]/.test(password)) return 'err_password_digit';
  // Acepta cualquier carácter que NO sea letra ni número
  if (!/[^a-zA-Z0-9]/.test(password)) return 'err_password_special';
  return null;
}

const getErrorMessage = (key, t) => {
  const messages = {
    err_password_length: t('err_password_length', 'La contraseña debe tener al menos 8 caracteres'),
    err_password_uppercase: t('err_password_uppercase', 'La contraseña debe contener al menos una letra mayúscula'),
    err_password_lowercase: t('err_password_lowercase', 'La contraseña debe contener al menos una letra minúscula'),
    err_password_digit: t('err_password_digit', 'La contraseña debe contener al menos un número'),
    err_password_special: t('err_password_special', 'La contraseña debe contener al menos un carácter especial (!@#$%^&*, etc.)'),
    err_invalid_email: t('err_invalid_email', 'Por favor ingresa un correo válido'),
    err_name_length: t('err_name_length', 'El nombre debe tener al menos 2 caracteres'),
    err_password_mismatch: t('err_password_mismatch', 'Las contraseñas no coinciden'),
  };
  return messages[key] || key;
};

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

  // Validaciones
  const validName = name.trim().length >= 2;
  const validEmail = validateEmail(email);
  const passwordErrorKey = validatePassword(password);
  const validPassword = !passwordErrorKey;
  const passwordsMatch = password === password2 && password2.length > 0;
  const validations = [validName, validEmail, validPassword, passwordsMatch];
  const progress = Math.round((validations.filter(Boolean).length / validations.length) * 100);

  const handle = async (e) => {
    e.preventDefault();
    setErr('');
    if (!validName) return setErr(getErrorMessage('err_name_length', t));
    if (!validEmail) return setErr(getErrorMessage('err_invalid_email', t));
    if (!validPassword) return setErr(passwordErrors.map(key => getErrorMessage(key, t)).join('\n'));
    if (!passwordsMatch) return setErr(getErrorMessage('err_password_mismatch', t));

    try {
      await api.post(cfg.paths.register, { username: name, correo: email, password });
      if (onSuccess) onSuccess('register');
    } catch (error) {
      console.error(error);
      // Mostrar todos los errores del backend si vienen como array
      if (Array.isArray(error.response?.data?.errors)) {
        setErr(error.response.data.errors.map(msg => msg).join('\n'));
      } else {
        setErr(error.response?.data?.error || error.response?.data || error.message);
      }
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('register')}</h2>
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
        {touched.password && password.length > 0 && (
          passwordErrorKey ? (
            <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>
              {getErrorMessage(passwordErrorKey, t)}
            </div>
          ) : (
            <div style={{ color: '#22c55e', fontSize: 12, marginTop: 6 }}>{t('password_valid', 'Contraseña válida y segura')}</div>
          )
        )}

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
