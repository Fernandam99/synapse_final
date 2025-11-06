import React, { useState } from 'react';
import { X } from 'lucide-react';
import useSound from 'use-sound'

const SoundsModal = ({ isOpen, onClose, onApply, currentSound = 'silence', currentVolume = 75 }) => {

  const [selectedSound, setSelectedSound] = useState(currentSound);
  const [volume, setVolume] = useState(currentVolume);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedSound(currentSound);
      setVolume(currentVolume);
    }
  }, [isOpen, currentSound, currentVolume]);

  const sounds = [
    { id: 'silence', name: 'Silencio', icon: '🔇' },
    { id: 'rain', name: 'Lluvia', icon: '🌧️' },
    { id: 'forest', name: 'Bosque', icon: '🌲' },
    { id: 'ocean', name: 'Océano', icon: '🌊' },
    { id: 'cafe', name: 'Cafetería', icon: '☕' },
    { id: 'fireplace', name: 'Chimenea', icon: '🔥' },
    { id: 'wind', name: 'Viento', icon: '💨' },
    { id: 'birds', name: 'Pájaros', icon: '🐦' }
  ];

  const handleApply = () => {
    if (onApply) {
      onApply({ sound: selectedSound, volume: parseInt(volume) });
    }
    onClose();
  };

  // Quick preview using WebAudio (short beep or pair of beeps) mapped by sound id
  function previewSound(id) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const g = ctx.createGain();
      g.gain.value = Math.max(0.02, Math.min(0.6, volume / 100));
      g.connect(ctx.destination);
      const o = ctx.createOscillator();
      o.type = 'sine';
      const map = { rain: 420, forest: 480, ocean: 380, cafe: 520, fireplace: 300, wind: 360, birds: 680, silence: 520 };
      o.frequency.value = map[id] || 520;
      o.connect(g);
      o.start();
      setTimeout(() => { try { o.stop(); g.disconnect(); ctx.close(); } catch (e) {} }, 250);
    } catch (e) {
      // ignore preview errors
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Sonidos de Concentración</h2>
            <p className="modal-subtitle">Selecciona un ambiente que te ayude a concentrarte</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="sounds-grid">
            {sounds.map((sound) => (
              <div
                key={sound.id}
                className={`sound-card ${selectedSound === sound.id ? 'selected' : ''}`}
                onClick={() => { setSelectedSound(sound.id); previewSound(sound.id); }}
              >
                <div className="sound-icon">{sound.icon}</div>
                <p className="sound-name">{sound.name}</p>
              </div>
            ))}
          </div>
          <div className="volume-control">
            <div className="volume-label">
              <span className="volume-label-text">Volumen:</span>
              <span className="volume-value">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="volume-slider"
              style={{
                background: `linear-gradient(90deg, #a855f7 0%, #ec4899 ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`
              }}
            />
          </div>
          <button className="modal-button" onClick={handleApply}>
            Aplicar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundsModal;
