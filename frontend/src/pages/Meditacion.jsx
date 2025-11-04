import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Star, Play, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import meditacionService from '../services/meditacionService'; // ← IMPORTADO

export default function Meditacion() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('active');
    const [timer, setTimer] = useState(600); // 10 minutos
    const [isRunning, setIsRunning] = useState(false);
    const [duracion, setDuracion] = useState(10);
    const [tipo, setTipo] = useState('mindfulness');
    const [sessionId, setSessionId] = useState(null); // ← NUEVO

    const stats = {
        weekMinutes: 45,
        completedSessions: 5,
        streak: 3,
        effectiveness: 82
    };

    const progressData = [
        { day: 'Lun', minutes: 10 },
        { day: 'Mar', minutes: 15 },
        { day: 'Mié', minutes: 0 },
        { day: 'Jue', minutes: 20 },
        { day: 'Vie', minutes: 10 },
        { day: 'Sáb', minutes: 0 },
        { day: 'Dom', minutes: 0 }
    ];

    // Temporizador + finalización automática
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

    // ✅ INICIAR con backend
    const startMeditacion = async () => {
        try {
            const payload = {
                duracion: duracion,
                tipo_meditacion: tipo
            };
            const res = await meditacionService.iniciar(payload);
            setSessionId(res.data.meditacion.sesion_id); // ← Guardamos ID de sesión
            setTimer(duracion * 60);
            setIsRunning(true);
        } catch (err) {
            console.error('Error al iniciar meditación:', err);
            alert(err.response?.data?.error || 'No se pudo iniciar la sesión');
        }
    };

    // ✅ FINALIZAR con backend
    const finalizarSesion = async (completada = false) => {
        if (!sessionId) return;
        try {
            await meditacionService.finalizar({
                completado_totalmente: completada,
                calificacion: completada ? 5 : 3 // ← Ejemplo: calificación automática (puedes pedirla al usuario)
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
            finalizarSesion(false); // Finaliza si estaba activa
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
                                <h2 className="session-title">Meditación {tipo === 'mindfulness' ? 'Mindfulness' : tipo === 'respiracion' ? 'Respiración' : 'Body Scan'}</h2>
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
                                        <Line type="monotone" dataKey="minutes" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 6 }} />
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
      `}</style>
        </div>
    );
}