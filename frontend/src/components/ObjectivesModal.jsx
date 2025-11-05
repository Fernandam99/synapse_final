import React, { useState } from 'react';
import { X } from 'lucide-react';

const ObjectivesModal = ({ isOpen, onClose, onSave }) => {
  const [objectives, setObjectives] = useState({
    daily: 120,
    weekly: 640,

  });

  const updateObjective = (type, value) => {
    setObjectives(prev => ({ ...prev, [type]: parseInt(value) }));
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} horas`;
  };

  const handleSave = () => {
    if (onSave) {
      onSave(objectives);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Configurar Objetivos</h2>
            <p className="modal-subtitle">Define tus metas de concentración</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {/* Objetivo Diario */}
          <div className="objective-item">
            <div className="objective-header">
              <span className="objective-label">
                Objetivo diario: {formatTime(objectives.daily)}
              </span>
              <span className="objective-value">{objectives.daily} minutos</span>
            </div>
            <div className="objective-info">
              <span>25 min</span>
              <span>8 horas</span>
            </div>
            <input
              type="range"
              min="25"
              max="480"
              step="5"
              value={objectives.daily}
              onChange={(e) => updateObjective('daily', e.target.value)}
              className="objective-slider daily"
            />
          </div>

          {/* Objetivo Semanal */}
          <div className="objective-item">
            <div className="objective-header">
              <span className="objective-label">
                Objetivo semanal: {formatTime(objectives.weekly)}
              </span>
              <span className="objective-value">{objectives.weekly} minutos</span>
            </div>
            <div className="objective-info">
              <span>3.5 horas</span>
              <span>56 horas</span>
            </div>
            <input
              type="range"
              min="210"
              max="3360"
              step="30"
              value={objectives.weekly}
              onChange={(e) => updateObjective('weekly', e.target.value)}
              className="objective-slider weekly"
            />
          </div>

          {/* Objetivo Mensual */}
          <div className="objective-item">
            <div className="objective-header">
              <span className="objective-label">
                Objetivo mensual: {formatTime(objectives.monthly)}
              </span>
              <span className="objective-value">{objectives.monthly} minutos</span>
            </div>
            <div className="objective-info">
              <span>15 horas</span>
              <span>240 horas</span>
            </div>
            <input
              type="range"
              min="900"
              max="14400"
              step="60"
              value={objectives.monthly}
              onChange={(e) => updateObjective('monthly', e.target.value)}
              className="objective-slider monthly"
            />
          </div>

          <button className="modal-button" onClick={handleSave}>
            Guardar Objetivos
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesModal;
