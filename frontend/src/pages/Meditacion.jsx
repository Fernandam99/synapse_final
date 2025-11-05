// frontend/src/pages/Meditacion.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Star, Play, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import meditacionService from '../services/meditacion';

export default function Meditacion() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('active');
    const [timer, setTimer] = useState(600); // 10 minutos
    const [isRunning, setIsRunning] = useState(false);
    const [duracion, setDuracion] = useState(10);
    const [tipo, setTipo] = useState('mindfulness');
    const [sessionId, setSessionId] = useState(null);

    // ✅ Datos dinámicos desde API
    const [stats, setStats] = useState({
        weekMinutes: 0,
        completedSessions: 0,
        streak: 0,
        effectiveness: 0
    });
    const [progressData, setProgressData] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // ✅ Cargar datos desde API al montar el componente
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const res = await meditacionService.getHistorial();
                const historial = res.data || [];

                // Calcular estadísticas
                const hoy = new Date();
                const hace7dias = new Date();
                hace7dias.setDate(hoy.getDate() - 7);

                const sesionesCompletadas = historial.filter(s => s.estado === 'Completado');
                const completadasEstaSemana = sesionesCompletadas.filter(s => {
                    const fecha = new Date(s.inicio);
                    return fecha >= hace7dias && fecha <= hoy;
                });

                const totalMinutosSemana = completadasEstaSemana.reduce((sum, s) => sum + (s.duracion_real || 0), 0);
                const racha = calcularRacha(historial); // Implementación abajo

                setStats({
                    weekMinutes: Math.round(totalMinutosSemana),
                    completedSessions: sesionesCompletadas.length,
                    streak: racha,
                    effectiveness: sesionesCompletadas.length > 0 ? Math.round((sesionesCompletadas.length / historial.length) * 100) : 0
                });

                // Preparar datos para el gráfico (últimos 7 días)
                const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const data = dias.map((dia, i) => {
                    const fecha = new Date(hace7dias);
                    fecha.setDate(hace7dias.getDate() + i);
                    const minutos = completadasEstaSemana
                        .filter(s => new Date(s.fecha).toDateString() === fecha.toDateString())
                        .reduce((sum, s) => sum + (s.duracion_real || 0), 0);
                    return { day: dia, minutes: minutos };
                });
                setProgressData(data);
            } catch (err) {
                console.error('Error al cargar historial:', err);
                // Mantener valores por defecto en caso de error
                setStats({ weekMinutes: 0, completedSessions: 0, streak: 0, effectiveness: 0 });
                setProgressData([
                    { day: 'Lun', minutes: 0 },
                    { day: 'Mar', minutes: 0 },
                    { day: 'Mié', minutes: 0 },
                    { day: 'Jue', minutes: 0 },
                    { day: 'Vie', minutes: 0 },
                    { day: 'Sáb', minutes: 0 },
                    { day: 'Dom', minutes: 0 }
                ]);
            } finally {
                setLoadingStats(false);
            }
        };

        cargarDatos();
    }, []);

    // Función auxiliar para calcular racha
    const calcularRacha = (historial) => {
        if (historial.length === 0) return 0;
        const fechasCompletadas = [...new Set(
            historial
                .filter(s => s.estado === 'Completado')
                .map(s => new Date(s.inicio).toDateString())
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

    // Temporizador
    useEffect(() => {
        let interval = null;
        if (isRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isRunning) {
            finalizarSesion(true);
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startMeditacion = async () => {
        try {
            const payload = { duracion: duracion, tipo_meditacion: tipo };
            const res = await meditacionService.iniciar(payload);
            setSessionId(res.data.meditacion.sesion_id);
            setTimer(duracion * 60);
            setIsRunning(true);
        } catch (err) {
            console.error('Error al iniciar meditación:', err);
            alert(err.response?.data?.error || 'No se pudo iniciar la sesión');
        }
    };

    const finalizarSesion = async (completada = false) => {
        if (!sessionId) return;
        try {
            await meditacionService.finalizar({
                completado_totalmente: completada,
                calificacion: completada ? 5 : null
            });
        } catch (err) {
            console.error('Error al finalizar meditación:', err);
        } finally {
            setIsRunning(false);
            setSessionId(null);
        }
    };

    const resetTimer = () => {
        if (isRunning && sessionId) {
            finalizarSesion(false);
        }
        setTimer(duracion * 60);
    };

    return (
        <div className="concentration-app">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">{t('meditation')}</h1>
                    <p className="header-subtitle">
                        {t('tech_meditation.desc', 'Sesiones guiadas con biofeedback y adaptación en tiempo real.')}
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
                            <div className="stat-value">{stats.weekMinutes}min</div>
                            <div className="stat-label">{t('this_week')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon pink"><Calendar /></div>
                            <div className="stat-value">{stats.completedSessions}</div>
                            <div className="stat-label">Sesiones</div>
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
                                    Meditación {tipo === 'mindfulness' ? 'Mindfulness' : tipo === 'respiracion' ? 'Respiración' : 'Body Scan'}
                                </h2>
                                <p className="session-subtitle">Relájate durante {duracion} minutos</p>

                                <div className="timer-circle">
                                    <div className="timer-time">{formatTime(timer)}</div>
                                    <div className="timer-label">{t('meditation')}</div>
                                </div>

                                <div className="session-controls">
                                    <label>Tipo de meditación</label>
                                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="control-select" disabled={isRunning}>
                                        <option value="mindfulness">Mindfulness</option>
                                        <option value="respiracion">Respiración</option>
                                        <option value="body_scan">Body Scan</option>
                                    </select>
                                    <label>Duración (minutos)</label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="30"
                                        value={duracion}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            setDuracion(val);
                                            if (!isRunning) setTimer(val * 60);
                                        }}
                                        className="duration-slider"
                                        disabled={isRunning}
                                    />
                                    <span>{duracion} min</span>
                                </div>

                                <div className="button-group">
                                    {!isRunning ? (
                                        <button onClick={startMeditacion} className="button button-primary">
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
                                <h3 className="chart-title">Progreso Semanal</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={progressData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" stroke="#666" />
                                        <YAxis stroke="#666" />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="minutes"
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
        .session-controls {
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .control-select, .duration-slider {
          width: 100%;
          max-width: 320px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .duration-slider {
          -webkit-appearance: none;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
        }
        .duration-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
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
      `}</style>
        </div>
    );
}