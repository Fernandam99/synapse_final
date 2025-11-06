import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';



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
  if (!/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) return 'err_password_special';
  return null;
}

const getErrorMessage = (key) => {
  const messages = {
    err_password_length: 'La contraseña debe tener al menos 8 caracteres',
    err_password_uppercase: 'La contraseña debe contener al menos una letra mayúscula',
    err_password_lowercase: 'La contraseña debe contener al menos una letra minúscula',
    err_password_digit: 'La contraseña debe contener al menos un número',
    err_password_special: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*, etc.)',
    err_invalid_email: 'Por favor ingresa un correo válido',
    err_name_length: 'El nombre debe tener al menos 2 caracteres',
    err_password_mismatch: 'Las contraseñas no coinciden',
  };
  return messages[key] || key;
};


export default function Register({ onSuccess, onSwitchMode }) {
  const nav = useNavigate();
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

  const validName = name.trim().length >= 2;
  const validEmail = validateEmail(email);
  const passwordErrorKey = validatePassword(password);
  const validPassword = !passwordErrorKey;
  const passwordsMatch = password === password2 && password2.length > 0;


  const handle = async (e) => {
    e.preventDefault();
    setErr('');


  if (!validName) return setErr(getErrorMessage('err_name_length'));
  if (!validEmail) return setErr(getErrorMessage('err_invalid_email'));
  if (!validPassword) return setErr(getErrorMessage(passwordErrorKey));
  if (!passwordsMatch) return setErr(getErrorMessage('err_password_mismatch'));

      if (!name || name.length < 2) return setErr(t('err_name_length', 'El nombre debe tener al menos 2 caracteres'));
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setErr(t('err_invalid_email', 'Por favor ingresa un correo válido'));
  if (!password || password.length < 8) return setErr(t('err_password_length', 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial'));
      if (password !== password2) return setErr(t('err_password_mismatch', 'Las contraseñas no coinciden'));

    try {
      // Backend expects fields: username, correo, password


    if (!validName) return setErr(getErrorMessage('err_name_length', t));
    if (!validEmail) return setErr(getErrorMessage('err_invalid_email', t));
    if (!validPassword) return setErr(getErrorMessage(passwordErrorKey, t));
    if (!passwordsMatch) return setErr(getErrorMessage('err_password_mismatch', t));


    try {

      await api.post(cfg.paths.register, { username: name, correo: email, password });
      if (onSuccess) onSuccess('register');
      // Después de registrar con éxito, navegar siempre al dashboard
      nav('/dashboard');
    } catch (error) {
      console.error(error);
            type={show ? 'text' : 'password'}
      const msg = error.response?.data?.error || error.message || 'Error al registrar';


      setErr(error.response?.data?.error || error.response?.data || error.message);

      const msg = error.response?.data?.error || error.message || t('err_generic', 'Error al registrar');

      setErr(msg);

    }
  };

  return (

    <div className="auth-panel">
      <div className="auth-header">
  <h2 className="auth-title">Regístrate</h2>
      </div>

      <button className="google-btn" type="button">
        <span className="google-icon"><img src="/static/IMG/google.svg" alt="Google" /></span>
        <span>Continuar con Google</span>

    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>

        <h2 className="auth-title" style={{ margin: 0 }}>{t('register')}</h2>
      </div>

      <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
        <span className="google-icon">
          {/* Inline simplified Google-style mark to avoid missing asset */}
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-6C34.6 3 29.8 1 24 1 14.8 1 6.9 6.8 3.2 14.9l7.4 5.7C12.6 15.1 17.7 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.5 24c0-1.6-.1-2.8-.4-4H24v8.1h12.6c-.5 3-2.7 7.3-8.6 9.6 0 0 13.5-4.2 18.9-13.7C46.6 26.9 46.5 25.5 46.5 24z"/>
            <path fill="#FBBC05" d="M10.6 29.9C9.4 27.5 8.8 25 8.8 23s.6-4.5 1.8-6.9L3.2 10.9C1.2 14.5 0 18.7 0 24s1.2 9.5 3.2 13.1l7.4-5.7z"/>
            <path fill="#4285F4" d="M24 46.9c6.1 0 11.2-2 14.9-5.4l-7.3-5.9c-2 1.4-5.1 2.8-7.6 2.8-6.4 0-11.8-4.5-13.7-10.6l-7.4 5.7C6.9 41.2 14.8 46.9 24 46.9z"/>
          </svg>
        </span>

        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{t('register')}</h2>
      </div>

      <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
        <span className="google-icon"><img src="/static/IMG/google.svg" alt={t('google_alt', 'Google')} /></span>

        <span>{t('continue_with_google', 'Continuar con Google')}</span>

      </button>

      {err && <div className="error-message" style={{ marginBottom: 8 }}>{err}</div>}


      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 8, background: '#eef2ff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#667eea)', transition: 'width 220ms ease' }} />
        </div>
  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>{t('progress_label', 'Progress: {{progress}}%', { progress })}</div>
      </div>

      <form onSubmit={handle}>

      <form onSubmit={handle}>
        {/* Nombre */}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, name: true }))}>
          <span className="input-icon"><User size={18} /></span>
          <input className="auth-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={'Nombre'} />
        </div>

  {!validName && touched.name && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{t('err_name_length', 'El nombre debe tener al menos 2 caracteres')}</div>}


        {!validName && touched.name && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{getErrorMessage('err_name_length', t)}</div>}

        {/* Email */}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, email: true }))}>
          <span className="input-icon"><Mail size={18} /></span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={'Correo electrónico'} />
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

        {!validEmail && touched.email && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{getErrorMessage('err_invalid_email', t)}</div>}

        {/* Contraseña */}
        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input
            className="auth-input"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'Contraseña'}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Ocultar' : 'Mostrar'}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {touched.password && passwordErrorKey && (
          <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{getErrorMessage(passwordErrorKey, t)}</div>
        )}

        {/* Confirmar contraseña */}
        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password2: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input
            className="auth-input"
            type={show2 ? 'text' : 'password'}
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder={'Confirmar contraseña'}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShow2(s => !s)} aria-label={show2 ? 'Ocultar' : 'Mostrar'}>
            {show2 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {!passwordsMatch && touched.password2 && (
          <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>{getErrorMessage('err_password_mismatch', t)}</div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={!(validName && validEmail && validPassword && passwordsMatch)}
        >
          Regístrate
        </button>
      </form>

      <div className="auth-footer">
        <span>¿Ya tienes cuenta? </span>
        <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>Iniciar sesión</button>
      </div>
    </div>
  );
}