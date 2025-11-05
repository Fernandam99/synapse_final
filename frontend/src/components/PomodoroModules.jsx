import React from 'react';
import { X, CheckCircle, Speaker, CloudRain, Waves, Drum, Zap, Leaf, Wind } from 'lucide-react';

// Small generic modal wrapper reused by the Pomodoro modals
export const ModalWrapper = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className={`bg-white rounded-xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto w-full transition-all duration-300 transform scale-100 ${className}`}>
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Techniques Modal (expects techniquesData prop)
export const TechniquesModal = ({ isOpen, onClose, selectedTechnique, setSelectedTechnique, techniquesData = [] }) => {
  const handleSelectTechnique = (name) => setSelectedTechnique(name);

  const getTechniqueClass = (name) => (name === selectedTechnique ? 'border-purple-600 ring-4 ring-purple-100 shadow-lg' : 'border-gray-200 hover:border-purple-300');

  const getBadgeClass = (type) => {
    switch (type) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIconColor = (index) => {
    const colors = ['bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500', 'bg-blue-500', 'bg-amber-500'];
    return colors[index % colors.length];
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Seleccionar Técnica de Concentración" className="max-w-4xl technique-modal">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniquesData.map((tech, index) => (
          <div
            key={tech.name}
            className={`p-5 rounded-xl border-2 cursor-pointer transition ${getTechniqueClass(tech.name)} flex flex-col`}
            onClick={() => handleSelectTechnique(tech.name)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${getIconColor(index)}`}></span>
                {tech.name}
              </h3>
              {tech.name === selectedTechnique && <CheckCircle size={20} className="text-emerald-500 absolute top-4 right-4" />}
            </div>

            <p className="text-sm text-gray-500 mb-3 min-h-[40px]">{tech.description}</p>

            <div className="flex gap-2 mb-4">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgeClass(tech.type)}`}>{tech.type}</span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                {tech.duration && tech.duration.includes('/') ? 'Ciclos de Enfoque' : 'Personalizada'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {(tech.duration || 'X').toString().split('/').map((time, i) => (
                <div key={i} className={`p-2 rounded-lg text-center ${i === 0 ? 'bg-purple-50' : i === 1 ? 'bg-green-50' : i === 2 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                  <span className="block font-extrabold text-lg text-gray-900">{time}</span>
                  <span className="block text-xs text-gray-500 uppercase">{i === 0 ? 'Enfoque' : i === 1 ? 'Descanso Corto' : i === 2 ? 'Descanso Largo' : 'Ciclos'}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-3 border-t border-dashed border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Beneficios:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {(tech.benefits || []).map((b, i) => <li key={i} className="text-xs">{b}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl text-white font-bold transition duration-200 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-xl shadow-purple-200"
        >
          Guardar y Cerrar
        </button>
      </div>
    </ModalWrapper>
  );
};

// Goals Modal
export const GoalsModal = ({ isOpen, onClose, goals, setGoals }) => {
  const GoalSlider = ({ label, goalKey, unit, min, max, colorClass }) => {
    const value = goals[goalKey];
    const handleChange = (e) => setGoals(prev => ({ ...prev, [goalKey]: parseInt(e.target.value) }));
    const percent = ((value - min) / (max - min)) * 100;
    const sliderStyle = { background: `linear-gradient(to right, ${colorClass} ${percent}%, #e5e7eb ${percent}%)` };

    return (
      <div className="mb-6">
        <label className="text-lg font-bold text-gray-700 flex justify-between items-center mb-2">
          {label}
          <span className="text-xl font-extrabold text-gray-800">{value} {unit}</span>
        </label>
        <input type="range" min={min} max={max} value={value} onChange={handleChange} className={`w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none transition-all duration-100`} style={sliderStyle} />
        <div className="flex justify-between text-xs text-gray-500"><span>{min} {unit}</span><span>{max} {unit}</span></div>
      </div>
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Configurar Objetivos de Enfoque" className="max-w-md goals-modal">
      <p className="text-gray-500 mb-6">Establece metas de tiempo de concentración para motivarte a mejorar.</p>

      <GoalSlider label="Objetivo Diario" goalKey="dailyGoal" unit="min" min={30} max={300} colorClass="#9333ea" />
      <GoalSlider label="Objetivo Semanal" goalKey="weeklyGoal" unit="min" min={200} max={1500} colorClass="#10b981" />
      <GoalSlider label="Objetivo Mensual" goalKey="monthlyGoal" unit="min" min={500} max={5000} colorClass="#6366f1" />

      <div className="mt-6">
        <button onClick={onClose} className="w-full py-3 px-4 rounded-xl text-white font-bold transition duration-200 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-xl shadow-purple-200">Guardar Objetivos</button>
      </div>
    </ModalWrapper>
  );
};

// Sounds Modal (expects soundsData prop)
export const SoundsModal = ({ isOpen, onClose, selectedSound, setSelectedSound, volume, setVolume, soundsData = [] }) => {
  const handleVolumeChange = (e) => setVolume(parseInt(e.target.value, 10));

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Sonidos de Concentración" className="max-w-lg sound-modal">
      <p className="text-gray-500 mb-6">Elige el ambiente sonoro que mejor se adapte a tu enfoque y ajusta el volumen.</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {soundsData.map((sound) => {
          const Icon = sound.icon || Speaker;
          const isSelected = selectedSound === sound.name;
          return (
            <div key={sound.name} onClick={() => setSelectedSound(sound.name)} className={`p-3 rounded-xl border-2 transition text-center cursor-pointer ${isSelected ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-100' : 'border-gray-200 hover:bg-gray-50'}`}>
              <Icon size={28} className={`mx-auto mb-1 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{sound.name}</span>
            </div>
          );
        })}
      </div>

      <div className="volume-section p-4 border rounded-xl bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-base font-semibold text-gray-700 flex items-center"><Speaker size={18} className="mr-2 text-purple-500"/>Volumen del Sonido</h4>
          <span className="text-purple-600 font-extrabold">{volume}%</span>
        </div>
        <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none transition-all duration-200 bg-gray-300" style={{ background: `linear-gradient(to right, #9333ea ${volume}%, #e5e7eb ${volume}%)` }} />
      </div>

      <div className="mt-6">
        <button onClick={onClose} className="w-full py-3 px-4 rounded-xl text-white font-bold transition duration-200 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-xl shadow-purple-200">Guardar y Aplicar</button>
      </div>
    </ModalWrapper>
  );
};
