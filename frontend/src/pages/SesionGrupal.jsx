import React, { useState } from 'react';
import { Users, Video, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SesionGrupal() {
    const { t } = useTranslation();
    const [salas, setSalas] = useState([
        { id: '1', nombre: 'Sesión de Productividad', participantes: 6, creador: 'Johan' },
        { id: '2', nombre: 'Mindfulness Colectivo', participantes: 3, creador: 'Mafe' }
    ]);
    const [nombreSala, setNombreSala] = useState('');

    const crearSala = () => {
        if (!nombreSala.trim()) return;
        setSalas([...salas, {
            id: (salas.length + 1).toString(),
            nombre: nombreSala,
            participantes: 1,
            creador: 'Tú'
        }]);
        setNombreSala('');
    };

    return (
        <div className="concentration-app">
            <div className="container">
                <div className="header">
                    <h1 className="header-title">{t('group_session')}</h1>
                    <p className="header-subtitle">Únete o crea una sesión grupal en tiempo real</p>
                </div>

                <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3>Crear nueva sala</h3>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={nombreSala}
                            onChange={e => setNombreSala(e.target.value)}
                            placeholder="Nombre de la sala"
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <button onClick={crearSala} className="button button-primary">Crear</button>
                    </div>
                </div>

                <div className="card">
                    <h3>Salas disponibles ({salas.length})</h3>
                    <div style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
                        {salas.map(sala => (
                            <div key={sala.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div>
                                    <h4>{sala.nombre}</h4>
                                    <p style={{ color: '#666', fontSize: '14px' }}>Creada por {sala.creador} • {sala.participantes} participantes</p>
                                </div>
                                <button className="button button-secondary" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <Video size={16} /> Unirse
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}