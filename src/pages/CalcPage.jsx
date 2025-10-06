import React, { useState } from 'react';

export default function CalcPage({ onGoBack, onMapClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    'introduccion',
    'parametros',
    'energia',
    'crater',
    'choque',
    'termico',
    'sismico',
    'polvo',
    'atmosferico',
    'radiacion',
    'notas',
    'referencias'
  ];

  const handleMapButtonClick = () => {
    if (onMapClick) {
      onMapClick();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <style jsx>{`
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
      `}</style>
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="SIAER logo" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">Calculadora de Impacto</h1>
              <p className="text-sm text-indigo-200">Análisis avanzado de efectos de impacto</p>
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
            
            {/* Botón de Mapas */}
            <button 
              onClick={handleMapButtonClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 font-semibold border border-blue-400/60 shadow-lg hover:shadow-blue-900/40 transform hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <span>🗺️</span>
              <span>Mirar Mapas (IMPACTOR-2025)</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="min-h-full flex items-center justify-center py-8">
          <div className="w-full max-w-6xl mx-auto px-8">
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {/* Diapositiva 1: Introducción */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-center justify-center">
                  <div className="text-center max-w-4xl mx-auto px-4">
                    <div className="text-8xl mb-8">🌍</div>
                    <h2 className="text-5xl font-bold text-white mb-6">
                      Fórmulas de Efectos Medioambientales
                    </h2>
                    <p className="text-2xl text-gray-300 mb-8">
                      Cálculo de consecuencias ambientales de impactos de meteoritos
                    </p>
                    <div className="text-lg text-gray-400">
                      Navega con las flechas para explorar cada sección
                    </div>
                  </div>
                </div>

                {/* Diapositiva 2: Parámetros de Entrada */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-green-400 mb-8 text-center">📊 Parámetros de Entrada</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-gray-300">
                      <div className="bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-6 text-xl">🚀 Impactor (Meteorito)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 font-bold text-lg">D</span>
                              <span className="text-base">= Diámetro (m)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 font-bold text-lg">ρ</span>
                              <span className="text-base">= Densidad (kg/m³)</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 font-bold text-lg">v</span>
                              <span className="text-base">= Velocidad (m/s)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-400 font-bold text-lg">θ</span>
                              <span className="text-base">= Ángulo de impacto (°)</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-blue-900/20 border-l-4 border-blue-400 rounded">
                          <p className="text-base text-blue-200">
                            <strong>Ejemplo:</strong> Un meteorito de 1 km de diámetro, densidad de 3000 kg/m³, 
                            velocidad de 20 km/s, impactando a 45°.
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-6 text-xl">🌍 Target (Tierra)</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-bold text-lg">ρ<sub>t</sub></span>
                              <span className="text-base">= Densidad del target (kg/m³)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-bold text-lg">Y</span>
                              <span className="text-base">= Resistencia del material (Pa)</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-bold text-lg">g</span>
                              <span className="text-base">= Gravedad (m/s²)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-bold text-lg">R</span>
                              <span className="text-base">= Distancia al impacto (km)</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 p-4 bg-green-900/20 border-l-4 border-green-400 rounded">
                          <p className="text-base text-green-200">
                            <strong>Valores típicos:</strong> Densidad terrestre ~2700 kg/m³, 
                            gravedad 9.81 m/s², resistencia de roca ~10⁷ Pa.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="scroll-indicator">
                      📜 Desplázate para ver más contenido
                    </div>
                  </div>
                </div>

                {/* Diapositiva 3: Energía del Impacto */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-red-400 mb-8 text-center">⚡ Energía del Impacto</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Energía Cinética</h4>
                        <div className="text-center text-3xl text-white mb-4 font-serif">
                          E = <span className="text-5xl">½</span>mv²
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Donde m = <span className="font-mono">π/6 × D³ × ρ</span></p>
                        <div className="p-4 bg-blue-900/20 border-l-4 border-blue-400 rounded">
                          <p className="text-base text-blue-200">
                            <strong>¿Qué significa?</strong> Esta fórmula calcula cuánta energía tiene el meteorito cuando choca. 
                            Es como calcular la fuerza de un auto que va muy rápido: mientras más grande sea el meteorito 
                            y más rápido vaya, más energía tendrá al impactar.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Equivalencia en TNT</h4>
                        <div className="text-center text-3xl text-white mb-4 font-serif">
                          E<sub>TNT</sub> = <span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">4.184 × 10⁹</span>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En megatones de TNT</p>
                        <div className="p-4 bg-orange-900/20 border-l-4 border-orange-400 rounded">
                          <p className="text-base text-orange-200">
                            <strong>¿Qué significa?</strong> Convierte la energía del meteorito a una medida más fácil de entender: 
                            cuántas bombas atómicas equivalen. Por ejemplo, si un meteorito tiene 100 megatones de TNT, 
                            significa que libera la misma energía que 100 bombas atómicas como la de Hiroshima.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 4: Diámetro del Cráter */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-orange-400 mb-8 text-center">🕳️ Diámetro del Cráter</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Fórmula de Collins et al.</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          D<sub>c</sub> = 1.161 × <span className="text-3xl">(</span><span className="text-4xl">ρ</span><span className="text-xl">/</span><span className="text-4xl">ρ<sub>t</sub></span><span className="text-3xl">)</span><sup className="text-xl">1/3</sup> × D<sup className="text-xl">0.78</sup> × v<sup className="text-xl">0.44</sup> × g<sup className="text-xl">-0.22</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Para cráteres simples (D &lt; 4 km)</p>
                        <div className="p-4 bg-orange-900/20 border-l-4 border-orange-400 rounded">
                          <p className="text-base text-orange-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan grande será el hoyo que deje el meteorito. 
                            Es como predecir el tamaño de un cráter que haría una piedra al caer en arena, pero a escala gigante. 
                            Un meteorito de 1 km puede crear un cráter de 10-15 km de diámetro.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Cráteres Complejos</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          D<sub>c</sub> = 1.4 × D<sub>simple</sub><sup className="text-xl">1.15</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Para cráteres complejos (D &gt; 4 km)</p>
                        <div className="p-4 bg-orange-900/20 border-l-4 border-orange-400 rounded">
                          <p className="text-base text-orange-200">
                            <strong>¿Qué significa?</strong> Los cráteres muy grandes no son simples hoyos, sino que tienen 
                            montañas en el centro y bordes más complejos. Esta fórmula ajusta el tamaño para estos cráteres 
                            gigantes, como el de Chicxulub que acabó con los dinosaurios.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 5: Ondas de Choque */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-purple-400 mb-8 text-center">💥 Ondas de Choque</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Presión Máxima</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          P<sub>max</sub> = 2.5 × 10⁹ × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.67</sup> × R<sup className="text-xl">-2.04</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Donde E₀ = 10¹⁵ J (referencia)</p>
                        <div className="p-4 bg-purple-900/20 border-l-4 border-purple-400 rounded">
                          <p className="text-base text-purple-200">
                            <strong>¿Qué significa?</strong> Calcula la fuerza de la "explosión" que se siente a cierta distancia. 
                            Es como medir qué tan fuerte se siente una explosión desde lejos. A 10 km del impacto, 
                            la presión puede ser 1000 veces mayor que la presión normal del aire.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Velocidad del Viento</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          v<sub>wind</sub> = 2.5 × 10³ × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.33</sup> × R<sup className="text-xl">-1.02</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En m/s</p>
                        <div className="p-4 bg-purple-900/20 border-l-4 border-purple-400 rounded">
                          <p className="text-base text-purple-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan rápido soplará el viento después del impacto. 
                            Es como un huracán súper fuerte que se forma instantáneamente. A 20 km del impacto, 
                            el viento puede ser más rápido que un tornado (más de 300 km/h).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 6: Efectos Térmicos */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-red-400 mb-8 text-center">🔥 Efectos Térmicos</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Radiación Térmica</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          I = 2.2 × 10⁹ × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.67</sup> × R<sup className="text-xl">-2.04</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En W/m²</p>
                        <div className="p-4 bg-red-900/20 border-l-4 border-red-400 rounded">
                          <p className="text-base text-red-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan caliente será el "fogón" que se forma al impactar. 
                            Es como estar muy cerca de una explosión nuclear. A 50 km del impacto, 
                            la radiación puede ser 1000 veces más intensa que la luz del sol.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Temperatura de Superficie</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          T = <span className="text-3xl">(</span><span className="text-4xl">I</span><span className="text-xl">/</span><span className="text-4xl">σ</span><span className="text-3xl">)</span><sup className="text-xl">1/4</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Donde σ = constante de Stefan-Boltzmann</p>
                        <div className="p-4 bg-red-900/20 border-l-4 border-red-400 rounded">
                          <p className="text-base text-red-200">
                            <strong>¿Qué significa?</strong> Convierte la radiación en temperatura real. 
                            Es como saber qué tan caliente se pondría una superficie bajo esa radiación. 
                            Puede alcanzar miles de grados Celsius, suficiente para derretir rocas.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Duración del Pulso Térmico</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          t<sub>thermal</sub> = 0.1 × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.33</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En segundos</p>
                        <div className="p-4 bg-red-900/20 border-l-4 border-red-400 rounded">
                          <p className="text-base text-red-200">
                            <strong>¿Qué significa?</strong> Calcula cuánto tiempo dura el "fogón" intenso. 
                            Es como saber cuánto tiempo estaría encendida una estufa súper caliente. 
                            Para un meteorito grande, puede durar varios minutos de calor extremo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 7: Efectos Sísmicos */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-yellow-400 mb-8 text-center">🌍 Efectos Sísmicos</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Magnitud Sísmica</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          M<sub>w</sub> = 0.67 × log<sub>10</sub>(E) - 5.87
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Escala de magnitud de momento</p>
                        <div className="p-4 bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                          <p className="text-base text-yellow-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan fuerte será el terremoto que cause el impacto. 
                            Es como medir un terremoto gigante. Un meteorito de 1 km puede causar un terremoto de magnitud 8-9, 
                            más fuerte que el terremoto más grande registrado en la historia.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Aceleración del Suelo</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          a = 0.1 × g × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.33</sup> × R<sup className="text-xl">-1.5</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En m/s²</p>
                        <div className="p-4 bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                          <p className="text-base text-yellow-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan fuerte se sacudirá el suelo. 
                            Es como medir qué tan brusco será el movimiento. A 100 km del impacto, 
                            el suelo puede moverse 10 veces más rápido que la gravedad normal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 8: Cobertura de Polvo y Escombros */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-gray-400 mb-8 text-center">🌫️ Cobertura de Polvo y Escombros</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Espesor de Ejecta</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          h = 0.1 × D<sub>c</sub> × <span className="text-3xl">(</span><span className="text-4xl">R</span><span className="text-xl">/</span><span className="text-4xl">D<sub>c</sub></span><span className="text-3xl">)</span><sup className="text-xl">-3</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En metros</p>
                        <div className="p-4 bg-gray-900/20 border-l-4 border-gray-400 rounded">
                          <p className="text-base text-gray-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan gruesa será la capa de tierra y rocas que caiga del cielo. 
                            Es como una lluvia de escombros gigante. A 50 km del impacto, puede caer una capa de 1-2 metros de escombros.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Masa de Ejecta</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          M<sub>ejecta</sub> = 0.1 × ρ<sub>t</sub> × D<sub>c</sub><sup className="text-xl">3</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En kg</p>
                        <div className="p-4 bg-gray-900/20 border-l-4 border-gray-400 rounded">
                          <p className="text-base text-gray-200">
                            <strong>¿Qué significa?</strong> Calcula cuánta tierra y rocas se lanzarán al aire. 
                            Es como medir el peso de toda la tierra que se volará. Un meteorito de 1 km puede lanzar 
                            millones de toneladas de material al espacio.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Altura de la Columna de Ejecta</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          H = 0.5 × D<sub>c</sub> × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.2</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En metros</p>
                        <div className="p-4 bg-gray-900/20 border-l-4 border-gray-400 rounded">
                          <p className="text-base text-gray-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan alta será la "columna de humo" de escombros. 
                            Es como una explosión gigante que lanza material muy alto. Para un meteorito grande, 
                            la columna puede llegar hasta la atmósfera superior, a decenas de kilómetros de altura.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 9: Efectos Atmosféricos */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-cyan-400 mb-8 text-center">🌪️ Efectos Atmosféricos</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Presión Atmosférica</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          ΔP = 0.1 × P<sub>atm</sub> × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.33</sup> × R<sup className="text-xl">-2</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">Cambio en presión atmosférica</p>
                        <div className="p-4 bg-cyan-900/20 border-l-4 border-cyan-400 rounded">
                          <p className="text-base text-cyan-200">
                            <strong>¿Qué significa?</strong> Calcula cómo cambiará la presión del aire después del impacto. 
                            Es como un cambio súbito en el clima. Puede causar cambios dramáticos en la presión atmosférica 
                            que afecten el clima regional.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Velocidad del Viento</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          v<sub>storm</sub> = 50 × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.2</sup> × R<sup className="text-xl">-0.5</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En m/s</p>
                        <div className="p-4 bg-cyan-900/20 border-l-4 border-cyan-400 rounded">
                          <p className="text-base text-cyan-200">
                            <strong>¿Qué significa?</strong> Calcula qué tan fuerte será el viento que se genere. 
                            Es como un huracán súper poderoso que se forma instantáneamente. A 100 km del impacto, 
                            el viento puede ser más fuerte que cualquier huracán registrado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 10: Radiación */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-pink-400 mb-8 text-center">☢️ Radiación</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Dosis de Radiación</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          D = 10⁶ × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.5</sup> × R<sup className="text-xl">-2</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En rads</p>
                        <div className="p-4 bg-pink-900/20 border-l-4 border-pink-400 rounded">
                          <p className="text-base text-pink-200">
                            <strong>¿Qué significa?</strong> Calcula cuánta radiación peligrosa se liberará. 
                            Es como medir la radiación de una explosión nuclear. A 50 km del impacto, 
                            la radiación puede ser mortal para los seres vivos en minutos.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Tiempo de Decaimiento</h4>
                        <div className="text-center text-2xl text-white mb-4 font-serif">
                          t<sub>decay</sub> = 1.4 × 10⁶ × <span className="text-3xl">(</span><span className="text-4xl">E</span><span className="text-xl">/</span><span className="text-4xl">E<sub>0</sub></span><span className="text-3xl">)</span><sup className="text-xl">0.2</sup>
                        </div>
                        <p className="text-base text-gray-400 mb-4 text-center">En segundos</p>
                        <div className="p-4 bg-pink-900/20 border-l-4 border-pink-400 rounded">
                          <p className="text-base text-pink-200">
                            <strong>¿Qué significa?</strong> Calcula cuánto tiempo durará la radiación peligrosa. 
                            Es como saber cuánto tiempo hay que esperar para que sea seguro regresar. 
                            Para un meteorito grande, la radiación puede durar días o semanas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diapositiva 11: Notas Importantes */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-red-900/20 border border-red-500/40 rounded-xl p-8 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-red-400 mb-8 text-center">⚠️ Notas Importantes</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Limitaciones del Modelo</h4>
                          <ul className="text-gray-300 space-y-3 text-base">
                            <li className="flex items-start space-x-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Estas fórmulas son aproximaciones basadas en modelos simplificados</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Los resultados pueden variar significativamente en la realidad</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-red-400 mt-1">•</span>
                              <span>Se recomienda usar múltiples modelos para validación</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Factores Locales</h4>
                          <ul className="text-gray-300 space-y-3 text-base">
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-400 mt-1">•</span>
                              <span>Las condiciones geológicas afectan los resultados</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-400 mt-1">•</span>
                              <span>La topografía local modifica los efectos</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-400 mt-1">•</span>
                              <span>El clima regional influye en la dispersión</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Consideraciones Adicionales</h4>
                          <ul className="text-gray-300 space-y-3 text-base">
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>Los efectos a largo plazo requieren modelos climáticos complejos</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>La composición del meteorito afecta los resultados</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span>El ángulo de impacto influye en la distribución de efectos</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Uso Responsable</h4>
                          <ul className="text-gray-300 space-y-3 text-base">
                            <li className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>Estas herramientas son para fines educativos y de investigación</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>Consulte siempre con expertos para aplicaciones reales</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span>Los modelos deben validarse con datos observacionales</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="scroll-indicator">
                      📜 Desplázate para ver más contenido
                    </div>
                  </div>
                </div>

                {/* Diapositiva 12: Referencias Científicas */}
                <div className="w-full flex-shrink-0 min-h-screen flex items-start justify-center py-8">
                  <div className="w-full max-w-6xl bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 overflow-y-auto max-h-screen custom-scrollbar">
                    <h3 className="text-3xl font-semibold text-blue-400 mb-8 text-center">📚 Referencias Científicas</h3>
                    <div className="space-y-6">
                      <div className="bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-xl">Referencia Principal</h4>
                        <div className="text-gray-300 space-y-2 text-base">
                          <p><strong>Collins, G. S., Melosh, H. J., & Marcus, R. A.</strong> (2005). Earth impact effects program: A web-based computer program for calculating the regional environmental consequences of a meteoroid impact on earth. <em>Meteoritics & Planetary Science</em>, 40(6), 817-840.</p>
                          <p className="text-sm text-gray-400">DOI: 10.1111/j.1945-5100.2005.tb00157.x</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-lg">Libros Fundamentales</h4>
                          <div className="text-gray-300 space-y-3 text-sm">
                            <div>
                              <p><strong>Melosh, H. J.</strong> (1989). <em>Impact Cratering: A Geologic Process</em>. Oxford University Press.</p>
                              <p className="text-xs text-gray-400 mt-1">ISBN: 978-0195042849</p>
                            </div>
                            <div>
                              <p><strong>French, B. M.</strong> (1998). <em>Traces of Catastrophe: A Handbook of Shock-Metamorphic Effects in Terrestrial Meteorite Impact Structures</em>. LPI Contribution No. 954.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-900/30 rounded-lg p-6">
                          <h4 className="font-semibold text-yellow-400 mb-4 text-lg">Artículos Especializados</h4>
                          <div className="text-gray-300 space-y-3 text-sm">
                            <div>
                              <p><strong>Pierazzo, E., et al.</strong> (1997). Hydrocode simulation of the Chicxulub impact event and the production of climatically active gases. <em>Journal of Geophysical Research</em>, 102(E9), 20,645-20,664.</p>
                              <p className="text-xs text-gray-400 mt-1">DOI: 10.1029/97JE01743</p>
                            </div>
                            <div>
                              <p><strong>Toon, O. B., et al.</strong> (1997). Environmental perturbations caused by the impacts of asteroids and comets. <em>Reviews of Geophysics</em>, 35(1), 41-78.</p>
                              <p className="text-xs text-gray-400 mt-1">DOI: 10.1029/96RG03038</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-lg">Estudios del Evento K-Pg</h4>
                        <div className="text-gray-300 space-y-3 text-sm">
                          <div>
                            <p><strong>Kring, D. A.</strong> (2007). The Chicxulub impact event and its environmental consequences at the Cretaceous-Tertiary boundary. <em>Palaeogeography, Palaeoclimatology, Palaeoecology</em>, 255(1-2), 4-21.</p>
                            <p className="text-xs text-gray-400 mt-1">DOI: 10.1016/j.palaeo.2007.02.037</p>
                          </div>
                          <div>
                            <p><strong>Schulte, P., et al.</strong> (2010). The Chicxulub asteroid impact and mass extinction at the Cretaceous-Paleogene boundary. <em>Science</em>, 327(5970), 1214-1218.</p>
                            <p className="text-xs text-gray-400 mt-1">DOI: 10.1126/science.1177265</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/30 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-400 mb-4 text-lg">Herramientas Computacionales</h4>
                        <div className="text-gray-300 space-y-2 text-sm">
                          <p><strong>Earth Impact Effects Program:</strong> <a href="https://impact.ese.ic.ac.uk/ImpactEarth/" className="text-blue-400 hover:text-blue-300 underline">https://impact.ese.ic.ac.uk/ImpactEarth/</a></p>
                          <p><strong>NASA Near Earth Object Program:</strong> <a href="https://cneos.jpl.nasa.gov/" className="text-blue-400 hover:text-blue-300 underline">https://cneos.jpl.nasa.gov/</a></p>
                          <p><strong>Lunar and Planetary Institute:</strong> <a href="https://www.lpi.usra.edu/" className="text-blue-400 hover:text-blue-300 underline">https://www.lpi.usra.edu/</a></p>
                        </div>
                      </div>
                    </div>
                    <div className="scroll-indicator">
                      📜 Desplázate para ver más contenido
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