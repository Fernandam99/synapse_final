import React, { useState } from 'react';
import api from '../services/api';
import cfg from '../services/config';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validatePassword(password) {
  if (!password) return 'err_password_required';
  if (password.length < 8) return 'err_password_length';
  if (!/[A-Z]/.test(password)) return 'err_password_uppercase';
  if (!/[a-z]/.test(password)) return 'err_password_lowercase';
  if (!/[0-9]/.test(password)) return 'err_password_digit';
  if (!/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password)) return 'err_password_special';
  return null;
}

export default function Register({ onSuccess, onSwitchMode }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [err, setErr] = useState('');
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const validName = name.trim().length >= 2;
  const validEmail = EMAIL_REGEX.test(email);
  const passwordErrorKey = validatePassword(password);
  const validPassword = !passwordErrorKey;
  const passwordsMatch = password && password === password2;

  const progress = Math.round(([
    validName,
    validEmail,
    validPassword,
    passwordsMatch
  ].filter(Boolean).length / 4) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

  if (!validName) return setErr('El nombre debe tener al menos 2 caracteres');
  if (!validEmail) return setErr('Por favor ingresa un correo válido');
  if (!validPassword) return setErr('La contraseña no cumple los requisitos');
  if (!passwordsMatch) return setErr('Las contraseñas no coinciden');

    try {
      await api.post(cfg.paths.register, { username: name, correo: email, password });
      if (onSuccess) onSuccess('register');
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.error || error?.message || 'Error al registrar';
      setErr(msg);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 className="auth-title" style={{ margin: 0 }}>Registrar</h2>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button className="google-btn" type="button" style={{ marginBottom: 12 }}>
          <span className="google-icon"><img src="/static/IMG/google.svg" alt={'Google'} /></span>
          <span>Continuar con Google</span>
        </button>

      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 8, background: '#eef2ff', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#667eea)', transition: 'width 220ms ease' }} />
        </div>
      </div>

      {err && <div style={{ color: 'crimson', fontSize: 13, marginBottom: 8 }}>{err}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, name: true }))}>
          <span className="input-icon"><User size={18} /></span>
          <input className="auth-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={'Nombre'} />
        </div>
        {touched.name && !validName && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>El nombre debe tener al menos 2 caracteres</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, email: true }))}>
          <span className="input-icon"><Mail size={18} /></span>
          <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={'Correo electrónico'} />
        </div>
        {touched.email && !validEmail && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>Ingresa un correo válido</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input className="auth-input" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={'Contraseña'} autoComplete="new-password" />
          <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Ocultar' : 'Mostrar'} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {touched.password && passwordErrorKey && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>La contraseña no cumple los requisitos</div>}

        <div className="input-wrap" onFocus={() => setTouched(t => ({ ...t, password2: true }))}>
          <span className="input-icon"><Lock size={18} /></span>
          <input className="auth-input" type={show2 ? 'text' : 'password'} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder={'Confirmar contraseña'} autoComplete="new-password" />
          <button type="button" onClick={() => setShow2(s => !s)} aria-label={show2 ? 'Ocultar' : 'Mostrar'} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>{show2 ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {touched.password2 && !passwordsMatch && <div style={{ color: '#f43f5e', fontSize: 12, marginTop: 6 }}>Las contraseñas no coinciden</div>}

        <button type="submit" className="submit-btn" disabled={!(validName && validEmail && validPassword && passwordsMatch)} style={{ opacity: (validName && validEmail && validPassword && passwordsMatch) ? 1 : 0.6 }}>Registrar</button>
      </form>

      <div className="auth-footer" style={{ marginTop: 12 }}>
        <span>¿Ya tienes cuenta? </span>
        <button className="switch-link" onClick={() => onSwitchMode && onSwitchMode()}>Iniciar sesión</button>
      </div>
      <style>{`
        .google-btn { display: inline-flex; align-items: center; gap: 10px; padding: 8px 20px; border-radius: 9999px; border: none; cursor: pointer; background: linear-gradient(90deg,#7c3aed,#60a5fa); color: white; font-weight: 600; box-shadow: 0 8px 24px rgba(99,102,241,0.12); }
        .google-btn .google-icon img { width: 20px; height: 20px; display: block; border-radius: 4px; }
      `}</style>
    </div>
  );
}

