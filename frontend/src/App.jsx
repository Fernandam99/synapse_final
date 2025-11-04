// Este archivo es el punto de entrada principal de la aplicación React, gestionando rutas, temas y autenticación.
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Concentracion = React.lazy(() => import('./pages/Pomodoro'));
const Pomodoro = React.lazy(() => import('./pages/Pomodoro'));
const Tareas = React.lazy(() => import('./pages/Tareas'));
import PrivateRoute from './components/PrivateRoute'; 
import PublicRoute from './components/PublicRoute';
import AuthModal from './components/AuthModal';
import Loader from './components/loader';
// Load Navbar defensively: some environments may export it differently.
const Navbar = React.lazy(async () => {
  const mod = await import('./components/Navbar');
  // Try common export shapes and return a module with a default export
  const comp = mod.default || mod.Navbar || mod.Topbar || (() => <div />);
  return { default: comp };
});
import Footer from './components/Footer';
import { logout as doLogout, getUsuario } from './services/auth';


export default function App(){
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

  // Apply theme to document and persist
  useEffect(() => {
    try {
      if (theme) {
        document.documentElement.setAttribute('data-theme', theme);
        window.localStorage.setItem('theme', theme);
      }
    } catch (e) {
      // ignore in non-browser envs
    }
  }, [theme]);

  // Show a startup loader until the app is ready.
  useEffect(() => {
    let mounted = true;
    // Wait a small amount and the next animation frame to ensure
    // CSS/JS resources and lazy chunks have a chance to load.
    const run = async () => {
      const minMs = 10000; // keep loader visible at least 20s
      const start = Date.now();
      try {
        // Prefer waiting for window load if it hasn't fired yet
        if (document.readyState !== 'complete') {
          await new Promise((res) => window.addEventListener('load', res, { once: true }));
        }
      } catch (e) {
        /* ignore */
      }
      // ensure at least one frame and a tiny delay so animations appear smooth
      await new Promise((res) => requestAnimationFrame(() => setTimeout(res, 180)));
      const elapsed = Date.now() - start;
      if (elapsed < minMs) {
        // wait remaining time to reach the minimum duration
        await new Promise((res) => setTimeout(res, minMs - elapsed));
      }
      if (mounted) setLoadingApp(false);
    };
    run();
    return () => { mounted = false; };
  }, []);
  const nav = useNavigate();
  const location = useLocation();

  const openAuth = (mode = 'login') => { setAuthMode(mode); setAuthOpen(true); };
  const closeAuth = () => setAuthOpen(false);

  const handleLogout = () => {
    // central logout handler: clear local user state and perform service logout
    setAuthOpen(false);
    try {
      doLogout();
    } catch (e) {
      // fallback to full redirect if service logout fails
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
  try { nav('/pomodoro', { replace: true }); } catch (e) { /* ignore */ }
    // Refresh local user state after successful auth
    try { setUsuario(getUsuario()); } catch (e) { /* ignore */ }
  };

  return (
    <>
  <div className="app-debug-banner">APP RENDER OK</div>
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

  <Suspense fallback={<div style={{padding:20}}>Cargando...</div>}>
  <Routes>
        <Route path="/login" element={<div className="container"><PublicRoute><Navigate to="/" replace /></PublicRoute></div>} />
        <Route path="/register" element={<div className="container"><PublicRoute><Navigate to="/" replace /></PublicRoute></div>} />
  <Route path="/dashboard" element={<div className="container"><PrivateRoute><Dashboard/></PrivateRoute></div>} />
  <Route path="/pomodoro" element={<div className="container"><PrivateRoute><Pomodoro/></PrivateRoute></div>} />
  <Route path="/perfil" element={<div className="container"><PrivateRoute><Profile/></PrivateRoute></div>} />
  <Route path="/concentracion" element={<div className="container"><PrivateRoute><Concentracion/></PrivateRoute></div>} />
    <Route path="/tareas" element={<div className="container"><PrivateRoute><Tareas/></PrivateRoute></div>} />
  <Route path="/config" element={<div className="container"><PrivateRoute><Profile defaultTab="settings"/></PrivateRoute></div>} />
  <Route path="/" element={<div className="container container-full"><PublicRoute><HomePage user={usuario} onAuthClick={openAuth} /></PublicRoute></div>} />
      </Routes>
      </Suspense>
      <Footer />
    </>
  );
}
