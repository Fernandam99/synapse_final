// Este archivo es el punto de entrada principal de la aplicación React, gestionando rutas, temas y autenticación.
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Lazy imports
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Recompensas = React.lazy(() => import('./pages/Recompensas'));
const Meditacion = React.lazy(() => import('./pages/Meditacion')); // ✅ IMPORTADO
const SesionGrupal = React.lazy(() => import('./pages/SesionGrupal')); // ✅ IMPORTADO
const Pomodoro = React.lazy(() => import('./pages/Pomodoro'));

// Componentes comunes
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AuthModal from './components/AuthModal';
import Loader from './components/loader';

// Load Navbar defensively
const Navbar = React.lazy(async () => {
  const mod = await import('./components/Navbar');
  const comp = mod.default || mod.Navbar || mod.Topbar || (() => <div />);
  return { default: comp };
});

import Footer from './components/Footer';
import { logout as doLogout, getUsuario } from './services/auth';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [usuario, setUsuario] = useState(getUsuario());
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Apply theme
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // ✅ Loader seguro: siempre termina
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (document.readyState !== 'complete') {
          await new Promise((res) => window.addEventListener('load', res, { once: true }));
        }
        await new Promise((res) => setTimeout(res, 300));
      } catch (e) {
        console.warn('App loader warning:', e);
      } finally {
        if (mounted) setLoadingApp(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const nav = useNavigate();

  const openAuth = (mode = 'login') => { setAuthMode(mode); setAuthOpen(true); };
  const closeAuth = () => setAuthOpen(false);

  const handleLogout = () => {
    setAuthOpen(false);
    try {
      doLogout();
    } catch (e) {
      window.location.href = '/';
      return;
    }
    setUsuario(null);
    try { nav('/', { replace: true }); } catch (e) { /* ignore */ }
  };

  const onAuthSuccess = (fromMode) => {
    if (fromMode === 'register') {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }
    setAuthOpen(false);
    try { nav('/dashboard', { replace: true }); } catch (e) { /* ignore */ }
    setUsuario(getUsuario());
  };

  return (
    <>
      {/* Fullscreen startup loader */}
      {loadingApp && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface, #ffffff)', zIndex: 9999 }}>
          <Loader size={260} />
        </div>
      )}

      <Suspense fallback={null}>
        <Navbar user={usuario} onAuthClick={openAuth} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
      </Suspense>
      <AuthModal open={authOpen} mode={authMode} onClose={closeAuth} onAuthSuccess={onAuthSuccess} openAuth={openAuth} />

      <Suspense fallback={<div style={{ padding: 20 }}>Cargando...</div>}>
        <Routes>
          {/* Redirecciones de login/register */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* Páginas privadas */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/concentracion" element={<PrivateRoute><Concentracion /></PrivateRoute>} />
          <Route path="/meditacion" element={<PrivateRoute><Meditacion /></PrivateRoute>} />
          <Route path="/sesion-grupal" element={<PrivateRoute><SesionGrupal /></PrivateRoute>} /> 
          <Route path="/pomodoro" element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
          <Route path="/config" element={<PrivateRoute><Profile defaultTab="settings" /></PrivateRoute>} />

          {/* Página principal */}
          <Route path="/" element={<PublicRoute><HomePage user={usuario} onAuthClick={openAuth} /></PublicRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}