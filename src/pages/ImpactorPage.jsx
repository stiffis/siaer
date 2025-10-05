import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Página Educativa del Simulador de Impacto de Asteroides
 * Cómo se detectan objetos espaciales con animaciones interactivas
 */
export default function ImpactorPage({ onGoBack, onAdvancePhase }) {
  const scrollContainerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedObservatory, setSelectedObservatory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [pendingStep, setPendingStep] = useState(null);
  const currentStepRef = useRef(0);
  const transitionTimeoutRef = useRef(null);
  const transitionFrameRef = useRef(null);
  const [isExiting, setIsExiting] = useState(false);
  const [exitProgress, setExitProgress] = useState(5);
  const [exitTarget, setExitTarget] = useState(null);
  const exitIntervalRef = useRef(null);
  const exitTimeoutRef = useRef(null);

  // Detectar scroll para mostrar/ocultar botón scroll up
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return undefined;
    }

    const handleScroll = () => {
      setShowScrollUp(container.scrollTop > 400);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    const container = scrollContainerRef.current;
    if (element && container) {
      const headerOffset = 80;
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const offset = elementTop - containerTop + container.scrollTop - headerOffset;

      container.scrollTo({
        top: Math.max(offset, 0),
        behavior: 'smooth'
      });
    }
  };

  const steps = [
    {
      id: 0,
      title: "Detección Inicial",
      subtitle: "Escaneando el Cosmos",
      description: "Los telescopios de radar escanean continuamente el cielo nocturno en busca de objetos desconocidos. Esta red global de observatorios trabaja las 24 horas detectando cualquier anomalía en el espacio.",
      animation: "telescopios_escaneando_el_cielo.html",
      details: {
        telescopios: "Múltiples telescopios trabajando en coordinación",
        tiempo: "Escaneo continuo 24/7",
        alcance: "Hasta 50 millones de kilómetros",
        precision: "Objetos de hasta 10 metros de diámetro",
        tecnologia: "Ondas de radio de alta frecuencia",
        cobertura: "360° del cielo visible"
      },
      stats: {
        "Telescopios Activos": "150+",
        "Detecciones/Día": "~30",
        "Área Escaneada": "Todo el cielo",
        "Tiempo Respuesta": "< 1 hora"
      },
      color: "from-slate-900 via-slate-800 to-sky-900",
      icon: "🔭"
    },
    {
      id: 1,
      title: "Análisis Espectral",
      subtitle: "Descifrando la Composición",
      description: "Una vez detectado, se analiza la composición química y tamaño del objeto mediante análisis espectral. Los diferentes elementos emiten firmas únicas que revelan de qué está hecho el asteroide.",
      animation: "zoom_al_objeto.html", 
      details: {
        composicion: "Hierro, níquel, silicatos detectados",
        tamaño: "Estimación basada en brillo y distancia",
        velocidad: "28.4 km/s aproximadamente",
        masa: "Calculada según densidad estimada",
        rotacion: "Período de rotación determinado",
        albedo: "Reflectividad de la superficie"
      },
      stats: {
        "Elementos Detectados": "12+",
        "Precisión Masa": "±15%",
        "Tiempo Análisis": "2-6 horas",
        "Resolución Espectral": "0.1 nm"
      },
      color: "from-slate-900 via-slate-800 to-indigo-900",
      icon: "⚛️"
    },
    {
      id: 2,
      title: "Rastreo Orbital",
      subtitle: "Mapeando la Trayectoria",
      description: "Múltiples observatorios alrededor del mundo rastrean el objeto durante varios días para mapear su órbita completa. Esta fase es crucial para determinar si el objeto representa algún peligro futuro.",
      animation: null,
      details: {
        observatorios: "Red global de telescopios coordinados",
        precision: "Órbita mapeada con precisión centimétrica",
        clasificacion: "Determinación de tipo NEO",
        seguimiento: "Monitoreo continuo por 72+ horas",
        calculo: "Predicción orbital a 100+ años",
        verificacion: "Confirmación por múltiples estaciones"
      },
      stats: {
        "Observatorios": "25+",
        "Precisión Orbital": "±50m",
        "Predicción": "100 años",
        "Observaciones": "200+ puntos"
      },
      color: "from-slate-900 via-slate-800 to-emerald-900",
      icon: "🛰️"
    },
    {
      id: 3,
      title: "Clasificación Final",
      subtitle: "Evaluando el Riesgo",
      description: "El objeto se clasifica como NEO y se determina su nivel de peligrosidad. Se evalúa la probabilidad de impacto y se establecen protocolos de seguimiento continuo según el nivel de riesgo determinado.",
      animation: null,
      details: {
        categoria: "Near-Earth Object (NEO) confirmado",
        riesgo: "Evaluación de impacto basada en órbita",
        seguimiento: "Monitoreo continuo establecido",
        clasificacion: "Potentially Hazardous Object (PHO)",
        alerta: "Sistema de alerta temprana activado",
        mitigacion: "Planes de deflección evaluados"
      },
      stats: {
        "Probabilidad Impacto": "1:50,000",
        "Fecha Cercana": "2087",
        "Energía Potencial": "15 Megatones",
        "Nivel Alerta": "Amarillo"
      },
      color: "from-slate-900 via-slate-800 to-rose-900",
      icon: "⚠️"
    }
  ];

  const observatories = [
    {
      name: "Arecibo Observatory",
      type: "Radar",
      location: "Puerto Rico",
      capability: "Detección hasta 50M km",
      status: "primary"
    },
    {
      name: "Goldstone Deep Space",
      type: "Radar", 
      location: "California, USA",
      capability: "Rastreo preciso de órbitas",
      status: "active"
    },
    {
      name: "Catalina Sky Survey",
      type: "Óptico",
      location: "Arizona, USA", 
      capability: "Descubrimiento de NEOs",
      status: "active"
    },
    {
      name: "LINEAR",
      type: "Óptico",
      location: "Nuevo México, USA",
      capability: "Seguimiento automatizado",
      status: "active"
    }
  ];

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      if (transitionFrameRef.current) {
        clearTimeout(transitionFrameRef.current);
        transitionFrameRef.current = null;
      }
    };
  }, []);

  const stepCount = steps.length;

  useEffect(() => {
    if (!isExiting || !exitTarget) {
      return undefined;
    }

    exitIntervalRef.current = setInterval(() => {
      setExitProgress((prev) => {
        if (prev >= 95) {
          return prev;
        }
        const increment = 8 + Math.random() * 12;
        return Math.min(prev + increment, 95);
      });
    }, 80);

    exitTimeoutRef.current = setTimeout(() => {
      if (exitIntervalRef.current) {
        clearInterval(exitIntervalRef.current);
        exitIntervalRef.current = null;
      }
      setExitProgress(100);
      if (exitTarget === 'phase') {
        onAdvancePhase?.();
      } else {
        onGoBack?.();
      }
    }, 800);

    return () => {
      if (exitIntervalRef.current) {
        clearInterval(exitIntervalRef.current);
        exitIntervalRef.current = null;
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [isExiting, exitTarget, onAdvancePhase, onGoBack]);

  const requestStepChange = useCallback((targetIndex) => {
    const normalized = ((targetIndex % stepCount) + stepCount) % stepCount;
    if (normalized === currentStep && pendingStep === null) {
      return;
    }

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    if (transitionFrameRef.current) {
      clearTimeout(transitionFrameRef.current);
      transitionFrameRef.current = null;
    }

    setIsTransitioning(true);
    setPendingStep(normalized);
    setIsPlaying(false);
  }, [currentStep, pendingStep, stepCount]);

  useEffect(() => {
    if (pendingStep === null) {
      return undefined;
    }

    setIsTransitioning(true);

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    const TRANSITION_DURATION = 300;
    transitionTimeoutRef.current = setTimeout(() => {
      const nextStep = pendingStep;
      setCurrentStep(nextStep);
      setPendingStep(null);
      transitionTimeoutRef.current = null;

      transitionFrameRef.current = setTimeout(() => {
        setIsTransitioning(false);
        transitionFrameRef.current = null;
      }, 16);
    }, TRANSITION_DURATION);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      if (transitionFrameRef.current) {
        clearTimeout(transitionFrameRef.current);
        transitionFrameRef.current = null;
      }
    };
  }, [pendingStep]);

  const handlePrevStep = () => {
    requestStepChange(currentStep - 1);
  };

  const handleNextStep = () => {
    requestStepChange(currentStep + 1);
  };

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const interval = setInterval(() => {
      requestStepChange(currentStepRef.current + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying, requestStepChange]);

  const handleStepClick = (stepIndex) => {
    requestStepChange(stepIndex);
  };

  const handleReturnToSimulator = useCallback(() => {
    if (isExiting) {
      return;
    }
    setExitTarget('back');
    setExitProgress(5);
    setIsExiting(true);
  }, [isExiting]);

  const handleAdvancePhaseClick = useCallback(() => {
    if (isExiting) {
      return;
    }
    setExitTarget('phase');
    setExitProgress(5);
    setIsExiting(true);
  }, [isExiting]);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className={`h-screen overflow-y-auto bg-gray-900 transition-opacity duration-500 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
      {/* Header transparente */}
      <header className="fixed top-0 left-0 right-0 z-30 p-4 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/logo.svg"
              alt="SIAER logo"
              className="h-12 w-12 mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">SIAER</h1>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <button 
              onClick={handleReturnToSimulator}
              disabled={isExiting}
              className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-indigo-400/60 shadow-sm shadow-indigo-900/40"
            >
              <span>🚀</span>
              <span>Volver al Simulador Orbital</span>
            </button>
            {currentStep === steps.length - 1 && (
              <button
                onClick={handleAdvancePhaseClick}
                disabled={isExiting}
                className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-emerald-400/60 shadow-sm shadow-emerald-900/40"
              >
                <span>🌌</span>
                <span>Pasar a la siguiente fase</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="pt-24 pb-4 px-24" id="main-content">
        <div className="w-full">
          
          {/* Título de la sección */}
          <div className="text-center mb-12" id="title-section">
            <h2 className="text-4xl font-bold text-white mb-4">
              🔭 Detección de Objetos Espaciales
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              Aprende cómo los científicos detectan, analizan y rastrean asteroides y otros objetos cercanos a la Tierra
            </p>
          </div>

          {/* Timeline Scrubber */}
          <div className="mb-8 px-4" id="timeline-section">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-indigo-900/40 shadow-lg shadow-indigo-950/30">
              <div className="flex items-center justify-center mb-6">
                <h3 className="text-lg font-semibold text-indigo-100 tracking-wide">Proceso de Detección</h3>
              </div>
              
              {/* Timeline */}
              <div className="relative">
                {/* Línea de fondo continua */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-700/70"></div>
                
                {/* Línea de progreso */}
                <div 
                  className="absolute top-6 left-6 h-0.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 transition-all duration-500 ease-in-out"
                  style={{ 
                    width: `calc(${(currentStep / (steps.length - 1)) * 100}% * (100% - 3rem) / 100% + 0px)`
                  }}
                ></div>
                
                <div className="relative flex justify-between items-center">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center relative z-10">
                      <button
                        onClick={() => handleStepClick(index)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 font-semibold ${
                          currentStep === index 
                            ? 'bg-indigo-500 border-indigo-300 text-white shadow-lg shadow-indigo-900/40 scale-110' 
                            : currentStep > index
                            ? 'bg-emerald-600/80 border-emerald-400 text-white shadow-sm shadow-emerald-900/30'
                            : 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {currentStep > index ? '✓' : index + 1}
                      </button>
                      <span className={`text-xs mt-3 text-center max-w-24 transition-colors duration-300 ${
                        currentStep === index ? 'text-indigo-200 font-semibold' : 'text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del paso actual */}
          <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            
            {/* Header del paso con animación */}
            <div className={`text-center mb-8 p-6 rounded-xl bg-gradient-to-r ${steps[currentStep].color} shadow-lg border border-gray-800/60`}
            >
              <div className="text-4xl mb-2">{steps[currentStep].icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{steps[currentStep].title}</h3>
              <p className="text-lg text-white/90">{steps[currentStep].subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 px-4">
              
              {/* Panel de animación mejorado */}
              <div className="bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-indigo-950/50 backdrop-blur-lg rounded-xl border border-indigo-900/40 shadow-xl shadow-slate-950/40 overflow-hidden">
                <div className="p-4 border-b border-indigo-900/30">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    {steps[currentStep].icon} {steps[currentStep].title}
                  </h4>
                </div>
                <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                  {steps[currentStep].animation ? (
                    <iframe 
                      src={`/animations/${steps[currentStep].animation}`}
                      className="w-full h-full border-none"
                      title={steps[currentStep].title}
                      key={currentStep} // Force reload on step change
                    />
                  ) : (
                    <div className="text-center text-gray-300">
                      <div className="text-6xl mb-4 animate-pulse">{steps[currentStep].icon}</div>
                      <p className="text-lg">Simulación en desarrollo</p>
                      <div className="mt-4 flex justify-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Panel de información expandido */}
              <div className="space-y-6">
                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/60 shadow-lg shadow-slate-950/30">
                  <h4 className="text-lg font-semibold text-white mb-4">📋 Descripción Detallada</h4>
                  <p className="text-gray-200 leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 border border-slate-700/60 shadow-lg shadow-slate-950/30">
                  <h4 className="text-lg font-semibold text-white mb-4">⚙️ Especificaciones Técnicas</h4>
                  <div className="space-y-3">
                    {Object.entries(steps[currentStep].details).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start">
                        <span className="text-gray-300 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-gray-200 text-sm text-right max-w-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/50 to-emerald-950/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-900/40 shadow-lg shadow-indigo-950/30">
                  <h4 className="text-lg font-semibold text-white mb-4">📊 Estadísticas en Tiempo Real</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(steps[currentStep].stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-gray-100">{value}</div>
                        <div className="text-xs text-gray-400">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observatorios - Hover Effects */}
          <div className="mb-8" id="observatories-section">
            <div className="bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-indigo-950/50 backdrop-blur-lg rounded-xl p-6 border border-indigo-900/40 shadow-xl shadow-slate-950/30">
              <h3 className="text-xl font-semibold text-white mb-6">🏢 Observatorios Espaciales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {observatories.map((obs, index) => (
                  <div 
                    key={index}
                    className="bg-slate-900/70 rounded-lg p-4 border border-slate-700/60 hover:bg-slate-800 hover:border-indigo-400/70 hover:shadow-lg hover:shadow-indigo-950/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => setSelectedObservatory(selectedObservatory === index ? null : index)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm group-hover:text-indigo-100">
                        {obs.name}
                      </h4>
                      <span className={`w-2 h-2 rounded-full ${
                        obs.status === 'primary' ? 'bg-emerald-400' : 'bg-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-gray-300 mb-1">{obs.type} • {obs.location}</p>
                    
                    {selectedObservatory === index && (
                      <div className="mt-3 pt-3 border-t border-indigo-900/30 animate-fadeIn">
                        <p className="text-xs text-indigo-200">{obs.capability}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección educativa de tipos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="education-section">
            <div className="bg-gradient-to-br from-sky-900/40 via-indigo-950/40 to-slate-950/60 backdrop-blur-md rounded-xl p-6 border border-indigo-900/40 shadow-lg shadow-slate-950/30">
              <h4 className="text-lg font-semibold text-white mb-3">📡 Telescopios de Radar</h4>
              <p className="text-gray-300 text-sm mb-4">
                Utilizan ondas de radio para detectar objetos y determinar su distancia con precisión.
              </p>
              <div className="text-xs text-gray-400">
                <div>• Alcance: hasta 50M km</div>
                <div>• Precisión: centímetros</div>
                <div>• Funcionan día y noche</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 via-purple-950/40 to-slate-950/60 backdrop-blur-md rounded-xl p-6 border border-indigo-900/40 shadow-lg shadow-slate-950/30">
              <h4 className="text-lg font-semibold text-white mb-3">🌌 NEOs (Near-Earth Objects)</h4>
              <p className="text-gray-300 text-sm mb-4">
                Asteroides y cometas con órbitas que los acercan a menos de 50 millones de km de la Tierra.
              </p>
              <div className="text-xs text-gray-400">
                <div>• +25,000 NEOs conocidos</div>
                <div>• Órbitas monitoreadas</div>
                <div>• Evaluación de riesgo continua</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/40 via-teal-950/40 to-slate-950/60 backdrop-blur-md rounded-xl p-6 border border-emerald-900/40 shadow-lg shadow-slate-950/30">
              <h4 className="text-lg font-semibold text-white mb-3">🛰️ Observatorios Espaciales</h4>
              <p className="text-gray-300 text-sm mb-4">
                Telescopios en órbita que observan sin interferencia atmosférica las 24 horas.
              </p>
              <div className="text-xs text-gray-400">
                <div>• Sin interferencia atmosférica</div>
                <div>• Cobertura global</div>
                <div>• Detección infrarroja</div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Botones de scroll flotantes */}
      <div className="fixed right-6 bottom-6 z-20 flex flex-col space-y-3">
        {/* Scroll to Top - solo visible después de scroll */}
        {showScrollUp && (
          <button
            onClick={scrollToTop}
            className="w-12 h-12 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-110 border border-indigo-400/60"
            title="Ir al inicio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
        
        {/* Scroll to Bottom - siempre visible */}
        <button
          onClick={scrollToBottom}
          className="w-12 h-12 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-110 border border-indigo-400/60"
          title="Ir al final"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* Menu de navegación rápida */}
      <div className="fixed left-6 bottom-6 z-20">
        <div className="bg-slate-950/70 backdrop-blur-sm rounded-lg border border-indigo-900/40 p-2 shadow-lg shadow-slate-950/30">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => scrollToSection('title-section')}
              className="w-10 h-10 bg-slate-900/70 hover:bg-indigo-600/70 text-indigo-100 rounded-lg flex items-center justify-center transition-all duration-200 text-xs font-medium"
              title="Ir al título"
            >
              📚
            </button>
            <button
              onClick={() => scrollToSection('timeline-section')}
              className="w-10 h-10 bg-slate-900/70 hover:bg-indigo-600/70 text-indigo-100 rounded-lg flex items-center justify-center transition-all duration-200 text-xs font-medium"
              title="Ir al proceso"
            >
              🔄
            </button>
            <button
              onClick={() => scrollToSection('observatories-section')}
              className="w-10 h-10 bg-slate-900/70 hover:bg-indigo-600/70 text-indigo-100 rounded-lg flex items-center justify-center transition-all duration-200 text-xs font-medium"
              title="Ir a observatorios"
            >
              🏢
            </button>
            <button
              onClick={() => scrollToSection('education-section')}
              className="w-10 h-10 bg-slate-900/70 hover:bg-indigo-600/70 text-indigo-100 rounded-lg flex items-center justify-center transition-all duration-200 text-xs font-medium"
              title="Ir a educación"
            >
              🎓
            </button>
          </div>
        </div>
      </div>

      {/* Flechas de navegación flotantes */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={handlePrevStep}
          className="w-14 h-14 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-110 border border-indigo-400/60"
          title="Paso anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20">
        <button
          onClick={handleNextStep}
          className="w-14 h-14 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 hover:scale-110 border border-indigo-400/60"
          title="Siguiente paso"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </div>
      {isExiting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center space-y-6 text-white px-6">
            <h1 className="text-2xl font-semibold tracking-[0.4em] text-indigo-200">SIAER</h1>
            <div className="w-72 max-w-xs">
              <p className="text-xs text-indigo-200 uppercase tracking-[0.3em] text-center mb-4">Preparando simulador...</p>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-200 ease-out"
                  style={{ width: `${Math.round(exitProgress)}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-indigo-200 text-center uppercase tracking-[0.2em]">
                {Math.round(exitProgress)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
