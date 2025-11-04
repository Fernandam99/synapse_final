import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar, Clock, Droplet, Star, Play, RotateCcw, TrendingUp, BarChart3,
    X, CheckCircle, CloudRain, Speaker, Waves, Drum, Zap, Leaf, Wind, Target, Heart,
    Minus, Plus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Configuration and Mock Data ---

const techniquesData = [
    { name: 'Pomodoro Clásico', duration: '25/5/15', cycles: 4, type: 'Beginner', description: 'Concentración total en bloques de 25 min.', benefits: ['Enfoque rápido', 'Ideal para principiantes'], selected: true },
    { name: 'Concentración Profunda', duration: '52/17/34', cycles: 3, type: 'Intermediate', description: 'Bloques de trabajo largos con descansos medios para tareas complejas.', benefits: ['Dominio de temas', 'Menos interrupciones'] },
    { name: 'Sprints Rápidos', duration: '15/3/15', cycles: 6, type: 'Beginner', description: 'Ideal para tareas cortas y de alta energía.', benefits: ['Impulso de energía', 'Ideal para listas de control'] },
    { name: 'Custom', duration: 'X/Y/Z', cycles: '∞', type: 'Expert', description: 'Define tus propios intervalos de tiempo para máxima flexibilidad.', benefits: ['Control total', 'Adaptable 100%'] },
    { name: 'Pomodoro Largo', duration: '50/10/30', cycles: 2, type: 'Intermediate', description: 'Para tareas que requieren un enfoque prolongado sin interrupciones.', benefits: ['Flujo sostenido', 'Proyectos grandes'] },
    { name: 'Descanso Activo', duration: '25/5/0', cycles: 4, type: 'Beginner', description: 'Sin descanso largo, ideal para mantener la energía en pausas cortas.', benefits: ['Transición fluida', 'Evita la pereza'] }
];

const soundsData = [
    { name: 'Silencio', icon: Speaker, color: 'text-gray-500' },
    { name: 'Lluvia', icon: CloudRain, color: 'text-blue-500' },
    { name: 'Olas', icon: Waves, color: 'text-cyan-500' },
    { name: 'Ruido Blanco', icon: Drum, color: 'text-purple-500' },
    { name: 'Lo-fi Beats', icon: Zap, color: 'text-pink-500' },
    { name: 'Naturaleza', icon: Leaf, color: 'text-green-500' },
    { name: 'Viento', icon: Wind, color: 'text-slate-500' },
    { name: 'Cafetería', icon: CloudRain, color: 'text-amber-500' }
];

const mockSessionData = [
    { date: new Date(Date.now() - 86400000 * 1).toISOString(), technique: 'Pomodoro Clásico', duration: 25, completed: true, effectiveness: 92, notes: 'Buen enfoque' },
    { date: new Date(Date.now() - 86400000 * 2).toISOString(), technique: 'Concentración Profunda', duration: 52, completed: true, effectiveness: 88, notes: 'Tarea compleja' },
    { date: new Date(Date.now() - 86400000 * 3).toISOString(), technique: 'Pomodoro Clásico', duration: 25, completed: false, effectiveness: 70, notes: 'Mucha distracción' },
    { date: new Date(Date.now() - 86400000 * 4).toISOString(), technique: 'Sprints Rápidos', duration: 15, completed: true, effectiveness: 95, notes: 'Lista de control' },
];

const mockProgressData = [
    { day: 'Lun', minutes: 75 },
    { day: 'Mar', minutes: 110 },
    { day: 'Mié', minutes: 70 },
    { day: 'Jue', minutes: 95 },
    { day: 'Vie', minutes: 120 },
    { day: 'Sáb', minutes: 85 },
    { day: 'Dom', minutes: 55 }
];

const mockMonthlyData = [
    { week: 'Sem 1', minutes: 380 },
    { week: 'Sem 2', minutes: 450 },
    { week: 'Sem 3', minutes: 350 },
    { week: 'Sem 4', minutes: 500 }
];


// --- Sub-Components: Modals (externalized to components/PomodoroModules.jsx) ---
import { TechniquesModal, SoundsModal, GoalsModal } from './components/PomodoroModules';


// --- Main Component ---
const ConcentrationApp = () => {
    // --- State Initialization ---
    const [activeTab, setActiveTab] = useState('active');
    const [timer, setTimer] = useState(1500); // 25 minutos en segundos
    const [isRunning, setIsRunning] = useState(false);
    const [sessions, setSessions] = useState(mockSessionData);
    const [stats, setStats] = useState({
        weekMinutes: 127,
        completedSessions: 23,
        streak: 7,
        effectiveness: 89
    });

    // Modal States
    const [isTechniquesModalOpen, setIsTechniquesModalOpen] = useState(false);
    const [isSoundsModalOpen, setIsSoundsModalOpen] = useState(false);
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    
    // Custom States for Modals
    const [selectedTechnique, setSelectedTechnique] = useState('Pomodoro Clásico');
    const [selectedSound, setSelectedSound] = useState('Lluvia');
    const [volume, setVolume] = useState(75);
    const [goals, setGoals] = useState({
        dailyGoal: 150,
        weeklyGoal: 800,
        monthlyGoal: 3000
    });

    const currentTechnique = useMemo(() => techniquesData.find(t => t.name === selectedTechnique) || techniquesData[0], [selectedTechnique]);

    // Timer countdown logic
    useEffect(() => {
        let interval = null;
        if (isRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer(t => t - 1);
            }, 1000);
        } else if (timer === 0) {
            // Simulated completion
            setIsRunning(false);
            alert('¡Tiempo de concentración terminado!'); // Use alert() as a simple placeholder for completion notification
            setTimer(1500); // Reset for next cycle
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    // Handlers
    const startTimer = () => setIsRunning(true);
    const resetTimer = () => {
        setIsRunning(false);
        setTimer(1500);
    };

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Helper for time details grid
    const renderTimeDetails = () => {
        const parts = currentTechnique.duration.split('/');
        const labels = ['Duración del sprint', 'Descanso corto', 'Descanso largo'];
        const colors = ['bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700'];

        return (
            <div className="grid grid-cols-2 gap-4">
                {parts.map((time, index) => (
                    <div key={index} className={`p-3 rounded-xl flex flex-col justify-center items-center ${colors[index]}`}>
                        <span className="font-extrabold text-2xl">{time}{time !== 'X' && 'min'}</span>
                        <span className="text-xs font-medium opacity-80">{labels[index]}</span>
                    </div>
                ))}
                <div className="p-3 rounded-xl flex flex-col justify-center items-center bg-pink-100 text-pink-700">
                    <span className="font-extrabold text-2xl">{currentTechnique.cycles}</span>
                    <span className="text-xs font-medium opacity-80">Ciclos</span>
                </div>
            </div>
        );
    };

    const renderTechniqueBenefits = () => (
        <div className="benefits">
            <h3 className="text-lg font-extrabold text-gray-800 mb-3 flex items-center">
                <Heart size={18} className="text-pink-500 mr-2" />
                Beneficios de {currentTechnique.name}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {currentTechnique.benefits?.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                        <CheckCircle size={16} className="text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // Main Render
    return (
        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
            <style>{`
                /* General Styles */
                :root {
                    --accent-1: #9333ea; /* Purple */
                    --accent-2: #ec4899; /* Pink */
                    --text-primary: #1f2937; /* Dark Gray */
                    --muted: #6b7280; /* Medium Gray */
                }
                .concentration-app {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .header-title { font-size: 2.5rem; font-weight: 900; color: var(--text-primary); }
                .header-subtitle { font-size: 1rem; color: var(--muted); margin-bottom: 2rem; }

                /* Stats Grid */
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem; }
                @media (min-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(4, 1fr); }
                }
                .stat-card {
                    background-color: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    display: flex; flex-direction: column; align-items: flex-start;
                }
                .stat-badge { padding: 0.5rem; border-radius: 50%; margin-bottom: 0.5rem; }
                .stat-badge.purple { background-color: #f3e8ff; color: #9333ea; }
                .stat-badge.pink { background-color: #fce7f3; color: #ec4899; }
                .stat-badge.orange { background-color: #fffbeb; color: #f59e0b; }
                .stat-badge.green { background-color: #d1fae5; color: #10b981; }
                .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); }
                .stat-label { font-size: 0.875rem; color: var(--muted); }

                /* Tabs */
                .tabs-container { background-color: white; border-radius: 16px; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05); padding: 1.5rem; }
                .tabs-header { display: flex; border-bottom: 2px solid #f3f4f6; margin-bottom: 1.5rem; }
                .tab-button {
                    padding: 0.75rem 1rem; font-weight: 600; color: var(--muted); cursor: pointer; border: none; background: none;
                    border-bottom: 3px solid transparent; transition: all 0.2s;
                    margin-right: 1.5rem;
                }
                .tab-button.active { color: var(--accent-1); border-bottom-color: var(--accent-1); font-weight: 700; }

                /* Active Session */
                .session-header { margin-bottom: 1rem; }
                .session-badge { background-color: #f3e8ff; color: #9333ea; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
                .session-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin-top: 0.5rem; }
                .session-subtitle { color: var(--muted); margin-bottom: 1.5rem; }
                .timer-area { display: flex; flex-direction: column; align-items: center; text-align: center; }

                /* Timer Circle */
                .timer-circle {
                    width: 250px; height: 250px; border-radius: 50%; background: #f3f4f6;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    border: 10px solid #e5e7eb; position: relative;
                    transition: all 0.5s;
                }
                .timer-circle.active { border-color: #fbcfe8; background: linear-gradient(135deg, #f0f9ff, #f3e8ff); box-shadow: 0 0 0 15px rgba(147, 51, 234, 0.1); }
                .timer-time { font-size: 4rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
                .timer-label { font-size: 0.875rem; color: #9333ea; font-weight: 700; margin-top: 0.5rem; }
                .timer-session { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }

                /* Timer Metrics */
                .timer-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; width: 100%; max-width: 600px; margin: 1.5rem 0; }
                .metric-box {
                    padding: 0.75rem; border-radius: 8px; background: #f9fafb; text-align: center;
                    border: 1px solid #e5e7eb;
                }
                .metric-value { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); }
                .metric-label { font-size: 0.75rem; color: var(--muted); }

                /* Timer Controls */
                .timer-controls { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; }
                .control-btn {
                    padding: 0.75rem; border-radius: 50%; background: #e5e7eb; color: var(--muted); border: none; cursor: pointer; transition: background 0.2s;
                }
                .control-btn:hover { background: #d1d5db; }
                .play-btn {
                    width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #9333ea, #ec4899); color: white;
                    display: flex; justify-content: center; align-items: center; font-size: 2rem; border: 5px solid #fce7f3;
                    cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 15px rgba(147, 51, 234, 0.4);
                }
                .play-btn:hover { transform: scale(1.05); }

                /* Feature Pills */
                .feature-pills { display: flex; gap: 0.75rem; margin-bottom: 2rem; justify-content: center; }
                .pill {
                    padding: 0.5rem 1rem; border-radius: 9999px; background: #f0f9ff; color: #3b82f6; font-size: 0.875rem; font-weight: 600;
                    cursor: pointer; transition: background 0.2s, box-shadow 0.2s;
                }
                .pill:hover { background: #e0f2fe; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1); }

                /* Tech Details */
                .tech-details h4 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }

                /* History */
                .history-filters { display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; }
                .filter-label { font-weight: 600; color: var(--text-primary); }
                .filter-select { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #d1d5db; background: white; }
                .history-table table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
                .history-table thead th { text-align: left; color: var(--muted); font-size: 0.875rem; padding: 0.75rem 0.5rem; border-bottom: 1px solid #e5e7eb; }
                .history-table tbody tr { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03); }
                .history-table tbody td { padding: 1rem 0.5rem; font-size: 0.875rem; color: var(--text-primary); }
                .history-date { font-weight: 600; }
                .history-time { display: block; font-size: 0.75rem; color: var(--muted); font-weight: 400; }
                .badge-blue { background-color: #eff6ff; color: #2563eb; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; }
                .badge-green { background-color: #d1fae5; color: #059669; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; }
                .effectiveness-bar-container { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; width: 100px; }
                .effectiveness-bar-fill { height: 100%; background: linear-gradient(to right, #10b981, #34d399); }
                .effectiveness-value { font-weight: 600; margin-left: 0.5rem; }

                /* Progress Tab */
                .progress-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .progress-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
                .progress-card.purple { color: #9333ea; }
                .progress-card.pink { color: #ec4899; }
                .progress-card-value { font-size: 2rem; font-weight: 800; margin-top: 0.5rem; }
                .progress-card-label { color: var(--muted); font-size: 0.875rem; }
                .progress-card-change { font-size: 0.75rem; color: #10b981; font-weight: 600; margin-top: 0.5rem; }
                .chart-container { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-bottom: 1.5rem; }
                .chart-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }
                .charts-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
                @media (min-width: 768px) { .charts-grid { grid-template-columns: repeat(2, 1fr); } }
                .insights-card { background: linear-gradient(to right, #f3e8ff, #fce7f3); padding: 1.5rem; border-radius: 12px; }
                .insights-content { display: flex; gap: 1rem; }
                .insights-icon { color: #9333ea; }
                .insights-title { font-size: 1.25rem; font-weight: 800; color: #9333ea; margin-bottom: 0.5rem; }
                .insights-text { font-size: 0.875rem; color: #4b5563; margin-bottom: 1rem; }
                .insights-tags span { background: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; margin-right: 0.5rem; border: 1px solid #d8b4fe; color: #7c3aed; }

                /* Utility Classes (Custom for the app) */
                .progress-bar-container { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; }
                .progress-bar { height: 100%; border-radius: 4px; }
                .progress-bar.purple { background-color: #9333ea; }
                .progress-bar.pink { background-color: #ec4899; }
                .progress-bar.light-purple { background-color: #a78bfa; }
            `}</style>
            
            <div className="concentration-app">
                {/* Header */}
                <div className="header">
                    <h1 className="header-title">Técnica Pomodoro</h1>
                    <p className="header-subtitle">Fortalece tu capacidad de atención con técnicas científicamente probadas y mejora tu productividad</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-badge purple"><Clock size={20} /></div>
                        <div className="stat-value">{stats.weekMinutes}min</div>
                        <div className="stat-label">Esta semana</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-badge pink"><Calendar size={20} /></div>
                        <div className="stat-value">{stats.completedSessions}</div>
                        <div className="stat-label">Sesiones completadas</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-badge orange">🔥</div>
                        <div className="stat-value">{stats.streak}</div>
                        <div className="stat-label">Días consecutivos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-badge green"><Star size={20} /></div>
                        <div className="stat-value">{stats.effectiveness}%</div>
                        <div className="stat-label">Efectividad</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs-header">
                        <button
                            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                            onClick={() => setActiveTab('active')}
                        >
                            Pomodoro Timer
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
                            onClick={() => setActiveTab('progress')}
                        >
                            Análisis
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Historial
                        </button>
                    </div>

                    <div className="tabs-content p-4">
                        {/* 1. Active Session Tab */}
                        {activeTab === 'active' && (
                            <div className="session-active">
                                <div className="session-header">
                                    <span className="session-badge">Sesión Seleccionada</span>
                                </div>
                                <h2 className="session-title">{currentTechnique.name}</h2>
                                <p className="session-subtitle">{currentTechnique.description}</p>

                                <div className="timer-area">
                                    <div className={`timer-circle ${isRunning ? 'active' : ''}`}>
                                        <div className="timer-time">{formatTime(timer)}</div>
                                        <div className="timer-label">🍅 Concentración</div>
                                        <div className="timer-session">Ciclo 1 de {currentTechnique.cycles}</div>
                                    </div>

                                    <div className="timer-metrics">
                                        <div className="metric-box">
                                            <div className="metric-value">0</div>
                                            <div className="metric-label">Interrupciones</div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="metric-value">0m</div>
                                            <div className="metric-label">Tiempo adicional</div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="metric-value">0m</div>
                                            <div className="metric-label">Pausa total</div>
                                        </div>
                                        <div className="metric-box">
                                            <div className="metric-value">0%</div>
                                            <div className="metric-label">Eficiencia</div>
                                        </div>
                                    </div>

                                    <div className="timer-controls">
                                        <button onClick={resetTimer} className="control-btn secondary">
                                            <RotateCcw size={18} />
                                        </button>
                                        <button
                                            onClick={isRunning ? () => setIsRunning(false) : startTimer}
                                            className="play-btn"
                                        >
                                            {isRunning ? '⏸' : <Play size={24} />}
                                        </button>
                                        <button className="control-btn secondary">⏭</button>
                                    </div>
                                </div>

                                {/* Feature Pills - Triggers Modals */}
                                <div className="feature-pills">
                                    <div onClick={() => setIsTechniquesModalOpen(true)} className="pill bg-purple-50 text-purple-600 hover:bg-purple-100">
                                        🎯 Técnicas
                                    </div>
                                    <div onClick={() => setIsSoundsModalOpen(true)} className="pill bg-blue-50 text-blue-600 hover:bg-blue-100">
                                        🎧 Sonidos ({selectedSound})
                                    </div>
                                    <div onClick={() => setIsGoalsModalOpen(true)} className="pill bg-green-50 text-green-600 hover:bg-green-100">
                                        🏆 Objetivos
                                    </div>
                                </div>

                                {/* Benefits Section */}
                                <div className="space-y-6">
                                    {renderTechniqueBenefits()}

                                    {/* Tech Details */}
                                    <div className="tech-details">
                                        <h4>📋 Configuración de Ciclo</h4>
                                        {renderTimeDetails()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Progress Tab (Análisis) */}
                        {activeTab === 'progress' && (
                            <div>
                                <div className="progress-grid">
                                    <div className="progress-card bg-purple-50 text-purple-600">
                                        <Calendar size={32} />
                                        <div className="progress-card-value">31</div>
                                        <div className="progress-card-label">Días mes</div>
                                        <div className="progress-card-change text-emerald-500">↑ 72.5% vs mes anterior</div>
                                    </div>
                                    <div className="progress-card bg-pink-50 text-pink-600">
                                        <Clock size={32} />
                                        <div className="progress-card-value">18.5h</div>
                                        <div className="progress-card-label">Tiempo total</div>
                                        <div className="progress-card-change text-emerald-500">↑ 118% vs mes anterior</div>
                                    </div>
                                    <div className="progress-card bg-purple-50 text-purple-600">
                                        <TrendingUp size={32} />
                                        <div className="progress-card-value">91%</div>
                                        <div className="progress-card-label">Promedio mensual</div>
                                        <div className="progress-card-change text-emerald-500">↑ 8% vs mes anterior</div>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3 className="chart-title">Progreso Semanal (minutos)</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={mockProgressData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="day" stroke="#666" />
                                            <YAxis stroke="#666" />
                                            <Tooltip formatter={(value) => [`${value} min`, 'Concentración']} />
                                            <Line type="monotone" dataKey="minutes" stroke="#9333ea" strokeWidth={3} dot={{ fill: '#9333ea', r: 4 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="charts-grid">
                                    <div className="chart-container">
                                        <h3 className="chart-title">Tendencia Mensual</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={mockMonthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis dataKey="week" stroke="#666" />
                                                <YAxis stroke="#666" />
                                                <Tooltip formatter={(value) => [`${value} min`, 'Concentración']} />
                                                <Bar dataKey="minutes" fill="#ec4899" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="chart-container">
                                        <h3 className="chart-title">Técnicas Más Usadas</h3>
                                        <div className="techniques-list space-y-4 pt-4">
                                            {/* Static technique list */}
                                            {[
                                                { name: 'Pomodoro Clásico', percent: 68, color: 'purple' },
                                                { name: 'Concentración Profunda', percent: 24, color: 'pink' },
                                                { name: 'Sprints Rápidos', percent: 8, color: 'light-purple' }
                                            ].map((item) => (
                                                <div key={item.name} className="technique-item">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="text-sm font-semibold text-gray-700">{item.name}</div>
                                                        <div className="text-sm font-extrabold text-gray-800">{item.percent}%</div>
                                                    </div>
                                                    <div className="progress-bar-container">
                                                        <div className={`progress-bar ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="insights-card mt-6">
                                    <div className="insights-content">
                                        <div className="insights-icon"><BarChart3 size={40} /></div>
                                        <div className="insights-body">
                                            <div className="insights-title">Análisis Inteligente</div>
                                            <div className="insights-text">Tu rendimiento ha mejorado un 15% esta semana. Los viernes son tus días más productivos, con un promedio de 140 minutos de concentración efectiva.</div>
                                            <div className="insights-tags">
                                                <span className="insights-tag">Constancia excelente</span>
                                                <span className="insights-tag">Técnica favorita: Pomodoro</span>
                                                <span className="insights-tag">Mejor horario: 10-12h</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. History Tab */}
                        {activeTab === 'history' && (
                            <div>
                                <div className="history-filters">
                                    <label className="filter-label">Técnica:</label>
                                    <select className="filter-select">
                                        <option>Todas las técnicas</option>
                                        <option>Pomodoro Clásico</option>
                                        <option>Concentración Profunda</option>
                                        <option>Sprints Rápidos</option>
                                    </select>
                                </div>

                                <div className="history-table overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Técnica</th>
                                                <th>Duración</th>
                                                <th>Estado</th>
                                                <th>Efectividad</th>
                                                <th>Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.length > 0 ? (
                                                sessions.map((session, index) => (
                                                    <tr key={index}>
                                                        <td className="history-date">
                                                            {new Date(session.date).toLocaleDateString()}<br/>
                                                            <span className="history-time">{new Date(session.date).toLocaleTimeString()}</span>
                                                        </td>
                                                        <td><span className="badge-blue">{session.technique}</span></td>
                                                        <td>{session.duration} min</td>
                                                        <td><span className={`badge-green ${session.completed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{session.completed ? 'Completada' : 'Incompleta'}</span></td>
                                                        <td>
                                                            <div className="flex items-center">
                                                                <div className="effectiveness-bar-container">
                                                                    <div className="effectiveness-bar-fill" style={{width: `${session.effectiveness}%`}}></div>
                                                                </div>
                                                                <div className="effectiveness-value">{session.effectiveness}%</div>
                                                            </div>
                                                        </td>
                                                        <td>{session.notes || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center p-10 text-gray-500 bg-white shadow-none">
                                                        No hay sesiones registradas aún. ¡Comienza a concentrarte!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pagination flex justify-between items-center mt-6">
                                    <div className="pagination-info text-sm text-gray-600">Página 1 de 1</div>
                                    <div className="pagination-buttons space-x-2">
                                        <button className="pagination-button px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-600 disabled:opacity-50" disabled>Anterior</button>
                                        <button className="pagination-button px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-600 disabled:opacity-50" disabled>Siguiente</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Modals Rendered Here --- */}

            <TechniquesModal
                isOpen={isTechniquesModalOpen}
                onClose={() => setIsTechniquesModalOpen(false)}
                selectedTechnique={selectedTechnique}
                setSelectedTechnique={setSelectedTechnique}
                techniquesData={techniquesData}
            />

            <SoundsModal
                isOpen={isSoundsModalOpen}
                onClose={() => setIsSoundsModalOpen(false)}
                selectedSound={selectedSound}
                setSelectedSound={setSelectedSound}
                volume={volume}
                setVolume={setVolume}
                soundsData={soundsData}
            />

            <GoalsModal
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                goals={goals}
                setGoals={setGoals}
            />
        </div>
    );
};

export default ConcentrationApp;
