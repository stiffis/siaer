import React, { useState } from 'react';
import ImpactMap from '../components/ImpactMap';

export default function MapPage({ onGoBack }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    'introduccion',
    'mapa_impacto',
    'mapa_temperatura',
    'mapa_sismico',
    'mapa_radiacion'
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <style jsx global>{`
        /* Estilos personalizados para scrollbars */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.6);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.8);
        }
        
        /* Para Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(75, 85, 99, 0.6) rgba(31, 41, 55, 0.3);
        }
        
        /* Indicador de scroll */
        .scroll-indicator {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(156, 163, 175, 0.6);
          font-size: 12px;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        /* Estilos para Leaflet */
        .leaflet-container {
          background: #1f2937 !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          border-radius: 8px !important;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        
        .leaflet-control-zoom a {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border: 1px solid #374151 !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        
        .impact-legend {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border-radius: 5px !important;
          padding: 10px !important;
        }
      `}</style>
      
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="SIAER logo" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">Mapas de Impacto</h1>
              <p className="text-sm text-indigo-200">Visualización de efectos de IMPACTOR-2025</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Controles de navegación */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevSlide}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
                disabled={currentSlide === 0}
              >
                <span className="text-xl">←</span>
              </button>
              
              <div className="text-sm text-gray-300 min-w-[120px] text-center">
                {currentSlide + 1} / {slides.length}
              </div>
              
              <button 
                onClick={nextSlide}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
                disabled={currentSlide === slides.length - 1}
              >
                <span className="text-xl">→</span>
              </button>
            </div>
            
            {/* Botón de regreso */}
            <button 
              onClick={onGoBack}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-semibold border border-gray-500/60 shadow-lg hover:shadow-gray-900/40 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Volver a Cálculos</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full flex items-center justify-center py-8">
          <div className="w-full max-w-none mx-auto px-4">
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Diapositiva 1: Introducción */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-center justify-center">
                  <div className="text-center max-w-8xl mx-auto px-8">
                    <div className="text-9xl mb-12">🗺️</div>
                    <h2 className="text-6xl font-bold text-white mb-8">
                      Mapas de Impacto IMPACTOR-2025
                    </h2>
                    <p className="text-3xl text-gray-300 mb-12">
                      Visualización interactiva de efectos medioambientales
                    </p>
                    <div className="text-2xl text-gray-400 mb-8">
                      Navega con las flechas para explorar cada mapa
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8 mt-12 max-w-9xl mx-auto">
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <div className="text-4xl mb-4">💥</div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-2">Mapa de Impacto</h3>
                        <p className="text-gray-300 text-sm">Zonas de destrucción y cráter</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <div className="text-4xl mb-4">🌡️</div>
                        <h3 className="text-xl font-semibold text-red-400 mb-2">Mapa de Temperatura</h3>
                        <p className="text-gray-300 text-sm">Efectos térmicos regionales</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <div className="text-4xl mb-4">🌍</div>
                        <h3 className="text-xl font-semibold text-orange-400 mb-2">Mapa Sísmico</h3>
                        <p className="text-gray-300 text-sm">Ondas sísmicas y terremotos</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
                        <div className="text-4xl mb-4">☢️</div>
                        <h3 className="text-xl font-semibold text-pink-400 mb-2">Mapa de Radiación</h3>
                        <p className="text-gray-300 text-sm">Niveles de radiación</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 2: Mapa de Impacto */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-none bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">💥 Mapa de Impacto y Destrucción</h3>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
                      {/* Mapa ocupa 3/5 del espacio */}
                      <div className="xl:col-span-3 bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-2xl">Mapa Interactivo de Impacto</h4>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <ImpactMap 
                            impactLat={40.7128}
                            impactLng={-74.0060}
                            impactRadius={15}
                            devastationRadius={100}
                            shockwaveRadius={500}
                            atmosphericRadius={2000}
                          />
                        </div>
                      </div>

                      {/* Contenido ocupa 2/5 del espacio */}
                      <div className="xl:col-span-2 space-y-6">
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-2xl">Zona de Impacto Directo</h4>
                          <div className="space-y-4">
                            <div className="bg-red-900/20 border-l-4 border-red-400 rounded p-4">
                              <h5 className="font-semibold text-red-400 mb-2">Cráter Principal</h5>
                              <p className="text-gray-300 text-lg">Diámetro: ~15-20 km</p>
                              <p className="text-gray-300 text-lg">Profundidad: ~2-3 km</p>
                              <p className="text-gray-300 text-sm">Destrucción total instantánea</p>
                            </div>
                            <div className="bg-orange-900/20 border-l-4 border-orange-400 rounded p-4">
                              <h5 className="font-semibold text-orange-400 mb-2">Zona de Devastación</h5>
                              <p className="text-gray-300 text-lg">Radio: ~50-100 km</p>
                              <p className="text-gray-300 text-sm">Destrucción de estructuras, incendios masivos</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-2xl">Efectos Regionales</h4>
                          <div className="space-y-4">
                            <div className="bg-yellow-900/20 border-l-4 border-yellow-400 rounded p-4">
                              <h5 className="font-semibold text-yellow-400 mb-2">Ondas de Choque</h5>
                              <p className="text-gray-300 text-lg">Radio: ~500-1000 km</p>
                              <p className="text-gray-300 text-sm">Ventanas rotas, daños estructurales</p>
                            </div>
                            <div className="bg-blue-900/20 border-l-4 border-blue-400 rounded p-4">
                              <h5 className="font-semibold text-blue-400 mb-2">Efectos Atmosféricos</h5>
                              <p className="text-gray-300 text-lg">Radio: ~2000-5000 km</p>
                              <p className="text-gray-300 text-sm">Cambios climáticos temporales</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gray-900/30 rounded-lg p-3">
                        <h5 className="font-semibold text-green-400 mb-1 text-sm">Ubicación del Impacto</h5>
                        <p className="text-gray-300 text-base">Nueva York, NY</p>
                        <p className="text-gray-300 text-xs">Lat: 40.7128°N, Lng: 74.0060°W</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-3">
                        <h5 className="font-semibold text-red-400 mb-1 text-sm">Población Afectada</h5>
                        <p className="text-gray-300 text-base">~50-100 millones</p>
                        <p className="text-gray-300 text-xs">En zona de efectos directos</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-3">
                        <h5 className="font-semibold text-orange-400 mb-1 text-sm">Infraestructura</h5>
                        <p className="text-gray-300 text-base">Destrucción total</p>
                        <p className="text-gray-300 text-xs">En radio de 100 km</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-400 mb-1 text-sm">Tiempo de Recuperación</h5>
                        <p className="text-gray-300 text-base">Décadas</p>
                        <p className="text-gray-300 text-xs">Para zona de impacto</p>
                      </div>
                    </div>
                    <div className="scroll-indicator">
                      📜 Desplázate para ver más contenido
                    </div>
                  </div>
                </div>

                {/* Diapositiva 3: Mapa de Temperatura */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-none bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-4xl font-semibold text-red-400 mb-8 text-center">🌡️ Mapa de Efectos Térmicos</h3>
                    

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
                      {/* Mapa ocupa 3/5 del espacio */}
                      <div className="xl:col-span-3 bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-red-400 mb-4 text-2xl">Mapa de Efectos Térmicos</h4>
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
                            <img 
                              src="/textures/thermal-map.png" 
                              alt="Mapa de efectos térmicos"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="bg-black/80 text-white p-3 rounded-lg">
                                <h5 className="text-sm font-semibold mb-1">🌡️ Distribución de Temperaturas</h5>
                                <p className="text-xs text-gray-300">
                                  Efectos térmicos del impacto de IMPACTOR-2025
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contenido ocupa 2/5 del espacio */}
                      <div className="xl:col-span-2 space-y-6">
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h4 className="font-semibold text-red-400 mb-4 text-2xl">Zonas de Temperatura</h4>
                          <div className="space-y-4">
                            <div className="bg-red-900/20 border-l-4 border-red-500 rounded p-4">
                              <h5 className="font-semibold text-red-400 mb-2">Zona de Incineración</h5>
                              <p className="text-gray-300 text-lg">Temperatura: &gt; 1000°C</p>
                              <p className="text-gray-300 text-lg">Radio: ~20-30 km</p>
                              <p className="text-gray-300 text-sm">Todo se vaporiza instantáneamente</p>
                            </div>
                            <div className="bg-orange-900/20 border-l-4 border-orange-500 rounded p-4">
                              <h5 className="font-semibold text-orange-400 mb-2">Zona de Combustión</h5>
                              <p className="text-gray-300 text-lg">Temperatura: 300-1000°C</p>
                              <p className="text-gray-300 text-lg">Radio: ~50-100 km</p>
                              <p className="text-gray-300 text-sm">Incendios masivos, materiales se derriten</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-lg p-6">
                          <h4 className="font-semibold text-red-400 mb-4 text-2xl">Efectos Térmicos</h4>
                          <div className="space-y-4">
                            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded p-4">
                              <h5 className="font-semibold text-yellow-400 mb-2">Radiación Térmica</h5>
                              <p className="text-gray-300 text-lg">Radio: ~200-500 km</p>
                              <p className="text-gray-300 text-sm">Quemaduras graves, incendios</p>
                            </div>
                            <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded p-4">
                              <h5 className="font-semibold text-blue-400 mb-2">Cambios Climáticos</h5>
                              <p className="text-gray-300 text-lg">Duración: meses-años</p>
                              <p className="text-gray-300 text-sm">Invierno de impacto global</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Diapositiva 4: Mapa Sísmico */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-none bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-4xl font-semibold text-orange-400 mb-8 text-center">🌍 Mapa de Efectos Sísmicos</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-orange-400 mb-4 text-2xl">Magnitud Sísmica</h4>
                        <div className="space-y-4">
                          <div className="bg-red-900/20 border-l-4 border-red-500 rounded p-4">
                            <h5 className="font-semibold text-red-400 mb-2">Epicentro</h5>
                            <p className="text-gray-300 text-lg">Magnitud: 9.0-9.5</p>
                            <p className="text-gray-300 text-lg">Radio: ~10-20 km</p>
                            <p className="text-gray-300 text-sm">Destrucción total del suelo</p>
                          </div>
                          <div className="bg-orange-900/20 border-l-4 border-orange-500 rounded p-4">
                            <h5 className="font-semibold text-orange-400 mb-2">Zona de Daños Severos</h5>
                            <p className="text-gray-300 text-lg">Magnitud: 7.0-8.0</p>
                            <p className="text-gray-300 text-lg">Radio: ~100-200 km</p>
                            <p className="text-gray-300 text-sm">Colapso de edificios</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-orange-400 mb-4 text-2xl">Ondas Sísmicas</h4>
                        <div className="space-y-4">
                          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded p-4">
                            <h5 className="font-semibold text-yellow-400 mb-2">Ondas P (Primarias)</h5>
                            <p className="text-gray-300 text-lg">Velocidad: ~6-8 km/s</p>
                            <p className="text-gray-300 text-sm">Primeras en llegar</p>
                          </div>
                          <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded p-4">
                            <h5 className="font-semibold text-blue-400 mb-2">Ondas S (Secundarias)</h5>
                            <p className="text-gray-300 text-lg">Velocidad: ~3-4 km/s</p>
                            <p className="text-gray-300 text-sm">Más destructivas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-6 mb-8">
                      <h4 className="font-semibold text-orange-400 mb-4 text-2xl">Mapa de Intensidad Sísmica</h4>
                      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">🌍</div>
                        <div className="relative w-full h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
                          <div className="text-gray-400 text-lg">
                            [Mapa de intensidad sísmica con círculos concéntricos]
                          </div>
                          <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded text-sm">
                            IX-X (Destrucción total)
                          </div>
                          <div className="absolute top-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded text-sm">
                            VII-VIII (Daños severos)
                          </div>
                          <div className="absolute bottom-4 left-4 bg-yellow-500/90 text-white px-3 py-1 rounded text-sm">
                            V-VI (Daños moderados)
                          </div>
                          <div className="absolute bottom-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded text-sm">
                            III-IV (Daños ligeros)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-red-400 mb-2">Duración</h5>
                        <p className="text-gray-300 text-lg">~2-5 minutos</p>
                        <p className="text-gray-300 text-sm">Temblor principal</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-400 mb-2">Réplicas</h5>
                        <p className="text-gray-300 text-lg">Miles</p>
                        <p className="text-gray-300 text-sm">Durante meses</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-400 mb-2">Tsunamis</h5>
                        <p className="text-gray-300 text-lg">Altura: 10-50 m</p>
                        <p className="text-gray-300 text-sm">En costas cercanas</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-400 mb-2">Alcance Global</h5>
                        <p className="text-gray-300 text-lg">Mundial</p>
                        <p className="text-gray-300 text-sm">Sensible en todo el planeta</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 5: Mapa de Radiación */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-none bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-4xl font-semibold text-pink-400 mb-8 text-center">☢️ Mapa de Radiación</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-pink-400 mb-4 text-2xl">Niveles de Radiación</h4>
                        <div className="space-y-4">
                          <div className="bg-red-900/20 border-l-4 border-red-500 rounded p-4">
                            <h5 className="font-semibold text-red-400 mb-2">Zona Letal</h5>
                            <p className="text-gray-300 text-lg">Dosis: &gt; 10,000 rad</p>
                            <p className="text-gray-300 text-lg">Radio: ~20-30 km</p>
                            <p className="text-gray-300 text-sm">Muerte en minutos</p>
                          </div>
                          <div className="bg-orange-900/20 border-l-4 border-orange-500 rounded p-4">
                            <h5 className="font-semibold text-orange-400 mb-2">Zona Peligrosa</h5>
                            <p className="text-gray-300 text-lg">Dosis: 1,000-10,000 rad</p>
                            <p className="text-gray-300 text-lg">Radio: ~50-100 km</p>
                            <p className="text-gray-300 text-sm">Enfermedad por radiación severa</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-pink-400 mb-4 text-2xl">Efectos Biológicos</h4>
                        <div className="space-y-4">
                          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 rounded p-4">
                            <h5 className="font-semibold text-yellow-400 mb-2">Zona de Riesgo</h5>
                            <p className="text-gray-300 text-lg">Dosis: 100-1,000 rad</p>
                            <p className="text-gray-300 text-lg">Radio: ~100-200 km</p>
                            <p className="text-gray-300 text-sm">Efectos a largo plazo</p>
                          </div>
                          <div className="bg-blue-900/20 border-l-4 border-blue-500 rounded p-4">
                            <h5 className="font-semibold text-blue-400 mb-2">Zona Segura</h5>
                            <p className="text-gray-300 text-lg">Dosis: &lt; 100 rad</p>
                            <p className="text-gray-300 text-lg">Radio: &gt; 200 km</p>
                            <p className="text-gray-300 text-sm">Efectos mínimos</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-6 mb-8">
                      <h4 className="font-semibold text-pink-400 mb-4 text-2xl">Mapa de Contaminación Radiactiva</h4>
                      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                        <div className="text-6xl mb-4">☢️</div>
                        <div className="relative w-full h-64 bg-gray-700/30 rounded-lg flex items-center justify-center">
                          <div className="text-gray-400 text-lg">
                            [Mapa de radiación con gradientes de peligro]
                          </div>
                          <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded text-sm">
                            Letal
                          </div>
                          <div className="absolute top-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded text-sm">
                            Peligroso
                          </div>
                          <div className="absolute bottom-4 left-4 bg-yellow-500/90 text-white px-3 py-1 rounded text-sm">
                            Riesgo
                          </div>
                          <div className="absolute bottom-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded text-sm">
                            Seguro
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-red-400 mb-2">Tiempo de Decaimiento</h5>
                        <p className="text-gray-300 text-lg">Días-semanas</p>
                        <p className="text-gray-300 text-sm">Para niveles seguros</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-orange-400 mb-2">Contaminación</h5>
                        <p className="text-gray-300 text-lg">Persistente</p>
                        <p className="text-gray-300 text-sm">En zona de impacto</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-400 mb-2">Efectos en la Vida</h5>
                        <p className="text-gray-300 text-lg">Mutaciones</p>
                        <p className="text-gray-300 text-sm">En plantas y animales</p>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-400 mb-2">Evacuación</h5>
                        <p className="text-gray-300 text-lg">Inmediata</p>
                        <p className="text-gray-300 text-sm">En radio de 200 km</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}