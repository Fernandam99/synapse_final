import React, { useState } from 'react';
import { X } from 'lucide-react';

const TechniqueModal = ({ isOpen, onClose, onSelect }) => {
  const [selectedTechnique, setSelectedTechnique] = useState('pomodoro');

  const techniques = [
    {
      id: 'pomodoro',
      name: 'Pomodoro Clásico',
      description: 'La técnica más popular para mantener tu concentración',
      icon: '🍅',
      color: 'purple',
      tags: [
        { text: 'Recomendado', color: 'green' },
        { text: 'Tareas generales', color: 'blue' }
      ],
      details: {
        work: '25min',
        shortBreak: '5min',
        longBreak: '15min',
        cycles: '4'
      },
      benefits: [
        'Mejora la fatiga mental',
        'Aumenta responsabilidad',
        'Mejora planificación'
      ]
    },
    {
      id: 'extended',
      name: 'Pomodoro Extendido',
      description: 'Para trabajo profundo que requiere más tiempo de concentración',
      icon: '⏰',
      color: 'blue',
      tags: [
        { text: 'Intermedio', color: 'blue' },
        { text: 'Trabajos complejos', color: 'purple' }
      ],
      details: {
        work: '45min',
        shortBreak: '15min',
        longBreak: '30min',
        cycles: '3'
      },
      benefits: [
        'Trabajo profundo',
        'Menos interrupciones',
        'Mayor inmersión'
      ]
    },
    {
      id: '52-17',
      name: 'Técnica 52-17',
      description: 'Basada en estudios de alta productividad de atletas',
      icon: '⚡',
      color: 'red',
      tags: [
        { text: 'Avanzado', color: 'orange' },
        { text: 'Alto rendimiento', color: 'purple' }
      ],
      details: {
        work: '52min',
        shortBreak: '17min',
        longBreak: '30min',
        cycles: '3'
      },
      benefits: [
        'Máximo rendimiento',
        'Descanso efectivo',
        'Menos agotamiento'
      ]
    },
    {
      id: '90-20',
      name: 'Técnica 90-20',
      description: 'Para proyectos que requieren concentración profunda',
      icon: '🎯',
      color: 'purple',
      tags: [
        { text: 'Experto', color: 'orange' },
        { text: 'Proyectos largos', color: 'blue' }
      ],
      details: {
        work: '90min',
        shortBreak: '20min',
        longBreak: '45min',
        cycles: '2'
      },
      benefits: [
        'Concentración extrema',
        'Flujo profundo',
        'Resultados máximos'
      ]
    },
    {
      id: 'micro',
      name: 'Micro Pomodoros',
      description: 'Ideal para personas con TDAH o dificultades de concentración',
      icon: '⚡',
      color: 'orange',
      tags: [
        { text: 'TDAH recomendado', color: 'green' },
        { text: 'Menos estructurado', color: 'blue' }
      ],
      details: {
        work: '15min',
        shortBreak: '5min',
        longBreak: '15min',
        cycles: '6'
      },
      benefits: [
        'Fácil de empezar',
        'Menos abrumador',
        'Mayor flexibilidad'
      ]
    },
    {
      id: 'timeboxing',
      name: 'Timeboxing Flexible',
      description: 'Combina estructuras de tiempo flexible para diferentes tipos de trabajo',
      icon: '🔄',
      color: 'pink',
      tags: [
        { text: 'Intermedio', color: 'blue' },
        { text: 'Trabajos variados', color: 'purple' }
      ],
      details: {
        work: '30min',
        shortBreak: '10min',
        longBreak: '25min',
        cycles: '4'
      },
      benefits: [
        'Adaptabilidad',
        'Equilibrio',
        'Gestión flexible'
      ]
    }
  ];

  const handleSelect = () => {
    const selected = techniques.find(t => t.id === selectedTechnique);
    if (onSelect) {
      onSelect(selected);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container techniques-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Seleccionar Técnica de Concentración</h2>
            <p className="modal-subtitle">Elige la técnica que mejor se adapte a tu estilo de trabajo</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="techniques-grid">
            {techniques.map((technique) => (
              <div
                key={technique.id}
                className={`technique-card ${selectedTechnique === technique.id ? 'selected' : ''}`}
                onClick={() => setSelectedTechnique(technique.id)}
              >
                <div className="technique-header">
                  <div className={`technique-icon ${technique.color}`}>
                    {technique.icon}
                  </div>
                  <div className="technique-info">
                    <h3 className="technique-name">{technique.name}</h3>
                    <p className="technique-description">{technique.description}</p>
                    <div className="technique-tags">
                      {technique.tags.map((tag, idx) => (
                        <span key={idx} className={`technique-tag ${tag.color}`}>
                          {tag.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="technique-details">
                  <div className="technique-detail">
                    <div className="technique-detail-value">{technique.details.work}</div>
                    <div className="technique-detail-label">Duración sprint</div>
                  </div>
                  <div className="technique-detail">
                    <div className="technique-detail-value">{technique.details.shortBreak}</div>
                    <div className="technique-detail-label">Descanso corto</div>
                  </div>
                  <div className="technique-detail">
                    <div className="technique-detail-value">{technique.details.longBreak}</div>
                    <div className="technique-detail-label">Descanso largo</div>
                  </div>
                  <div className="technique-detail">
                    <div className="technique-detail-value">{technique.details.cycles}</div>
                    <div className="technique-detail-label">Ciclos</div>
                  </div>
                </div>
                <div className="technique-benefits">
                  <h4 className="technique-benefits-title">Beneficios:</h4>
                  <ul className="technique-benefits-list">
                    {technique.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <aside className="technique-summary">
            <h3 style={{marginTop:0, marginBottom:8}}>{techniques.find(t=>t.id===selectedTechnique)?.name || 'Selecciona una técnica'}</h3>
            <p style={{color:'#6b7280', marginBottom:12}}>{techniques.find(t=>t.id===selectedTechnique)?.description}</p>

            <div style={{marginBottom:12}}>
              <strong>Detalles</strong>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <div style={{background:'#f3e8ff',padding:'8px 12px',borderRadius:8}}> {techniques.find(t=>t.id===selectedTechnique)?.details.work} </div>
                <div style={{background:'#dbeafe',padding:'8px 12px',borderRadius:8}}> {techniques.find(t=>t.id===selectedTechnique)?.details.shortBreak} </div>
                <div style={{background:'#fef3c7',padding:'8px 12px',borderRadius:8}}> {techniques.find(t=>t.id===selectedTechnique)?.details.longBreak} </div>
                <div style={{background:'#fce7f3',padding:'8px 12px',borderRadius:8}}> {techniques.find(t=>t.id===selectedTechnique)?.details.cycles} ciclos </div>
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <strong>Beneficios</strong>
              <ul style={{marginTop:8, color:'#374151'}}>
                {techniques.find(t=>t.id===selectedTechnique)?.benefits.map((b, i)=>(<li key={i}>{b}</li>))}
              </ul>
            </div>

            <button className="modal-button" onClick={handleSelect}>
              Seleccionar Técnica
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TechniqueModal;

