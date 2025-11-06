import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Star, Play, RotateCcw, TrendingUp, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './styles/Concentracion.css';
import api from '../services/api';

const ConcentrationApp = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [timer, setTimer] = useState(1500); // 25 minutos en segundos
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    weekMinutes: 127,
    completedSessions: 23,
    streak: 7,
    effectiveness: 89
  });
  const [progressData, setProgressData] = useState([
    { day: 'Lun', minutes: 75 },
    { day: 'Mar', minutes: 110 },
    { day: 'Mié', minutes: 70 },
    { day: 'Jun', minutes: 95 },
    { day: 'Vie', minutes: 120 },
    { day: 'Sáb', minutes: 85 },
    { day: 'Dom', minutes: 55 }
  ]);
  const [monthlyData, setMonthlyData] = useState([
    { week: 'Sem 1', minutes: 380 },
    { week: 'Sem 2', minutes: 450 },
    { week: 'Sem 3', minutes: 350 },
    { week: 'Sem 4', minutes: 500 }
  ]);

  // Defensive normalization: si por alguna razón `sessions` deja de ser un array
  // (por una respuesta inesperada de la API o por sobrescritura accidental),
  // forzamos a que sea un array vacío y lo registramos para debug.
  useEffect(() => {
    if (!Array.isArray(sessions)) {
      console.warn('ConcentrationApp: `sessions` expected array but got:', sessions);
      setSessions([]);
    }
  }, [sessions]);

  // Fetch data from API
  useEffect(() => {
    fetchStats();
    fetchSessions();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      completeSession();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/sesiones/estadisticas');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sesiones');
      const data = res.data;
      // Normalizar la respuesta: la API puede devolver un array o un objeto con sessions
      if (Array.isArray(data)) {
        setSessions(data);
      } else if (data && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  };

  const startTimer = () => setIsRunning(true);
  const resetTimer = () => {
    setIsRunning(false);
    setTimer(1500);
  };

  const completeSession = async () => {
    setIsRunning(false);
    const sessionData = {
      technique: 'Pomodoro Clásico',
      duration: 25,
      effectiveness: Math.floor(Math.random() * 20) + 80,
      completed: true
    };
    
    try {
      await api.post('/sesiones', sessionData);
      fetchStats();
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  

  return (
    <div className="concentration-app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="header-title">Concentración</h1>
          <p className="header-subtitle">Fortalece tu capacidad de atención con técnicas científicamente probadas</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
            <div className="stat-card">
            <div className="stat-icon purple"><Clock /></div>
            <div className="stat-value">{stats.weekMinutes}min</div>
            <div className="stat-label">Esta semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pink"><Calendar /></div>
            <div className="stat-value">{stats.completedSessions}</div>
            <div className="stat-label">Sesiones completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><Droplet /></div>
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-label">Días consecutivos</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><Star /></div>
            <div className="stat-value">{stats.effectiveness}%</div>
            <div className="stat-label">Efectividad</div>
          </div>
        </div>

        <div className="tabs-container">
            <div className="tabs-header">
            <button className={`tab-button ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Sesión Activa</button>
            <button className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>Mi Progreso</button>
            <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Historial</button>
          </div>

          <div className="tabs-content">
            {activeTab === 'active' && (
              <div className="session-active">
                <h2 className="session-title">Pomodoro Clásico</h2>
                <p className="session-subtitle">Mantén tu concentración durante 25 minutos</p>

                <div className={`timer-circle ${isRunning ? 'active' : ''}`}>
                  <div className="timer-time">{formatTime(timer)}</div>
                  <div className="timer-label">Concentración</div>
                  <div className="timer-session">Sesión 1</div>
                </div>

                <div className="session-stats">
                  <div className="session-stat-item">
                    <div className="session-stat-value">{Array.isArray(sessions) ? sessions.filter(s => s.completed).length : 0}</div>
                    <div className="session-stat-label">Completadas</div>
                  </div>
                  <div className="session-stat-item">
                    <div className="session-stat-value">{Math.floor(stats.weekMinutes/60)}h {stats.weekMinutes%60}m</div>
                    <div className="session-stat-label">Tiempo total</div>
                  </div>
                </div>

                <div className="button-group">
                    <button onClick={startTimer} disabled={isRunning} className="button button-primary"><Play /> Iniciar</button>
                  <button onClick={resetTimer} className="button button-secondary"><RotateCcw /> Reiniciar</button>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <div className="progress-grid">
                  <div className="progress-card purple">
                    <Calendar />
                    <div className="progress-card-value">31</div>
                    <div className="progress-card-label">Días mes</div>
                    <div className="progress-card-change">↑ 72.5% vs mes anterior</div>
                  </div>
                  <div className="progress-card pink">
                    <Clock />
                    <div className="progress-card-value">18.5h</div>
                    <div className="progress-card-label">Tiempo total</div>
                    <div className="progress-card-change">↑ 118% vs mes anterior</div>
                  </div>
                  <div className="progress-card purple">
                    <TrendingUp />
                    <div className="progress-card-value">91%</div>
                    <div className="progress-card-label">Promedio mensual</div>
                    <div className="progress-card-change">↑ 8% vs mes anterior</div>
                  </div>
                </div>

                <div className="chart-container">
                  <h3 className="chart-title">Progreso Semanal</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Line type="monotone" dataKey="minutes" stroke="#9333ea" strokeWidth={3} dot={{ fill: '#9333ea', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="charts-grid">
                  <div>
                    <h3 className="chart-title">Tendencia Mensual</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip />
                        <Bar dataKey="minutes" fill="#ec4899" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="chart-title">Técnicas Más Usadas</h3>
                    <div className="techniques-list">
                      <div className="technique-item">
                        <div className="technique-header">
                          <div className="technique-name">Pomodoro Clásico</div>
                          <div className="technique-percentage">68%</div>
                        </div>
                        <div className="progress-bar-container"><div className="progress-bar purple" style={{width: '68%'}}></div></div>
                      </div>
                      <div className="technique-item">
                        <div className="technique-header">
                          <div className="technique-name">Concentración Profunda</div>
                          <div className="technique-percentage">24%</div>
                        </div>
                        <div className="progress-bar-container"><div className="progress-bar pink" style={{width: '24%'}}></div></div>
                      </div>
                      <div className="technique-item">
                        <div className="technique-header">
                          <div className="technique-name">Sprints Rápidos</div>
                          <div className="technique-percentage">8%</div>
                        </div>
                        <div className="progress-bar-container"><div className="progress-bar light-purple" style={{width: '8%'}}></div></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="insights-card">
                  <div className="insights-content">
                    <div className="insights-icon"><BarChart3 /></div>
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

                <div className="history-table">
                  <table>
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
                      <tr>
                        <td className="history-date">14 ene 2024<br/><span className="history-time">14:15</span></td>
                        <td><span className="badge-blue">Concentración Profunda</span></td>
                        <td>45 min</td>
                        <td><span className="badge-green">Completada</span></td>
                        <td>
                          <div className="effectiveness-bar">
                            <div className="effectiveness-bar-container"><div className="effectiveness-bar-fill" style={{width: '95%'}}></div></div>
                            <div className="effectiveness-value">95%</div>
                          </div>
                        </td>
                        <td>Trabajo muy productivo</td>
                      </tr>
                      {/* Más filas de ejemplo... */}
                    </tbody>
                  </table>
                </div>

                <div className="pagination">
                  <div className="pagination-info">Página 1 de 2</div>
                  <div className="pagination-buttons">
                    <button className="pagination-button">Anterior</button>
                    <button className="pagination-button">Siguiente</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcentrationApp;

