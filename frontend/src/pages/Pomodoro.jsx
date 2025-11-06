
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Coffee, Flame, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export default function Pomodoro() {
    const { t } = useTranslation();

    // Configuración inicial
    const [config, setConfig] = useState({
        duracion_trabajo: 25,
        duracion_descanso: 5,
        ciclos_objetivo: 4,
        modo_no_distraccion: false
    });

    // Estado de la sesión
    const [estado, setEstado] = useState(null); // null | 'activo' | 'pausado' | 'finalizado'
    const [faseActual, setFaseActual] = useState('trabajo'); // 'trabajo', 'descanso'
    const [tiempoRestante, setTiempoRestante] = useState(config.duracion_trabajo * 60);
    const [ciclosCompletados, setCiclosCompletados] = useState(0);
    const [sessionId, setSessionId] = useState(null);

    // Contador en segundo plano
    useEffect(() => {
        let interval = null;
        if (estado === 'activo' && tiempoRestante > 0) {
            interval = setInterval(() => {
                setTiempoRestante(t => t - 1);
            }, 1000);
        } else if (tiempoRestante === 0 && estado === 'activo') {
            manejarFinFase();
        }
        return () => clearInterval(interval);
    }, [estado, tiempoRestante]);

    const manejarFinFase = async () => {
        if (faseActual === 'trabajo') {
            const nuevosCiclos = ciclosCompletados + 1;
            setCiclosCompletados(nuevosCiclos);
            setFaseActual('descanso');
            setTiempoRestante(config.duracion_descanso * 60);
        } else if (faseActual === 'descanso') {
            if (ciclosCompletados + 1 >= config.ciclos_objetivo) {
                await finalizarSesion(true);
            } else {
                setFaseActual('trabajo');
                setTiempoRestante(config.duracion_trabajo * 60);
            }
        }
    };

    const iniciarSesion = async () => {
        try {
            const payload = {
                duracion_trabajo: config.duracion_trabajo,
                duracion_descanso: config.duracion_descanso,
                ciclos_objetivo: config.ciclos_objetivo,
                modo_no_distraccion: config.modo_no_distraccion
            };
            const res = await api.post(cfg.paths.pomodoroIniciar, payload);
            const data = res.data.pomodoro || res.data;
            const sesionId = data.sesion_id;
            if (!sesionId) throw new Error('No se recibió ID de sesión');
            setSessionId(sesionId);
            setEstado('activo');
            setFaseActual('trabajo');
            setTiempoRestante(config.duracion_trabajo * 60);
            setCiclosCompletados(0);
        } catch (error) {
            console.error('Error al iniciar Pomodoro:', error);
            alert('No se pudo iniciar la sesión. ¿Ya tienes una activa?');
        }
    };

    const finalizarSesion = async (completada = false) => {
        if (!sessionId) return;
        try {
            await api.post(cfg.paths.pomodoroFinalizar, {
                completado_totalmente: completada
            });
            setEstado('finalizado');
            setSessionId(null);
        } catch (error) {
            console.error('Error al finalizar Pomodoro:', error);
            alert(error.response?.data?.error || 'Error al finalizar la sesión');
        }
    };

    const reiniciar = () => {
        setEstado(null);
        setFaseActual('trabajo');
        setTiempoRestante(config.duracion_trabajo * 60);
        setCiclosCompletados(0);
        setSessionId(null);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const isTrabajo = faseActual === 'trabajo';
    const porcentajeProgreso = ((config.ciclos_objetivo - ciclosCompletados) / config.ciclos_objetivo) * 100;

    return (
        <div className="pomodoro-app">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">{t('pomodoro')}</h1>
                    <p className="header-subtitle">{t('tech_pomodoro.desc')}</p>
                </div>

                <div className="stats-row">
                    <div className="stat-item">
                        <Flame size={18} />
                        <span>Ciclos: {ciclosCompletados} / {config.ciclos_objetivo}</span>
                    </div>
                    <div className="stat-item">
                        <Settings size={18} />
                        <span>{config.modo_no_distraccion ? 'Modo sin distracciones ON' : 'Modo normal'}</span>
                    </div>
                </div>

                <div className="timer-display">
                    <div className={`timer-circle ${isTrabajo ? 'work' : 'break'}`}>
                        <div className="timer-time">{formatTime(tiempoRestante)}</div>
                        <div className="timer-label">
                            {isTrabajo ? t('work_phase') : t('break_phase')}
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${100 - ((ciclosCompletados / config.ciclos_objetivo) * 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="controls">
                    {estado === null && (
                        <div className="config-form">
                            <div className="form-row">
                                <label>{t('work_duration')} (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={config.duracion_trabajo}
                                    onChange={e => setConfig(c => ({ ...c, duracion_trabajo: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-row">
                                <label>{t('break_duration')} (min)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={config.duracion_descanso}
                                    onChange={e => setConfig(c => ({ ...c, duracion_descanso: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-row">
                                <label>{t('cycles')} (1–12)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={config.ciclos_objetivo}
                                    onChange={e => setConfig(c => ({ ...c, ciclos_objetivo: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="form-row checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={config.modo_no_distraccion}
                                        onChange={e => setConfig(c => ({ ...c, modo_no_distraccion: e.target.checked }))}
                                    />
                                    {t('focus_mode')}
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        {estado === null ? (
                            <button className="button button-primary" onClick={iniciarSesion}>
                                <Play /> {t('start')}
                            </button>
                        ) : estado === 'activo' || estado === 'pausado' ? (
                            <>
                                <button className="button button-secondary" onClick={() => finalizarSesion(false)}>
                                    {t('finish_early')}
                                </button>
                                <button className="button button-primary" onClick={reiniciar}>
                                    <RotateCcw /> {t('reset')}
                                </button>
                            </>
                        ) : estado === 'finalizado' ? (
                            <button className="button button-secondary" onClick={reiniciar}>
                                {t('new_session')}
                            </button>
                        ) : null}
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar, Clock, Droplet, Star, Play, RotateCcw, TrendingUp, BarChart3,
    X, CheckCircle, CloudRain, Speaker, Waves, Drum, Zap, Leaf, Wind, Target, Heart,
    Minus, Plus
} from 'lucide-react';
import useSound from 'use-sound'
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

// soundsData removed — modales de sonido eliminados

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


// --- Sub-Components: Modals (externalized to separate files) ---
import TechniqueModal from '../components/TechniqueModal';
import SoundsModal from '../components/SoundsModal';
import ObjectivesModal from '../components/ObjectivesModal';
import './styles/ConcentrationModals.css';


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
    // If the modal returns a full technique object, store it here
    const [selectedTechniqueObj, setSelectedTechniqueObj] = useState(null);
    const [selectedSound, setSelectedSound] = useState('silence');
    const [volume, setVolume] = useState(75);
    const [goals, setGoals] = useState({
        dailyGoal: 150,
        weeklyGoal: 800,
        monthlyGoal: 3000
    });

    const currentTechnique = useMemo(() => {
        if (selectedTechniqueObj) return selectedTechniqueObj;
        return techniquesData.find(t => t.name === selectedTechnique) || techniquesData[0];
    }, [selectedTechnique, selectedTechniqueObj]);

    // Work minutes for display in header (support legacy `duration` or `details.work`)
    const workMinutes = useMemo(() => {
        try {
            if (currentTechnique.duration) {
                const parts = (currentTechnique.duration || '').split('/');
                const m = parseInt(parts[0], 10);
                if (!isNaN(m) && m > 0) return m;
            }
            if (currentTechnique.details && currentTechnique.details.work) {
                const numeric = String(currentTechnique.details.work).replace(/\D/g, '');
                const m = parseInt(numeric, 10);
                if (!isNaN(m) && m > 0) return m;
            }
        } catch (e) {
            // fallthrough
        }
        return 25;
    }, [currentTechnique]);

    // Audio / WebAudio refs for ambient and notifications
    const audioCtxRef = React.useRef(null);
    const ambientSourceRef = React.useRef(null);
    const ambientGainRef = React.useRef(null);

    const soundDisplayNames = {
        silence: 'Silencio',
        rain: 'Lluvia',
        forest: 'Bosque',
        ocean: 'Océano',
        cafe: 'Cafetería',
        fireplace: 'Chimenea',
        wind: 'Viento',
        birds: 'Pájaros'
    };

    // Initialize AudioContext lazily
    function ensureAudioContext() {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        return audioCtxRef.current;
    }

    // Create looping noise buffer (white noise) filtered to approximate ambient sounds
    function createAmbientLoop(soundId, vol = 0.6) {
        const ctx = ensureAudioContext();

        // Stop any previous ambient
        stopAmbient();

        // Create noise buffer
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Apply filter to shape the noise depending on soundId
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';

        // Default filter settings per sound type
        switch (soundId) {
            case 'rain': filter.frequency.value = 6000; filter.Q.value = 0.8; break;
            case 'forest': filter.frequency.value = 3500; filter.Q.value = 0.8; break;
            case 'ocean': filter.frequency.value = 3000; filter.Q.value = 0.6; break;
            case 'cafe': filter.frequency.value = 4000; filter.Q.value = 1.2; break;
            case 'fireplace': filter.frequency.value = 2000; filter.Q.value = 0.6; break;
            case 'wind': filter.frequency.value = 2500; filter.Q.value = 0.5; break;
            case 'birds': filter.frequency.value = 5000; filter.Q.value = 0.9; break;
            default: filter.frequency.value = 8000; filter.Q.value = 0.7; break;
        }

        const gain = ctx.createGain();
        gain.gain.value = Math.max(0, Math.min(1, vol));

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        // store refs
        ambientSourceRef.current = source;
        ambientGainRef.current = gain;

        return source;
    }

    function startAmbient(soundId, vol = 0.6) {
        if (!soundId || soundId === 'silence') return;
        const ctx = ensureAudioContext();
        try { ctx.resume(); } catch (e) {}
        const src = createAmbientLoop(soundId, vol);
        // small delay to avoid click
        src.start(0);
    }

    function stopAmbient() {
        try {
            if (ambientSourceRef.current) {
                try { ambientSourceRef.current.stop(); } catch (e) {}
                ambientSourceRef.current.disconnect?.();
                ambientSourceRef.current = null;
            }
            if (ambientGainRef.current) {
                ambientGainRef.current.disconnect?.();
                ambientGainRef.current = null;
            }
        } catch (e) {
            // ignore
        }
    }

    // Play simple notification beep sequence (start / end)
    function playNotification(kind = 'start', vol = 0.8) {
        const ctx = ensureAudioContext();
        try { ctx.resume(); } catch (e) {}

        const g = ctx.createGain();
        g.gain.value = vol;
        g.connect(ctx.destination);

        function beep(freq, duration, when = 0) {
            const o = ctx.createOscillator();
            o.type = 'sine';
            o.frequency.value = freq;
            o.connect(g);
            o.start(ctx.currentTime + when);
            o.stop(ctx.currentTime + when + duration);
        }

        if (kind === 'start') {
            // two short beeps up
            beep(440, 0.12, 0);
            beep(660, 0.12, 0.14);
        } else if (kind === 'end') {
            // descending confirmation
            beep(660, 0.14, 0);
            beep(440, 0.18, 0.16);
        } else {
            beep(520, 0.12, 0);
        }

        // disconnect gain after a short timeout
        setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 1000);
    }

    // Sync ambient playback with isRunning and selectedSound/volume
    useEffect(() => {
        if (isRunning) {
            // start ambient if selected
            startAmbient(selectedSound, volume / 100);
        } else {
            // stop ambient when paused/stopped
            stopAmbient();
        }
        // cleanup on unmount
        return () => { stopAmbient(); };
    }, [isRunning, selectedSound]);

    // Adjust ambient volume when volume changes
    useEffect(() => {
        if (ambientGainRef.current) {
            ambientGainRef.current.gain.value = volume / 100;
        }
    }, [volume]);

    // When the current technique changes, update the timer to match the technique's concentration duration
    useEffect(() => {
        try {
            // Two possible shapes for technique data:
            // 1) legacy techniquesData uses a 'duration' string like '25/5/15' (work/short/long)
            // 2) modal technique objects use a 'details' object with 'work' like '52min'
            let mins = null;

            if (currentTechnique.duration) {
                const parts = (currentTechnique.duration || '').split('/');
                mins = parseInt(parts[0], 10);
            } else if (currentTechnique.details && currentTechnique.details.work) {
                // remove non-digit characters (e.g., '52min')
                const numeric = String(currentTechnique.details.work).replace(/\D/g, '');
                mins = parseInt(numeric, 10);
            }

            if (isNaN(mins) || mins <= 0) mins = 25; // fallback sensible default

            // Stop running session when technique changes so user can confirm/start
            if (isRunning) setIsRunning(false);

            setTimer(mins * 60);
        } catch (err) {
            setIsRunning(false);
            setTimer(25 * 60);
        }
    }, [currentTechnique]);

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
            try { playNotification('end', Math.max(0.05, Math.min(1, volume / 100))); } catch (e) {}
            alert('¡Tiempo de concentración terminado!'); // Use alert() as a simple placeholder for completion notification
            setTimer(1500); // Reset for next cycle
        }
        return () => clearInterval(interval);
    }, [isRunning, timer]);

    // Handlers
    const startTimer = () => {
        try { playNotification('start', Math.max(0.05, Math.min(1, volume / 100))); } catch (e) {}
        setIsRunning(true);
    };
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
        // Support both legacy `duration` (like '25/5/15') and modal `details` ({ work, shortBreak, longBreak })
        let parts = [];
        let cycles = currentTechnique.cycles ?? (currentTechnique.details && currentTechnique.details.cycles) ?? '-';

        if (currentTechnique.duration) {
            parts = currentTechnique.duration.split('/');
        } else if (currentTechnique.details) {
            parts = [
                String(currentTechnique.details.work).replace(/\D/g, ''),
                String(currentTechnique.details.shortBreak).replace(/\D/g, ''),
                String(currentTechnique.details.longBreak).replace(/\D/g, '')
            ];
        }

        const labels = ['Duración del sprint', 'Descanso corto', 'Descanso largo'];
        const colors = ['bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-yellow-100 text-yellow-700'];

        return (
            <div className="tech-details-grid">
                {parts.map((time, index) => (
                    <div key={index} className={`detail-card ${colors[index]}`}>
                        <div className="detail-value">{time}{time !== 'X' && 'min'}</div>
                        <div className="detail-label">{labels[index]}</div>
                    </div>
                ))}
                <div className="detail-card" style={{background:'#fff7fb'}}>
                    <div className="detail-value">{cycles}</div>
                    <div className="detail-label">Ciclos</div>
                </div>
            </div>
        );
    };

    const renderTechniqueBenefits = () => (
        <div className="benefits">
            <div className="benefits-container">
                {currentTechnique.benefits?.map((benefit, index) => (
                    <div key={index} className="benefit-card">
                        <div className="benefit-icon"><CheckCircle size={14} /></div>
                        <div className="benefit-text">{benefit}</div>
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
                .session-header { margin-bottom: 1rem; display: flex; justify-content: center; }
                .session-badge { background-color: #f3e8ff; color: #9333ea; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
                .session-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin-top: 0.5rem; text-align: center; }
                .session-subtitle { color: var(--muted); margin-bottom: 1.5rem; text-align: center; max-width: 760px; margin-left: auto; margin-right: auto; }
                .session-note { color: var(--accent-1); font-weight: 600; margin-top: 0.25rem; margin-bottom: 1rem; font-size: 0.9rem; text-align: center; display: block; width: 100%; max-width: 760px; margin-left: auto; margin-right: auto; }
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

                /* Feature Pills - estilo tipo cápsula con borde coloreado y botón gradient a la derecha */
                .feature-pills { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; }
                .feature-pills-center { display:flex; gap:0.75rem; align-items:center; }
                .pill {
                    padding: 0.45rem 1.2rem; border-radius: 9999px; background: #ffffff; color: #374151; font-size: 0.95rem; font-weight: 700;
                    cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease; display:inline-flex; align-items:center; gap:0.5rem; border:1px solid transparent;
                    box-shadow: 0 6px 14px rgba(99,102,241,0.06);
                }
                .pill:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(16,24,40,0.08); }

                /* Colored borders for each pill */
                .pill.purple { border-color: rgba(147,51,234,0.18); color: #6b21a8; }
                .pill.blue { border-color: rgba(59,130,246,0.18); color: #075985; }
                .pill.green { border-color: rgba(16,185,129,0.12); color: #057a55; }

                /* Start / Pause gradient pill on the right */
                .start-wrapper { display:flex; align-items:center; }
                .pill.pill-gradient { background: linear-gradient(135deg, #9333ea, #ec4899); color: white; border: none; box-shadow: 0 8px 18px rgba(147,51,234,0.28); padding: 0.5rem 1.5rem; }
                .pill.pill-gradient:hover { transform: translateY(-2px) scale(1.02); }

                /* Tech Details */
                .tech-details h4 { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }
                /* Benefits and Details layout */
                .benefits-container { display:flex; gap:12px; justify-content:center; align-items:flex-start; flex-wrap:wrap; margin-top:12px; }
                .benefit-card { background: #fff; border-radius: 10px; padding: 12px 16px; min-width: 220px; box-shadow: 0 6px 14px rgba(147,51,234,0.06); border:1px solid rgba(147,51,234,0.06); display:flex; align-items:center; gap:10px; }
                .benefit-icon { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#f3e8ff,#fce7f3); display:flex; align-items:center; justify-content:center; color:#9333ea; font-weight:700; }
                .benefit-text { color:#374151; font-weight:600; }

                .tech-details-grid { display:grid; grid-template-columns: repeat(2,1fr); gap:12px; margin-top:12px; }
                @media (min-width: 768px) { .tech-details-grid { grid-template-columns: repeat(4,1fr); } }
                .detail-card { background: #fff; border-radius: 10px; padding: 18px; text-align:center; box-shadow: 0 6px 14px rgba(0,0,0,0.04); border:1px solid #f3e4f7; }
                .detail-value { font-weight:800; font-size:1.25rem; color:var(--text-primary); }
                .detail-label { color:var(--muted); font-size:0.85rem; margin-top:6px; }

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
                                                <p className="session-note">Mantén tu concentración durante {workMinutes} minutos</p>

                                <div className="timer-area">
                                    <div className={`timer-circle ${isRunning ? 'active' : ''}`}>
                                        <div className="timer-time">{formatTime(timer)}</div>
                                        <div className="timer-label"> Concentración</div>
                                        <div className="timer-session">Ciclo 1 de {currentTechnique.cycles ?? (currentTechnique.details && currentTechnique.details.cycles)}</div>
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
                                    <div className="feature-pills-center">
                                        <div onClick={() => setIsTechniquesModalOpen(true)} className="pill purple">
                                            🎯 Técnicas
                                        </div>
                                        <div onClick={() => setIsSoundsModalOpen(true)} className="pill blue">
                                            🎧 Sonidos <span style={{opacity:0.85, fontWeight:600}}>({soundDisplayNames[selectedSound] || selectedSound})</span>
                                        </div>
                                        <div onClick={() => setIsGoalsModalOpen(true)} className="pill green">
                                            🏆 Objetivos
                                        </div>
                                    </div>
                                    <div className="start-wrapper">
                                        <div onClick={() => isRunning ? setIsRunning(false) : startTimer()} className={`pill pill-gradient`}>
                                            {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits Section */}
                                <div className="space-y-6">
                                    {renderTechniqueBenefits()}

                                    {/* Tech Details */}
                                    <div className="tech-details">
                                        <h4> Configuración de Ciclo</h4>
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


            <style jsx>{`
        .pomodoro-app { padding: 24px; }
        .header-title { font-size: 28px; margin-bottom: 8px; }
        .header-subtitle { color: #666; }
        .stats-row {
          display: flex;
          gap: 24px;
          margin: 20px 0;
          font-size: 14px;
          color: #555;
        }
        .stat-item { display: flex; align-items: center; gap: 6px; }
        .timer-display { text-align: center; margin: 32px 0; }
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
        .timer-time { font-size: 56px; font-weight: 700; color: #111; }
        .timer-label { font-size: 18px; margin-top: 8px; color: #555; }
        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          max-width: 300px;
          margin: 0 auto;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .controls { margin-top: 32px; }
        .config-form {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: grid;
          gap: 16px;
        }
        .form-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-row.checkbox {
          flex-direction: row;
          align-items: center;
        }
        .form-row input[type="number"] {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          width: 100%;
          max-width: 120px;
        }
        .button-group {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
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
        @media (max-width: 600px) {
          .timer-circle { width: 220px; height: 220px; }
          .timer-time { font-size: 44px; }
          .stats-row { flex-direction: column; gap: 10px; }
        }
      `}</style>
        </div>
    );
}
            {/* --- Modals Rendered Here --- */}

            <TechniqueModal
                isOpen={isTechniquesModalOpen}
                onClose={() => setIsTechniquesModalOpen(false)}
                onSelect={(selected) => {
                    // If the modal passes the full technique object, store it so currentTechnique uses it
                    if (selected && typeof selected === 'object') {
                        setSelectedTechniqueObj(selected);
                        // Also set the legacy name field for compatibility
                        if (selected.name) setSelectedTechnique(selected.name);
                    } else if (typeof selected === 'string') {
                        setSelectedTechnique(selected);
                        setSelectedTechniqueObj(null);
                    }
                }}
            />

            <SoundsModal
                isOpen={isSoundsModalOpen}
                onClose={() => setIsSoundsModalOpen(false)}
                onApply={({ sound, volume: v }) => {
                    if (sound) setSelectedSound(sound);
                    if (typeof v !== 'undefined') setVolume(v);
                }}
                currentSound={selectedSound}
                currentVolume={volume}
            />

            <ObjectivesModal
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                onSave={(newGoals) => {
                    setGoals(prev => ({
                        dailyGoal: newGoals.daily ?? prev.dailyGoal,
                        weeklyGoal: newGoals.weekly ?? prev.weeklyGoal,
                        monthlyGoal: newGoals.monthly ?? prev.monthlyGoal
                    }));
                }}
            />
        </div>
    );
};

export default ConcentrationApp;

