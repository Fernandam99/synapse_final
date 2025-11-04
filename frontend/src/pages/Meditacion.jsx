import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Droplet, Star } from 'lucide-react';
import meditacionService from '../services/meditacion';

export default function Meditacion() {
    const [duracion, setDuracion] = useState(10); // minutos
    const [tipo, setTipo] = useState('mindfulness');
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

    // Datos ficticios para estadísticas (reemplazarás con API si existe)
    const stats = {
        weekMinutes: 0,
        completedSessions: 0,
        streak: 0,
        effectiveness: 0
    };

    const handleIniciar = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMensaje('');

        try {
            await meditacionService.iniciarMeditacion({
                duracion: duracion,
                tipo_meditacion: tipo
            });
            setMensaje('Sesión de meditación registrada exitosamente.');
        } catch (err) {
            console.error('Error al iniciar meditación:', err);
            setError('Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">🧘 Meditación</h1>
            <p className="text-gray-600 mb-6">Registra tus sesiones de meditación para mejorar tu bienestar mental.</p>

            {/* Estadísticas (ficticias por ahora) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <Clock className="text-purple-500 mb-2" />
                    <div className="text-xl font-bold">{stats.weekMinutes} min</div>
                    <div className="text-sm text-gray-500">Esta semana</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <Calendar className="text-pink-500 mb-2" />
                    <div className="text-xl font-bold">{stats.completedSessions}</div>
                    <div className="text-sm text-gray-500">Sesiones</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <Droplet className="text-blue-500 mb-2" />
                    <div className="text-xl font-bold">{stats.streak}</div>
                    <div className="text-sm text-gray-500">Días seguidos</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <Star className="text-yellow-500 mb-2" />
                    <div className="text-xl font-bold">{stats.effectiveness}%</div>
                    <div className="text-sm text-gray-500">Efectividad</div>
                </div>
            </div>

            {/* Formulario para iniciar sesión */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Iniciar nueva sesión</h2>
                <form onSubmit={handleIniciar}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={duracion}
                            onChange={(e) => setDuracion(Number(e.target.value))}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Tipo de meditación</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="mindfulness">Mindfulness</option>
                            <option value="respiracion">Respiración</option>
                            <option value="body_scan">Body Scan</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        {loading ? 'Registrando...' : 'Registrar Sesión'}
                    </button>
                </form>
                {mensaje && <div className="mt-3 text-green-600">{mensaje}</div>}
                {error && <div className="mt-3 text-red-600">{error}</div>}
            </div>

            {/* Historial (vacío por ahora) */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Historial de sesiones</h2>
                <p className="text-gray-500">Próximamente: historial de tus sesiones de meditación.</p>
            </div>
        </div>
    );
}