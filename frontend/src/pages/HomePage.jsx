import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Leaf, CheckCircle, Star, Users, User, Target, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { getToken } from '../services/auth';



export default function HomePage({ user, onAuthClick }) {
  const { t } = useTranslation();
  const [backendUp, setBackendUp] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoadingStats(true);
      try {
        // Only request protected stats if a token is present to avoid 401 spam in logs
        if (!getToken()) {
          if (mounted) setStats(null);
          return;
        }
        const r = await api.get('/tareas/estadisticas');
        if (!mounted) return;
        setStats(r.data || null);
      } catch (e) {
        console.info('No stats endpoint or failed to fetch stats', e?.message || e);
        if (!mounted) return;
        setStats(null);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    // Do not perform an intrusive /home probe (404). Only attempt to load stats if authenticated.
    loadStats();

    return () => { mounted = false; };
  }, []);

  // Lista de técnicas disponibles

  // He eliminado las tarjetas "Sesiones Grupales" y "Perfil" según petición
  // Además la tarjeta de tareas la colocamos más abajo (se aplica un marginTop en el render)
  // Técnicas disponibles (incluye Recompensas y Tareas además de Pomodoro y Meditación)
  const tecnicas = [
    { id: 1, key: 'tech_pomodoro', ruta: '/pomodoro', Icon: Clock, color: '#667eea' },
    { id: 2, key: 'tech_meditation', ruta: '/meditacion', Icon: Leaf, color: '#764ba2' },
    { id: 3, key: 'tech_rewards', ruta: '/recompensas', Icon: Star, color: '#eab308' },
    { id: 4, key: 'tech_tasks', ruta: '/tareas', Icon: CheckCircle, color: '#22c55e' }

  const tecnicas = [
    { id: 1, key: 'tech_pomodoro', ruta: '/pomodoro', Icon: Clock, color: '#667eea' },
    { id: 2, key: 'tech_meditation', ruta: '/meditacion', Icon: Leaf, color: '#764ba2' },
    { id: 3, key: 'tech_tasks', ruta: '/tareas', Icon: CheckCircle, color: '#22c55e' },
    { id: 4, key: 'tech_rewards', ruta: '/recompensas', Icon: Star, color: '#eab308' },
    { id: 5, key: 'tech_group', ruta: '/sesion-grupal', Icon: Users, color: '#3b82f6' },
    { id: 6, key: 'tech_profile', ruta: '/perfil', Icon: User, color: '#8b5cf6' }

  ];

  // Manejo de autenticación
  const handleAuth = (mode) => { if (onAuthClick) onAuthClick(mode); };

  // Manejo de navegación a técnicas
  const handleTecnicaClick = (ruta) => { window.location.href = ruta; };

  const handleAvatarToggle = () => {
    setAvatarOpen(!avatarOpen);
  };

  const handleAvatarClose = () => {
    setAvatarOpen(false);
  };

  return (
    <>
      <main className="main-with-sidebar">
        <div className="content-frame">
          <div className="homepage-root">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .homepage-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; overflow-x: hidden; }
  .hero-section { background: var(--hero-bg, var(--primary-gradient)); color: var(--hero-text, var(--text-on-primary, white)); }
  .hero-text h1 { color: var(--hero-title, var(--text-on-primary, white)); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.05; }
  .hero-highlight { background-image: var(--hero-highlight-gradient, linear-gradient(135deg, #fde047 0%, #f97316 100%)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; }
  .section-features { background: var(--section-features-bg, var(--bg-secondary, #f8fafc)); color: var(--text-primary); }
  .section-techniques { background: var(--primary-gradient); color: var(--text-on-primary, white); }
  .section-cta { background: var(--cta-bg, var(--bg-primary, #1e293b)); color: var(--text-on-primary, white); text-align: center; }
        .section-title { color: var(--text-primary); }
        .section-subtitle { color: var(--text-secondary); }
        .feature-card h3 { color: var(--text-primary); }
        .feature-card p { color: var(--text-secondary); }
        .btn-cta-final { padding: 1rem 2rem; border: none; background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); color: white; border-radius: 9999px; font-weight: 600; cursor: pointer; font-size: 1rem; box-shadow: 0 10px 25px rgba(255,107,107,0.3); transition: all 0.3s ease; }
        .btn-cta-final:hover { transform: scale(1.05); box-shadow: 0 15px 35px rgba(255, 107, 107, 0.4); }
 
        [data-theme='dark'] .section-features { background: #080d1b; }
        [data-theme='dark'] .section-subtitle,
        [data-theme='dark'] .feature-card p { color: #FFFFFF; }
        [data-theme='dark'] .btn-hero { color: #FFFFFF; }
        [data-theme='dark'] .section-techniques { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); }
        [data-theme='dark'] .section-cta { background: var(--bg-primary, #0f172a); color: var(--text-on-primary, #f9fafb); }
        [data-theme='dark'] .section-cta { background: #0f172a; color: var(--text-on-primary, #f9fafb); }
        [data-theme='dark'] .status-badge { color: #ffffff !important; }

        [data-theme='dark'] .section-title,
        [data-theme='midnight'] .section-title {
          color: white;
        }

        [data-theme='light'] .section-title {
          color: black !important;
          visibility: visible;
          display: block;
        }

        [data-theme='dark'] .login-title,
        [data-theme='midnight'] .login-title {
          color: white;
        }

        [data-theme='dark'] .register-title,
        [data-theme='midnight'] .register-title {
          color: white;
        }

        [data-theme='light'] .login-title,
        [data-theme='light'] .register-title {
          color: black;
        }

        [data-theme='dark'] .modal-title,
        [data-theme='midnight'] .modal-title {
          color: white !important;
        }

        [data-theme='dark'] .modal-header,
        [data-theme='midnight'] .modal-header {
          color: white !important;
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
          font-weight: bold;
          visibility: visible;
          display: block;
          background-color: transparent;
        }

        [data-theme='dark'] .btn-modal,
        [data-theme='midnight'] .btn-modal {
          color: white !important;
        }

        [data-theme='light'] .section-cta h2 {
          color: black !important;
          visibility: visible;
          display: block;
        }

        /* Fallbacks for CSS variables if not defined globally */
        :root {
          --bg-secondary: #f8fafc;
          --bg-surface-raised: #1a202c;
          --text-primary: #1f2937;
          --text-secondary: #6b7280;
        }
        .status-badge { display:inline-block; padding:6px 10px; border-radius:9999px; font-weight:600; font-size:0.85rem; }

        /* Layout tuned to match the provided design: text left, floating card close to text */
        .homepage-root .hero-inner { justify-content: center !important; }
        .hero-grid { justify-content: center !important; gap: 2.5rem !important; align-items: center; width: 100%; }
        /* Text block stays left-aligned and has a controlled max-width so the heading
           wraps similarly to the design and the floating card sits close to it. */
        .hero-text { text-align: left !important; margin: 0; max-width: 640px; }
        /* Make the visual (floating card) sit nearer to the text on wide screens */
        .hero-visual { margin-left: 1rem; }
        /* Ensure visual offset is pleasant on very wide screens (desktop) */

        /* Center hero layout as requested */
        .homepage-root .hero-inner { justify-content: center !important; }
        .hero-grid { justify-content: center !important; gap: 2rem !important; }
        .hero-text { text-align: center !important; margin: 0 auto; }
        /* Ensure visual keeps a pleasant offset on very wide screens */

        @media (min-width: 1600px) {
          .hero-grid { justify-content: center; }
          .hero-visual { margin-left: 2rem; }
        }
      `}</style>


      <style>{`
        /* Fuerza cuadrícula 2x2 para técnicas y cae a 1 columna en pantallas pequeñas */
        .section-techniques .tech-grid { display: grid; grid-template-columns: repeat(2, minmax(280px, 1fr)); gap: 2rem; }
        @media (max-width: 700px) {
          .section-techniques .tech-grid { grid-template-columns: 1fr; }
        }
      `}</style>



      <section className="homepage-hero-fullbleed hero-section">
        <div className="hero-inner">
          <div className="hero-grid">
              <div className="hero-text">
              <h1>
                {t('hero_prefix')}{' '}
                <span className="hero-highlight">{t('hero_highlight')}</span>
              </h1>
              <p style={{ color: 'var(--hero-subtext, rgba(255,255,255,0.9))' }}>{t('welcome')}</p>

              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                {backendUp === null ? (
                  <span className="status-badge" style={{ background: '#ffe58a', color: '#663c00' }}>{t('backend_checking', 'Checking backend...')}</span>
                ) : backendUp ? (
                  <span className="status-badge" style={{ background: '#d1fae5', color: '#065f46' }}>{t('backend_connected', 'Backend connected')}</span>
                ) : (
                  <span className="status-badge" style={{ background: '#fecaca', color: '#7f1d1d' }}>{t('backend_disconnected', 'Backend disconnected')}</span>
                )}
              </div>

              <div className="hero-ctas">
                <button className="btn-hero primary" onClick={() => handleAuth('register')}>{t('register')}</button>
                <button className="btn-hero ghost" onClick={() => handleAuth('login')}>{t('login')}</button>
              </div>
            </div>

            <div className="hero-visual animate-float">
              <div className="pulse animate-pulse"></div>
              <div className="ring"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
      </section>

<section className="section-features" style={{ padding: '6rem 0' }}>
  <div className="content-inner">
    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
      <h2
        className="section-title"
        style={{
          fontSize: 'clamp(1.875rem, 4vw, 2.25rem)',
          fontWeight: '700',
          marginBottom: '1rem',
         
        }}
      >
        {t('features_title', 'Power up your Mind')}{' '}
        <span style={{ color: 'var(--accent-blue)' }}>
          {t('transform', 'Transform')}
        </span>
      </h2>
      <p
        className="section-subtitle"
        style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          maxWidth: '42rem',
          margin: '0 auto'
        }}
      >
        {t(
          'features_subtitle',
          'Train your focus, meditate with purpose and transform your productivity.'
        )}
      </p>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem'
      }}
    >
      <div
        className="feature-card"
        style={{ textAlign: 'center', transition: 'all 0.3s ease' }}
      >
        <div
          style={{
            width: '5rem',
            height: '5rem',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'var(--feature-gradient-1, linear-gradient(135deg, #667eea 0%, #764ba2 100%))'
          }}
        >
          <Target size={32} color="white" />
        </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              {t('Pomodoro', 'Pomodoro')}
            </h3>
            <p style={{ lineHeight: '1.6' }}>
              Mejora tu productividad trabajando en bloques de tiempo con pausas estratégicas.
            </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          {t('Pomodoro', 'Pomodoro')}
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          {t('tech_pomodoro.desc', 'Ejercicios personalizados para mejorar tu enfoque mental.')}
        </p>

      </div>

      <div
        className="feature-card"
        style={{ textAlign: 'center', transition: 'all 0.3s ease' }}
      >
        <div
          style={{
            width: '5rem',
            height: '5rem',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'var(--feature-gradient-2, linear-gradient(135deg, #f093fb 0%, #f5576c 100%))'
          }}
        >
          <Leaf size={32} color="white" />
        </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              {t('tech_meditation.name', 'Meditación')}
            </h3>
            <p style={{ lineHeight: '1.6' }}>
              Reduce el estrés y aumenta la claridad mental con prácticas guiadas
            </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          {t('tech_meditation.name', 'Meditación')}
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          {t('tech_meditation.desc', 'Sesiones guiadas con biofeedback y adaptación en tiempo real.')}
        </p>

      </div>

      <div
        className="feature-card"
        style={{ textAlign: 'center', transition: 'all 0.3s ease' }}
      >
        <div
          style={{
            width: '5rem',
            height: '5rem',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'var(--feature-gradient-3, linear-gradient(135deg, #4facfe 0%, #00f2fe 100%))'
          }}
        >
          <TrendingUp size={32} color="white" />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          {t('tech_analytics.name', 'Análisis Avanzado')}
        </h3>
        <p style={{ lineHeight: '1.6' }}>
          {t('tech_analytics.desc', 'Reportes detallados para maximizar tu desarrollo.')}
        </p>
      </div>
    </div>
  </div>
</section>


      <section className="section-techniques" style={{ padding: '4rem 1rem' }}>
        <div className="content-inner">
          <h2 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: '700', marginBottom: '3rem', color: 'white', textAlign: 'center' }}>{t('techniques_available', 'Techniques Available')}</h2>


          <div className="tech-grid">

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

            {tecnicas.map((tecnica) => {
              const { Icon } = tecnica;
              return (
                <div key={tecnica.id} className="tech-card">
                  <div className="tech-icon" style={{ marginBottom: '1rem' }}><Icon size={40} color={tecnica.color} /></div>

                  <h3 className="tech-title">
                    {tecnica.key === 'tech_pomodoro' ? 'Pomodoro' : tecnica.key === 'tech_meditation' ? 'Meditación' : tecnica.key === 'tech_rewards' ? 'Recompensas' : 'Tareas'}
                  </h3>
                  <p className="tech-desc">
                    {tecnica.key === 'tech_pomodoro' ?
                      'Mejora tu productividad trabajando en bloques de tiempo con pausas estratégicas.' : tecnica.key === 'tech_meditation' ?
                      'Reduce el estrés y aumenta la claridad mental con prácticas guiadas' : tecnica.key === 'tech_rewards' ?
                      'Gana logros y puntos por tus hábitos.' :
                      'Organiza y gestiona tus pendientes fácilmente.'}
                  </p>
                  <button className="tech-cta" onClick={() => handleTecnicaClick(tecnica.ruta)}>
                    {tecnica.key === 'tech_pomodoro' ? 'Ir a Pomodoro' : tecnica.key === 'tech_meditation' ? 'Ir a Meditación' : tecnica.key === 'tech_rewards' ? 'Ir a Recompensas' : 'Ir a Tareas'}
                  </button>

              <h3 className="tech-title">{t(`${tecnica.key}.name`)}</h3>
              <p className="tech-desc">{t(`${tecnica.key}.desc`)}</p>
              <button className="tech-cta" onClick={() => handleTecnicaClick(tecnica.ruta)}>{t('go_to', 'Go to')} {t(`${tecnica.key}.name`)}</button>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sección de estadísticas eliminada por petición del usuario */}

      <section className="section-cta" style={{ padding: '6rem 0' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: '700', marginBottom: '1.5rem' }}>{t('cta_transform', '¿Listo para Transformar tu Mente?')}</h2>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: '1.6', marginBottom: '3rem', opacity: 0.9, color: 'var(--text-muted, #d1d5db)' }}>{t('cta_subtext', 'Join thousands training their minds to reach their full potential.')}</p>
          <button onClick={() => handleAuth('register')} className="btn-cta-final">{t('cta_start', 'Comenzar Ahora')}</button>
        </div>
      </section>

          
          </div>
        </div>
      </main>
    </>
  );
}