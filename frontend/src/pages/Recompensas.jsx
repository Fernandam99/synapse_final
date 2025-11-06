// frontend/src/pages/Recompensas.jsx
import React, { useState, useEffect } from 'react';
import { Star, Gift, CheckCircle, Trophy, Box, Award, Crown, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const Recompensas = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('available');
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consuming, setConsuming] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    consumidas: 0,
    puntos: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'available') {
          const res = await api.get('/recompensa/disponibles');
          setRecompensas(Array.isArray(res.data) ? res.data : []);
        } else {
          const res = await api.get('/recompensa/mis-recompensas');
          const data = Array.isArray(res.data) ? res.data : res.data.recompensas || [];
          
          // Calcular estadísticas
          const total = data.length;
          const consumidas = data.filter(r => r.consumida).length;
          const puntos = data.reduce((sum, r) => sum + (r.valor || 0), 0);
          
          setRecompensas(data);
          setStats({ total, consumidas, puntos });
        }
      } catch (err) {
        console.error('Error al cargar recompensas:', err);
        setError(err.response?.data?.error || 'Error al cargar las recompensas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const consumirRecompensa = async (recompensaId) => {
    if (!recompensaId || consuming) return;
    
    setConsuming(recompensaId);
    try {
      await api.patch('/recompensa/otorgar', {
        recompensa_id: recompensaId
      });
      
      // Actualizar datos después de consumir
      if (activeTab === 'owned') {
        fetchData();
      } else {
        setActiveTab('owned');
      }
    } catch (err) {
      console.error('Error al consumir recompensa:', err);
      setError('No se pudo consumir la recompensa');
    } finally {
      setConsuming(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'available') {
        const res = await api.get('/recompensa/disponibles');
        setRecompensas(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await api.get('/recompensa/mis-recompensas');
        const data = Array.isArray(res.data) ? res.data : res.data.recompensas || [];
        
        // Calcular estadísticas
        const total = data.length;
        const consumidas = data.filter(r => r.consumida).length;
        const puntos = data.reduce((sum, r) => sum + (r.valor || 0), 0);
        
        setRecompensas(data);
        setStats({ total, consumidas, puntos });
      }
    } catch (err) {
      console.error('Error al cargar recompensas:', err);
      setError(err.response?.data?.error || 'Error al cargar las recompensas');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'personalizacion':
        return <Box size={20} />;
      case 'tecnica':
        return <Trophy size={20} />;
      case 'puntos':
      default:
        return <Star size={20} />;
    }
  };

  const getColorClass = (valor) => {
    if (valor <= 25) return 'bg-purple-100 text-purple-800';
    if (valor <= 50) return 'bg-blue-100 text-blue-800';
    if (valor <= 75) return 'bg-teal-100 text-teal-800';
    return 'bg-amber-100 text-amber-800';
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('rewards')}</h1>
        <p className="text-gray-500">{t('rewards_subtitle')}</p>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Star className="mr-2" size={16} />
            {t('available')}
          </button>
          <button
            onClick={() => setActiveTab('owned')}
            className={`${
              activeTab === 'owned'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Gift className="mr-2" size={16} />
            {t('owned')}
          </button>
        </nav>
      </div>
      
      {/* Stats para recompensas obtenidas */}
      {activeTab === 'owned' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center">
              <Star className="text-indigo-500 mr-2" size={20} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-500">{t('total_rewards')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.consumidas}</div>
                <div className="text-sm text-gray-500">{t('consumed_rewards')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="flex items-center">
              <Trophy className="text-amber-500 mr-2" size={20} />
              <div>
                <div className="text-2xl font-bold text-gray-800">{stats.puntos}</div>
                <div className="text-sm text-gray-500">{t('total_points')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recompensas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Star className="text-indigo-600" size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'available' 
              ? t('no_available_rewards') 
              : t('no_owned_rewards')}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeTab === 'available'
              ? t('available_rewards_desc')
              : t('owned_rewards_desc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recompensas.map((recompensa) => {
            const isOwned = activeTab === 'owned';
            const isConsumed = isOwned && recompensa.consumida;
            const isLoading = consuming === recompensa.id_recompensa;
            
            return (
              <div 
                key={recompensa.id_recompensa}
                className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                  isConsumed ? 'border-green-200' : 'border-gray-100'
                } hover:shadow-lg transition-all`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                      isConsumed ? 'bg-green-100' : getColorClass(recompensa.valor)
                    }`}>
                      {getIcon(recompensa.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800">{recompensa.nombre}</h3>
                        {isConsumed && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="mr-1" size={12} />
                            {t('consumed')}
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-1 text-gray-600 text-sm line-clamp-2">
                        {recompensa.descripcion}
                      </p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-amber-500">
                            <Star className="mr-1" size={16} />
                            <span className="font-medium">{recompensa.valor}</span>
                          </div>
                          
                          {recompensa.nivel && (
                            <div className="flex items-center text-indigo-600">
                              <Crown className="mr-1" size={16} />
                              <span className="text-xs font-medium">{recompensa.nivel}</span>
                            </div>
                          )}
                        </div>
                        
                        {isOwned && !isConsumed ? (
                          <button
                            onClick={() => consumirRecompensa(recompensa.id_recompensa)}
                            disabled={isLoading}
                            className={`${
                              isLoading 
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            } inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                          >
                            {isLoading ? (
                              <Loader className="animate-spin mr-2" size={16} />
                            ) : (
                              <Gift className="mr-2" size={16} />
                            )}
                            {t('consume')}
                          </button>
                        ) : !isOwned && (
                          <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {t('requirements')}:
                            {Object.entries(recompensa.requisitos || {}).map(([key, value]) => (
                              <span key={key} className="ml-1">{value} {key.replace('_', ' ')}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recompensas;