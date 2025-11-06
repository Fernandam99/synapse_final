// frontend/src/pages/Pomodoro.jsx
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Coffee, Flame, Settings, Clock, Calendar, Droplet, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import pomodoroService from '../services/pomodoro'; // Importar el nuevo servicio
import api from '../services/api'; // Mantener api para finalizar si es necesario
import cfg from '../services/config'; // Mantener cfg para finalizar si es necesario

export default function Pomodoro() {
    const { t } = useTranslation();

    // Estado para pestaña activa (Sesión Activa / Progreso)
    const [activeTab, setActiveTab] = useState('active');

    // Estados para el temporizador y la sesión
    const [timer, setTimer] = useState(25 * 60); // 25 minutos en segundos por defecto
    const [isRunning, setIsRunning] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    // Estados para la configuración del Pomodoro
    const [tipo, setTipo] = useState('clasico'); // 'clasico', 'extendido', 'micro', 'personalizado'
    const [config, setConfig] = useState({
        duracion_trabajo: 25,
        duracion_descanso: 5,
        ciclos_objetivo: 4,
        modo_no_distraccion: false
    });

    // Estados para estadísticas y progreso
    const [stats, setStats] = useState({
        weekSessions: 0, // Sesiones esta semana
        completedCycles: 0, // Ciclos completados totales
        streak: 0, // Racha de días
        effectiveness: 0 // Efectividad
    });
    const [progressData, setProgressData] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // Estados para personalización
    const [customConfig, setCustomConfig] = useState({
        duracion_trabajo: 25,
        duracion_descanso: 5,
        ciclos_objetivo: 4
    });

    // Cargar historial y calcular estadísticas al montar
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const historial = await pomodoroService.getHistorial();
                console.log("Historial Pomodoro:", historial); // Debug

                // Calcular estadísticas
                const hoy = new Date();
                const hace7dias = new Date();
                hace7dias.setDate(hoy.getDate() - 7);

                const sesionesCompletadas = historial.filter(s => s.estado === 'Completado');
                const completadasEstaSemana = sesionesCompletadas.filter(s => {
                    const fecha = new Date(s.fecha_inicio); // Ajusta según el campo real del backend
                    return fecha >= hace7dias && fecha <= hoy;
                });

                // Calcular ciclos completados (asumiendo que cada sesión completada es un ciclo)
                // Si el backend devuelve ciclos por sesión, ajusta esta lógica
                const ciclosCompletados = sesionesCompletadas.length;
                const racha = calcularRacha(historial);

                setStats({
                    weekSessions: completadasEstaSemana.length,
                    completedCycles: ciclosCompletados,
                    streak: racha,
                    effectiveness: sesionesCompletadas.length > 0 ? Math.round((sesionesCompletadas.length / historial.length) * 100) : 0
                });

                // Preparar datos para el gráfico (sesiones por día esta semana)
                const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const data = dias.map((dia, i) => {
                    const fecha = new Date(hace7dias);
                    fecha.setDate(hace7dias.getDate() + i);
                    const sesionesDelDia = completadasEstaSemana.filter(s => {
                        const sDate = new Date(s.fecha_inicio);
                        return sDate.toDateString() === fecha.toDateString();
                    }).length;
                    return { day: dia, sessions: sesionesDelDia };
                });
                setProgressData(data);
            } catch (err) {
                console.error('Error al cargar historial de Pomodoro:', err);
                setStats({ weekSessions: 0, completedCycles: 0, streak: 0, effectiveness: 0 });
                setProgressData([
                    { day: 'Lun', sessions: 0 },
                    { day: 'Mar', sessions: 0 },
                    { day: 'Mié', sessions: 0 },
                    { day: 'Jue', sessions: 0 },
                    { day: 'Vie', sessions: 0 },
                    { day: 'Sáb', sessions: 0 },
                    { day: 'Dom', sessions: 0 }
                ]);
            } finally {
                setLoadingStats(false);
            }
        };

        cargarDatos();
    }, []); // Se ejecuta una vez al montar


    // Efecto para el temporizador
    useEffect(() => {
        let interval = null;
        if (isRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isRunning) {
            manejarFinFase(); // Cambiado de finalizarSesion a manejarFinFase
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    // Función para manejar el fin de una fase (trabajo o descanso)
    const manejarFinFase = async () => {
        if (isRunning) { // Aseguramos que solo actúe si está corriendo
            if (config.faseActual === 'trabajo') {
                // Finalizar fase de trabajo, cambiar a descanso
                const nuevosCiclos = config.ciclosCompletados + 1;
                setConfig(prev => ({ ...prev, ciclosCompletados: nuevosCiclos, faseActual: 'descanso' }));
                setTimer(config.duracion_descanso * 60);
            } else { // faseActual === 'descanso'
                if (config.ciclosCompletados + 1 >= config.ciclos_objetivo) {
                    // Finalizar sesión completa
                    await finalizarSesion(true);
                } else {
                    // Cambiar a fase de trabajo
                    setConfig(prev => ({ ...prev, faseActual: 'trabajo' }));
                    setTimer(config.duracion_trabajo * 60);
                }
            }
        }
    };

    // Función para calcular la racha
    const calcularRacha = (historial) => {
        if (historial.length === 0) return 0;
        const fechasCompletadas = [...new Set(
            historial
                .filter(s => s.estado === 'Completado')
                .map(s => new Date(s.fecha_inicio).toDateString()) // Ajusta el campo de fecha
        )].sort((a, b) => new Date(b) - new Date(a));

        let racha = 0;
        let fechaAnterior = new Date();

        for (const fechaStr of fechasCompletadas) {
            const fecha = new Date(fechaStr);
            const diffDias = Math.floor((fechaAnterior - fecha) / (1000 * 60 * 60 * 24));
            if (diffDias === 1) {
                racha++;
            } else if (diffDias > 1) {
                break;
            }
            fechaAnterior = fecha;
        }
        return racha;
    };

    // Formatear tiempo para mostrar
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Iniciar sesión de Pomodoro
    const startPomodoro = async () => {
        try {
            const payload = {
                duracion_trabajo: config.duracion_trabajo,
                duracion_descanso: config.duracion_descanso,
                ciclos_objetivo: config.ciclos_objetivo,
                modo_no_distraccion: config.modo_no_distraccion
            };
            console.log("Iniciando Pomodoro con payload:", payload); // Debug

            const res = await pomodoroService.iniciar(payload);
            console.log("Respuesta de iniciar Pomodoro:", res); // Debug

            const sesionId = res.pomodoro?.id_sesion || res.sesion_id || res.data?.id_sesion; // Ajusta según respuesta real
            if (!sesionId) throw new Error('No se recibió ID de sesión');
            setSessionId(sesionId);

            // Iniciar temporizador y estado
            setConfig(prev => ({ ...prev, faseActual: 'trabajo', ciclosCompletados: 0 }));
            setTimer(config.duracion_trabajo * 60);
            setIsRunning(true);
        } catch (err) {
            console.error('Error al iniciar Pomodoro:', err);
            alert(err.response?.data?.error || 'No se pudo iniciar la sesión. ¿Ya tienes una activa?');
        }
    };

    // Finalizar sesión de Pomodoro
    const finalizarSesion = async (completada = false) => {
        if (!sessionId) return;
        try {
            // Usar cfg.paths si es necesario, o el servicio si lo implementas completamente allí
            // const res = await api.post(cfg.paths.pomodoroFinalizar, { sesion_id: sessionId, completado_totalmente: completada });
            // o
            await pomodoroService.finalizar({ sesion_id: sessionId, completado_totalmente: completada });
            // Actualizar estado local
            setIsRunning(false);
            setSessionId(null);
            setConfig(prev => ({ ...prev, faseActual: 'trabajo', ciclosCompletados: 0 })); // Resetear ciclos si se finaliza antes de completar el objetivo
            setTimer(config.duracion_trabajo * 60); // Resetear timer si se finaliza
        } catch (err) {
            console.error('Error al finalizar Pomodoro:', err);
            alert(err.response?.data?.error || 'Error al finalizar la sesión');
        }
    };

    // Reiniciar temporizador (y posiblemente sesión)
    const resetTimer = () => {
        if (isRunning && sessionId) {
            // Opción 1: Finalizar sesión actual si se reinicia mientras corre
            // finalizarSesion(false);
            // Opción 2: Simplemente reiniciar el timer local y estado sin tocar la sesión en backend
            // Esta opción es más segura si no se quiere interrumpir la sesión en backend
            setIsRunning(false);
            setConfig(prev => ({ ...prev, faseActual: 'trabajo', ciclosCompletados: 0 }));
            setTimer(config.duracion_trabajo * 60);
        } else {
            // Si no está corriendo, solo reiniciar el timer local
            setConfig(prev => ({ ...prev, faseActual: 'trabajo', ciclosCompletados: 0 }));
            setTimer(config.duracion_trabajo * 60);
        }
    };

    // Manejar cambio de tipo de Pomodoro
    const handleTipoChange = (e) => {
        const newTipo = e.target.value;
        setTipo(newTipo);

        let newConfig = {};
        switch (newTipo) {
            case 'clasico':
                newConfig = { duracion_trabajo: 25, duracion_descanso: 5, ciclos_objetivo: 4 };
                break;
            case 'extendido':
                newConfig = { duracion_trabajo: 50, duracion_descanso: 10, ciclos_objetivo: 3 };
                break;
            case 'micro':
                newConfig = { duracion_trabajo: 15, duracion_descanso: 3, ciclos_objetivo: 5 };
                break;
            case 'personalizado':
                // Mantener la configuración personalizada actual
                newConfig = { ...customConfig };
                break;
            default:
                newConfig = { duracion_trabajo: 25, duracion_descanso: 5, ciclos_objetivo: 4 };
        }
        // Actualizar la configuración principal y el timer si no está corriendo
        setConfig(prev => ({ ...prev, ...newConfig }));
        if (!isRunning) {
            setTimer(newConfig.duracion_trabajo * 60);
        }
    };

    // Manejar cambio en la configuración personalizada
    const handleCustomChange = (e) => {
        const { name, value } = e.target;
        const val = Number(value);
        setCustomConfig(prev => ({ ...prev, [name]: val }));
        // Si está en modo personalizado, actualizar la config principal también
        if (tipo === 'personalizado' && !isRunning) {
            setConfig(prev => ({ ...prev, [name]: val }));
            if (name === 'duracion_trabajo') {
                setTimer(val * 60);
            }
        }
    };

    // Manejar cambio de modo no distracción
    const handleModoChange = (e) => {
        const checked = e.target.checked;
        setConfig(prev => ({ ...prev, modo_no_distraccion: checked }));
    };

    // Determinar si es fase de trabajo o descanso para estilos
    const isWorkPhase = config.faseActual === 'trabajo' || !sessionId; // Si no hay sesión activa, mostrar como trabajo

    return (
        <div className="pomodoro-app">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">{t('pomodoro')}</h1>
                    <p className="header-subtitle">
                        {t('tech_pomodoro.desc', 'Técnicas de estudio por intervalos para mejorar tu concentración.')}
                    </p>
                </div>

                {/* Mostrar loader de estadísticas si están cargando */}
                {loadingStats ? (
                    <div className="stats-grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="stat-card" style={{ opacity: 0.6 }}>
                                <div className="stat-value">--</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple"><Clock /></div>
                            <div className="stat-value">{stats.weekSessions}</div>
                            <div className="stat-label">{t('this_week')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon pink"><Flame /></div>
                            <div className="stat-value">{stats.completedCycles}</div>
                            <div className="stat-label">Ciclos</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><Droplet /></div>
                            <div className="stat-value">{stats.streak}</div>
                            <div className="stat-label">Días seguidos</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon purple"><Star /></div>
                            <div className="stat-value">{stats.effectiveness}%</div>
                            <div className="stat-label">Efectividad</div>
                        </div>
                    </div>
                )}

                <div className="tabs-container">
                    <div className="tabs-header">
                        <button className={`tab-button ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                            {t('session_active')}
                        </button>
                        <button className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
                            {t('my_progress')}
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'active' && (
                            <div className="session-active">
                                <h2 className="session-title">
                                    Pomodoro {tipo === 'clasico' ? 'Clásico' : tipo === 'extendido' ? 'Extendido' : tipo === 'micro' ? 'Micro' : 'Personalizado'}
                                </h2>
                                <p className="session-subtitle">
                                    {isWorkPhase ? `Trabaja durante ${config.duracion_trabajo} minutos` : `Descansa durante ${config.duracion_descanso} minutos`}
                                </p>

                                <div className={`timer-circle ${isWorkPhase ? 'work' : 'break'}`}>
                                    <div className="timer-time">{formatTime(timer)}</div>
                                    <div className="timer-label">{isWorkPhase ? 'Trabajo' : 'Descanso'}</div>
                                </div>

                                <div className="session-controls">
                                    <label>Tipo de Pomodoro</label>
                                    <select value={tipo} onChange={handleTipoChange} className="control-select" disabled={isRunning}>
                                        <option value="clasico">Clásico (25/5)</option>
                                        <option value="extendido">Extendido (50/10)</option>
                                        <option value="micro">Micro (15/3)</option>
                                        <option value="personalizado">Personalizado</option>
                                    </select>

                                    {tipo === 'personalizado' && (
                                        <>
                                            <label>Duración Trabajo (minutos)</label>
                                            <input
                                                type="number"
                                                name="duracion_trabajo"
                                                value={customConfig.duracion_trabajo}
                                                onChange={handleCustomChange}
                                                className="control-input"
                                                min="1"
                                                max="90"
                                                disabled={isRunning}
                                            />
                                            <label>Duración Descanso (minutos)</label>
                                            <input
                                                type="number"
                                                name="duracion_descanso"
                                                value={customConfig.duracion_descanso}
                                                onChange={handleCustomChange}
                                                className="control-input"
                                                min="1"
                                                max="30"
                                                disabled={isRunning}
                                            />
                                            <label>Ciclos Objetivo</label>
                                            <input
                                                type="number"
                                                name="ciclos_objetivo"
                                                value={customConfig.ciclos_objetivo}
                                                onChange={handleCustomChange}
                                                className="control-input"
                                                min="1"
                                                max="12"
                                                disabled={isRunning}
                                            />
                                        </>
                                    )}

                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={config.modo_no_distraccion}
                                            onChange={handleModoChange}
                                            disabled={isRunning}
                                        />
                                        {t('focus_mode')}
                                    </label>
                                </div>

                                <div className="button-group">
                                    {!isRunning ? (
                                        <button onClick={startPomodoro} className="button button-primary">
                                            <Play /> {t('start')}
                                        </button>
                                    ) : (
                                        <button onClick={() => finalizarSesion(false)} className="button button-secondary">
                                            Finalizar ahora
                                        </button>
                                    )}
                                    <button onClick={resetTimer} className="button button-secondary">
                                        <RotateCcw /> {t('reset')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'progress' && (
                            <div>
                                <h3 className="chart-title">Sesiones Esta Semana</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={progressData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="sessions"
                                            stroke="#ec4899"
                                            strokeWidth={3}
                                            dot={{ fill: '#ec4899', r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .pomodoro-app {
          min-height: 100vh;
          background: linear-gradient(135deg, #faf5ff 0%, #fef3f9 50%, #f0f9ff 100%);
          padding: 32px;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { margin-bottom: 24px; }
        .header-title { font-size: 28px; font-weight: 600; color: #c5c5c5; margin-bottom: 6px; letter-spacing: -0.5px; }
        .header-subtitle { font-size: 14px; color: #6b7280; font-weight: 400; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin: 24px 0;
        }
        .stat-card {
          background: white;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          text-align: center;
        }
        .stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          margin-bottom: 12px;
          color: white;
        }
        .stat-icon.purple { background: #7c3aed; }
        .stat-icon.pink { background: #ec4899; }
        .stat-icon.blue { background: #3b82f6; }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          margin: 8px 0;
        }
        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .tabs-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 24px;
        }
        .tab-button {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          margin-bottom: -2px;
        }
        .tab-button:hover {
          color: #9333ea;
          background: #faf5ff;
        }
        .tab-button.active {
          color: #9333ea;
          border-bottom-color: #9333ea;
          background: transparent;
        }
        .tabs-content {
          padding: 20px 0;
        }

        .session-active {
          text-align: center;
        }
        .session-title {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 6px;
        }
        .session-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 40px;
        }
        .timer-circle {
          width: 280px;
          height: 280px;
          margin: 0 auto;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          margin-bottom: 24px;
          transition: all 0.3s;
        }
        .timer-circle.work { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .timer-circle.break { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .timer-time {
          font-size: 56px;
          font-weight: 700;
          color: #111;
        }
        .timer-label {
          font-size: 18px;
          color: #555;
          margin-top: 8px;
        }

        .session-controls {
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .control-select, .control-input {
          width: 100%;
          max-width: 320px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .button-group {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 24px;
        }
        .button {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          cursor: pointer;
        }
        .button-primary {
          background: linear-gradient(135deg, #7c3aed, #667eea);
          color: white;
        }
        .button-secondary {
          background: #f3f4f6;
          color: #333;
        }
        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 16px;
          text-align: center;
        }

        @media (max-width: 600px) {
          .pomodoro-app { padding: 16px; }
          .header-title { font-size: 24px; }
          .timer-circle { width: 220px; height: 220px; }
          .timer-time { font-size: 44px; }
          .stats-grid { grid-template-columns: 1fr; }
          .session-controls { max-width: 100%; }
        }
      `}</style>
        </div>
    );
}