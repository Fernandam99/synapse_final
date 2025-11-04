import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Star, Play, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function Meditacion() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('active');
    const [timer, setTimer] = useState(600); // 10 minutos
    const [isRunning, setIsRunning] = useState(false);
    const [duracion, setDuracion] = useState(10);
    const [tipo, setTipo] = useState('mindfulness');

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

    // Temporizador
    useEffect(() => {
        let interval = null;
        if (isRunning && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0) {
            setIsRunning(false);
            // Aquí llamarías a tu servicio para registrar la sesión
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startMeditacion = () => {
        setTimer(duracion * 60);
        setIsRunning(true);
    };

    const resetTimer = () => {
        setIsRunning(false);
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
                                <h2 className="session-title">Meditación {tipo === 'mindfulness' ? 'Mindfulness' : 'Respiración'}</h2>
                                <p className="session-subtitle">Relájate durante {duracion} minutos</p>

                                <div className="timer-circle">
                                    <div className="timer-time">{formatTime(timer)}</div>
                                    <div className="timer-label">{t('meditation')}</div>
                                </div>

                                <div className="session-controls">
                                    <label>Tipo de meditación</label>
                                    <select value={tipo} onChange={e => setTipo(e.target.value)} className="control-select">
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
                                            setDuracion(Number(e.target.value));
                                            if (!isRunning) setTimer(Number(e.target.value) * 60);
                                        }}
                                        className="duration-slider"
                                    />
                                    <span>{duracion} min</span>
                                </div>

                                <div className="button-group">
                                    <button onClick={startMeditacion} disabled={isRunning} className="button button-primary">
                                        <Play /> {t('start')}
                                    </button>
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
      `}</style>
        </div>
    );
}