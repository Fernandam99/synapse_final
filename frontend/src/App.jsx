// frontend/src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Loader from './components/loader';

// Importar componentes con manejo seguro de errores
const safeLazy = (importFn, fallback = null) => {
  return React.lazy(() => 
    importFn().catch(err => {
      console.error('Error al cargar componente:', err);
      return fallback || { 
        default: () => (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#666',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p>⚠️ Componente no disponible temporalmente</p>
          </div>
        ) 
      };
    })
  );
};

// Componentes principales
const Login = safeLazy(() => import('./pages/Login'));
const Register = safeLazy(() => import('./pages/Register'));
const Dashboard = safeLazy(() => import('./pages/Dashboard'));
const HomePage = safeLazy(() => import('./pages/HomePage'));
const HomePageLogueado = safeLazy(() => import('./pages/HomePageLogueado'));
const Profile = safeLazy(() => import('./pages/Profile'));
const Meditacion = safeLazy(() => import('./pages/Meditacion'));
const Pomodoro = safeLazy(() => import('./pages/Pomodoro'));
const Recompensas = safeLazy(() => import('./pages/Recompensas'));
const SesionGrupal = safeLazy(() => import('./pages/SesionGrupal'));
const Tareas = safeLazy(() => import('./pages/Tareas'));
const SesionesTareas = safeLazy(() => import('./pages/SesionesTareas'));
const AdminPanel = safeLazy(() => import('./pages/AdminPanel'));

// Componentes comunes
const Navbar = safeLazy(() => import('./components/Navbar'));
const Footer = safeLazy(() => import('./components/Footer'));
const AuthModal = safeLazy(() => import('./components/AuthModal'));

// Componentes de ruta
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Servicios de autenticación
import { logout as doLogout, getUsuario } from './services/auth';

export default function App() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Aplicar tema
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Error guardando tema:', e);
    }
  }, [theme]);

  // Loader seguro con tiempo máximo
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoadingApp(false);
      }
    }, 1000);

    const timeoutFallback = setTimeout(() => {
      if (isMounted) {
        console.warn('Tiempo de carga excedido, forzando renderizado');
        setLoadingApp(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(timeoutFallback);
    };
  }, []);

  const nav = useNavigate();

  const openAuth = (mode = 'login') => { 
    setAuthMode(mode); 
    setAuthOpen(true); 
  };
  
  const closeAuth = () => setAuthOpen(false);

  const handleLogout = () => {
    setAuthOpen(false);
    try {
      doLogout();
      setUsuario(null);
      nav('/', { replace: true });
    } catch (e) {
      console.error('Error en logout:', e);
      window.location.href = '/';
    }
  };

  const onAuthSuccess = (fromMode) => {
    if (fromMode === 'register') {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }
    
    closeAuth();
    const user = getUsuario();
    setUsuario(user);
    
    // Si es login exitoso, redirigir a página de bienvenida
    if (fromMode === 'login') {
      nav('/bienvenida', { replace: true });
    } else {
      nav('/dashboard', { replace: true });
    }
  };

  // Verificación periódica de autenticación
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = getUsuario();
        if (!storedUser && usuario) {
          setUsuario(null);
        } else if (storedUser && !usuario) {
          setUsuario(storedUser);
        }
      } catch (e) {
        console.error('Error verificando autenticación:', e);
        doLogout();
        setUsuario(null);
        window.location.href = '/';
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 300000); // Verificar cada 5 minutos
    return () => clearInterval(interval);
  }, [usuario]);

  return (
    <ErrorBoundary>
      {/* Fullscreen startup loader */}
      {loadingApp && <Loader size={260} />}

      {!loadingApp && (
        <>
          <Suspense fallback={
            <div style={{ height: '60px', backgroundColor: '#f8fafc' }}></div>
          }>
            <Navbar 
              user={usuario} 
              onAuthClick={openAuth} 
              onLogout={handleLogout} 
              theme={theme} 
              setTheme={setTheme} 
            />
          </Suspense>
          
          <AuthModal 
            open={authOpen} 
            mode={authMode} 
            onClose={closeAuth} 
            onAuthSuccess={onAuthSuccess} 
            openAuth={openAuth} 
          />


          <main style={{ 
            minHeight: 'calc(100vh - 60px - 150px)', 
            paddingTop: '24px',
            paddingBottom: '40px'
          }}>
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '40px' 
              }}>
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#666',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ marginBottom: '1rem' }}>Cargando contenido...</div>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#7c3aed',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              </div>
            }>
              <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={
                  <PublicRoute>
                    <HomePage user={usuario} onAuthClick={openAuth} />
                  </PublicRoute>
                } />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                
                {/* Páginas privadas */}
                <Route path="/bienvenida" element={
                  <PrivateRoute>
                    <HomePageLogueado />
                  </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/perfil" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/meditacion" element={
                  <PrivateRoute>
                    <Meditacion />
                  </PrivateRoute>
                } />
                <Route path="/pomodoro" element={
                  <PrivateRoute>
                    <Pomodoro />
                  </PrivateRoute>
                } />
                <Route path="/recompensas" element={
                  <PrivateRoute>
                    <Recompensas />
                  </PrivateRoute>
                } />
                <Route path="/sesion-grupal" element={
                  <PrivateRoute>
                    <SesionGrupal />
                  </PrivateRoute>
                } />
                <Route path="/tareas" element={
                  <PrivateRoute>
                    <Tareas />
                  </PrivateRoute>
                } />
                <Route path="/sesiones-tareas" element={
                  <PrivateRoute>
                    <SesionesTareas />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                } />
                
                {/* Redirección por defecto para usuarios logueados */}
                <Route path="/home" element={<Navigate to="/bienvenida" replace />} />
                
                {/* Ruta no encontrada */}
                <Route path="*" element={
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center',
                    color: '#4b5563'
                  }}>
                    <h2>🔍 Página no encontrada</h2>
                    <p style={{ marginTop: '16px' }}>La página que buscas no existe</p>
                    <button 
                      onClick={() => nav('/')}
                      style={{ 
                        marginTop: '24px',
                        background: 'linear-gradient(135deg, #7c3aed, #667eea)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      Volver al inicio
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          
          <Suspense fallback={<div style={{ height: '150px' }}></div>}>
            <Footer />
          </Suspense>
        </>
      )}
    </ErrorBoundary>
  );
}
// frontend/src/App.jsx
import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Loader from './components/loader';

// Importar componentes con manejo seguro de errores
const safeLazy = (importFn, fallback = null) => {
  return React.lazy(() => 
    importFn().catch(err => {
      console.error('Error al cargar componente:', err);
      return fallback || { 
        default: () => (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: '#666',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p>⚠️ Componente no disponible temporalmente</p>
          </div>
        ) 
      };
    })
  );
};

// Componentes principales
const Login = safeLazy(() => import('./pages/Login'));
const Register = safeLazy(() => import('./pages/Register'));
const Dashboard = safeLazy(() => import('./pages/Dashboard'));
const HomePage = safeLazy(() => import('./pages/HomePage'));
const HomePageLogueado = safeLazy(() => import('./pages/HomePageLogueado'));
const Profile = safeLazy(() => import('./pages/Profile'));
const Meditacion = safeLazy(() => import('./pages/Meditacion'));
const Pomodoro = safeLazy(() => import('./pages/Pomodoro'));
const Recompensas = safeLazy(() => import('./pages/Recompensas'));
const SesionGrupal = safeLazy(() => import('./pages/SesionGrupal'));
const Tareas = safeLazy(() => import('./pages/Tareas'));
const SesionesTareas = safeLazy(() => import('./pages/SesionesTareas'));
const AdminPanel = safeLazy(() => import('./pages/AdminPanel'));

// Componentes comunes
const Navbar = safeLazy(() => import('./components/Navbar'));
const Footer = safeLazy(() => import('./components/Footer'));
const AuthModal = safeLazy(() => import('./components/AuthModal'));

// Componentes de ruta
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Servicios de autenticación
import { logout as doLogout, getUsuario } from './services/auth';

export default function App() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Aplicar tema
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Error guardando tema:', e);
    }
  }, [theme]);

  // Loader seguro con tiempo máximo
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoadingApp(false);
      }
    }, 1000);

    const timeoutFallback = setTimeout(() => {
      if (isMounted) {
        console.warn('Tiempo de carga excedido, forzando renderizado');
        setLoadingApp(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearTimeout(timeoutFallback);
    };
  }, []);

  const nav = useNavigate();

  const openAuth = (mode = 'login') => { 
    setAuthMode(mode); 
    setAuthOpen(true); 
  };
  
  const closeAuth = () => setAuthOpen(false);

  const handleLogout = () => {
    setAuthOpen(false);
    try {
      doLogout();
      setUsuario(null);
      nav('/', { replace: true });
    } catch (e) {
      console.error('Error en logout:', e);
      window.location.href = '/';
    }
  };

  const onAuthSuccess = (fromMode) => {
    if (fromMode === 'register') {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }

    
    closeAuth();
    const user = getUsuario();
    setUsuario(user);
    
    // Si es login exitoso, redirigir a página de bienvenida
    if (fromMode === 'login') {
      nav('/bienvenida', { replace: true });
    } else {
      nav('/dashboard', { replace: true });
    }

    setAuthOpen(false);

  try { nav('/dashboard', { replace: true }); } catch (e) { /* ignore */ }

    try { nav('/dashboard', { replace: true }); } catch (e) { /* ignore */ }

  // Refresh local user state after successful auth
  try { setUsuario(getUsuario()); } catch (e) { /* ignore */ }
  };

  // Verificación periódica de autenticación
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = getUsuario();
        if (!storedUser && usuario) {
          setUsuario(null);
        } else if (storedUser && !usuario) {
          setUsuario(storedUser);
        }
      } catch (e) {
        console.error('Error verificando autenticación:', e);
        doLogout();
        setUsuario(null);
        window.location.href = '/';
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 300000); // Verificar cada 5 minutos
    return () => clearInterval(interval);
  }, [usuario]);

  return (
    <ErrorBoundary>
      {/* Fullscreen startup loader */}
      {loadingApp && <Loader size={260} />}

      {!loadingApp && (
        <>
          <Suspense fallback={
            <div style={{ height: '60px', backgroundColor: '#f8fafc' }}></div>
          }>
            <Navbar 
              user={usuario} 
              onAuthClick={openAuth} 
              onLogout={handleLogout} 
              theme={theme} 
              setTheme={setTheme} 
            />
          </Suspense>
          
          <AuthModal 
            open={authOpen} 
            mode={authMode} 
            onClose={closeAuth} 
            onAuthSuccess={onAuthSuccess} 
            openAuth={openAuth} 
          />


          <main style={{ 
            minHeight: 'calc(100vh - 60px - 150px)', 
            paddingTop: '24px',
            paddingBottom: '40px'
          }}>
            <Suspense fallback={
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '40px' 
              }}>
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: '#666',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  <div style={{ marginBottom: '1rem' }}>Cargando contenido...</div>
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#7c3aed',
                    borderRadius: '50%',
                    margin: '0 auto',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              </div>
            }>
              <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={
                  <PublicRoute>
                    <HomePage user={usuario} onAuthClick={openAuth} />
                  </PublicRoute>
                } />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
                
                {/* Páginas privadas */}
                <Route path="/bienvenida" element={
                  <PrivateRoute>
                    <HomePageLogueado />
                  </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/perfil" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/meditacion" element={
                  <PrivateRoute>
                    <Meditacion />
                  </PrivateRoute>
                } />
                <Route path="/pomodoro" element={
                  <PrivateRoute>
                    <Pomodoro />
                  </PrivateRoute>
                } />
                <Route path="/recompensas" element={
                  <PrivateRoute>
                    <Recompensas />
                  </PrivateRoute>
                } />
                <Route path="/sesion-grupal" element={
                  <PrivateRoute>
                    <SesionGrupal />
                  </PrivateRoute>
                } />
                <Route path="/tareas" element={
                  <PrivateRoute>
                    <Tareas />
                  </PrivateRoute>
                } />
                <Route path="/sesiones-tareas" element={
                  <PrivateRoute>
                    <SesionesTareas />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminPanel />
                  </PrivateRoute>
                } />
                
                {/* Redirección por defecto para usuarios logueados */}
                <Route path="/home" element={<Navigate to="/bienvenida" replace />} />
                
                {/* Ruta no encontrada */}
                <Route path="*" element={
                  <div style={{ 
                    padding: '40px', 
                    textAlign: 'center',
                    color: '#4b5563'
                  }}>
                    <h2>🔍 Página no encontrada</h2>
                    <p style={{ marginTop: '16px' }}>La página que buscas no existe</p>
                    <button 
                      onClick={() => nav('/')}
                      style={{ 
                        marginTop: '24px',
                        background: 'linear-gradient(135deg, #7c3aed, #667eea)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}
                    >
                      Volver al inicio
                    </button>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
          
          <Suspense fallback={<div style={{ height: '150px' }}></div>}>
            <Footer />
          </Suspense>
        </>
      )}
    </ErrorBoundary>

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

  <Route path="/perfil" element={<div className="container"><PrivateRoute><Profile/></PrivateRoute></div>} />
  <Route path="/concentracion" element={<div className="container"><PrivateRoute><Concentracion/></PrivateRoute></div>} />
  <Route path="/config" element={<div className="container"><PrivateRoute><Profile defaultTab="settings"/></PrivateRoute></div>} />
  <Route path="/" element={<div className="container container-full"><PublicRoute><HomePage user={usuario} onAuthClick={openAuth} /></PublicRoute></div>} />
  <Route path="/admin" element={<AdminPanel />} />

      </Routes>
      </Suspense>
      <Footer />
    </>

  );
}