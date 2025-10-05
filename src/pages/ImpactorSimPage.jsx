import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import SolarSystemVisualization from '../components/SolarSystemVisualization';

export default function ImpactorSimPage({
  onGoBack,
  solarSystemData,
  solarSystemError,
  isLoadingSolar,
  retrySolar,
}) {
  const containerRef = useRef(null);
  const [timeScale, setTimeScale] = useState(1);
  const [showPanels, setShowPanels] = useState(false);
  const [impactorData, setImpactorData] = useState(null);
  const [isLoadingImpactor, setIsLoadingImpactor] = useState(false);
  const [impactorError, setImpactorError] = useState(null);
  const [isCollisionAnalysis, setIsCollisionAnalysis] = useState(false);
  const [showAnalysisPanels, setShowAnalysisPanels] = useState(false);
  const [showSpeedMessage, setShowSpeedMessage] = useState(false);
  const [simulationDate, setSimulationDate] = useState(new Date());
  const [isSimulationFrozen, setIsSimulationFrozen] = useState(false);
  const [collisionEvent, setCollisionEvent] = useState(null);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [showImpactData, setShowImpactData] = useState(false);
  const [showNextPhaseButton, setShowNextPhaseButton] = useState(false);
  const [j2000Data, setJ2000Data] = useState(null);
  const [isLoadingJ2000, setIsLoadingJ2000] = useState(false);
  const [j2000Error, setJ2000Error] = useState(null);

  useEffect(() => {
    containerRef.current?.scrollTo(0, 0);
  }, []);

  // Actualizar fecha de simulación basada en la velocidad
  useEffect(() => {
    let intervalId;
    
    if (timeScale > 0 && !isSimulationFrozen) {
      intervalId = setInterval(() => {
        setSimulationDate(prevDate => {
          const newDate = new Date(prevDate.getTime() + (timeScale * 100)); // timeScale * 100ms
          return newDate;
        });
      }, 100); // Actualizar cada 100ms (10 veces por segundo)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeScale, isSimulationFrozen]);

  // Inicializar fecha de simulación cuando se carguen los datos J2000
  useEffect(() => {
    if (j2000Data?.generatedAt) {
      const baseDate = new Date(j2000Data.generatedAt);
      setSimulationDate(baseDate);
    }
  }, [j2000Data]);

  // Mostrar paneles con animación después de un breve delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPanels(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Cargar datos de IMPACTOR-2025 del backend
  useEffect(() => {
    const fetchImpactorData = async () => {
      setIsLoadingImpactor(true);
      setImpactorError(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/impactor/2025');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setImpactorData(data.data);
        } else {
          throw new Error(data.error || 'Error al cargar datos de IMPACTOR-2025');
        }
      } catch (error) {
        console.error('Error fetching IMPACTOR-2025 data:', error);
        setImpactorError(error.message);
      } finally {
        setIsLoadingImpactor(false);
      }
    };

    fetchImpactorData();
  }, []);

  // Cargar datos J2000 del sistema solar para esta simulación

  useEffect(() => {
    const fetchJ2000Data = async () => {
      setIsLoadingJ2000(true);
      setJ2000Error(null);
      
      try {
        const response = await fetch('http://localhost:5000/api/solar/system/j2000');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          console.log('J2000 data loaded:', data.data);
          setJ2000Data(data.data);
        } else {
          throw new Error(data.error || 'Error al cargar datos J2000');
        }
      } catch (error) {
        console.error('Error fetching J2000 data:', error);
        setJ2000Error(error.message);
      } finally {
        setIsLoadingJ2000(false);
      }
    };

    fetchJ2000Data();
  }, []);


  const handleTimeScaleChange = useCallback((event) => {
    setTimeScale(Number(event.target.value));
  }, []);

  const handleTimeScalePreset = useCallback((value) => {
    setTimeScale(value);
  }, []);

  const handleCollisionAnalysis = useCallback(() => {
    const newState = !isCollisionAnalysis;
    setIsCollisionAnalysis(newState);
    
    if (newState) {
      // Activar análisis: ocultar paneles normales y mostrar panel de análisis
      setShowPanels(false);
      setTimeout(() => {
        setShowAnalysisPanels(true);
      }, 300);
      
      // Mostrar mensaje de velocidad después de 5 segundos
      setTimeout(() => {
        setShowSpeedMessage(true);
        // Ocultar el mensaje después de 5 segundos más
        setTimeout(() => {
          setShowSpeedMessage(false);
        }, 5000);
      }, 5000);
    } else {
      // Desactivar análisis: ocultar panel de análisis y mostrar paneles normales
      setShowAnalysisPanels(false);
      setShowSpeedMessage(false);
      setTimeout(() => {
        setShowPanels(true);
      }, 300);
    }
  }, [isCollisionAnalysis]);

  const handleSimulationCollision = useCallback((event) => {
    setCollisionEvent((prev) => prev ?? event);
    setIsSimulationFrozen(true);
    setIsManuallyPaused(false);
    setShowSpeedMessage(false);
  }, []);

  const toggleManualPause = useCallback(() => {
    if (collisionEvent) {
      return;
    }

    setIsManuallyPaused((prev) => {
      const next = !prev;
      setIsSimulationFrozen(next);
      
      // Controlar animación del panel de datos de impacto y botón
      if (next) {
        // Pausar: mostrar panel de datos de impacto y botón
        setTimeout(() => {
          setShowImpactData(true);
          setShowNextPhaseButton(true);
        }, 300);
      } else {
        // Reanudar: ocultar panel de datos de impacto y botón
        setShowImpactData(false);
        setShowNextPhaseButton(false);
      }
      
      return next;
    });
  }, [collisionEvent]);

  const handleNextPhase = useCallback(() => {
    // Por ahora no hace nada, pero aquí se implementará la lógica de la siguiente fase
    console.log('Pasar a la siguiente fase - funcionalidad pendiente');
  }, []);

  const formatScale = useCallback((scale) => {
    if (scale < 60) return `${scale.toFixed(0)} s`;
    if (scale < 3600) return `${(scale / 60).toFixed(scale >= 600 ? 0 : 1)} min`;
    if (scale < 86400) return `${(scale / 3600).toFixed(scale >= 36000 ? 0 : 1)} h`;
    return `${(scale / 86400).toFixed(scale >= 86400 * 10 ? 0 : 1)} días`;
  }, []);

  // Usar datos J2000 si están disponibles, sino usar datos normales como fallback
  const planets = j2000Data?.planets || solarSystemData?.planets || [];
  const generatedAt = j2000Data?.generatedAt || solarSystemData?.generatedAt || null;
  
  // Forzar uso de J2000 si está disponible
  let finalPlanets = j2000Data?.planets || solarSystemData?.planets || [];
  const finalGeneratedAt = j2000Data?.generatedAt || solarSystemData?.generatedAt || null;
  
  // Hacer la diferencia más visible para testing
  if (j2000Data) {
    finalPlanets = finalPlanets.map(planet => {
      if (planet.name === 'Tierra') {
        return {
          ...planet,
          meanAnomalyDeg: planet.meanAnomalyDeg + 180 // Agregar 180° para hacer la diferencia más visible
        };
      }
      return planet;
    });
  }
  
  // Debug: mostrar qué datos se están usando (solo una vez)
  if (j2000Data && !window.j2000Logged) {
    console.log('✅ J2000 data loaded successfully');
    console.log('Tierra J2000 meanAnomaly:', finalPlanets.find(p => p.name === 'Tierra')?.meanAnomalyDeg);
    window.j2000Logged = true;
  }
  
  // Crear objeto IMPACTOR-2025 para la simulación
  const impactorObject = useMemo(() => {
    if (!impactorData) return null;
    
    return {
      name: impactorData.name,
      designation: impactorData.designation,
      radiusKm: impactorData.radiusKm,
      semiMajorAxisKm: impactorData.semiMajorAxisKm,
      eccentricity: impactorData.eccentricity,
      inclinationDeg: impactorData.inclinationDeg,
      longitudeOfAscendingNodeDeg: impactorData.longitudeOfAscendingNodeDeg,
      argumentOfPeriapsisDeg: impactorData.argumentOfPeriapsisDeg,
      meanAnomalyDeg: impactorData.meanAnomalyDeg,
      orbitalPeriodDays: impactorData.orbitalPeriodDays,
      color: impactorData.color,
      orbitColor: impactorData.orbitColor,
      isNeo: impactorData.isNeo,
      isImpactor: true,
      pha: impactorData.pha,
      absolute_magnitude_h: impactorData.absolute_magnitude_h,
      orbit_class: impactorData.orbit_class,
      warning: impactorData.warning
    };
  }, [impactorData]);
  
  // Combinar planetas con IMPACTOR-2025
  const allBodies = useMemo(() => {
    const bodies = [...finalPlanets];
    if (impactorObject) {
      bodies.push(impactorObject);
    }
    return bodies;
  }, [finalPlanets, impactorObject]);

  const earthBodyName = useMemo(() => {
    const match = allBodies.find(body => {
      const name = (body.name || '').toLowerCase();
      return name === 'tierra' || name === 'earth';
    });
    return match?.name || null;
  }, [allBodies]);

  // Filtrar cuerpos para análisis de choque (solo Tierra e IMPACTOR-2025)
  const collisionBodies = useMemo(() => {
    if (!isCollisionAnalysis) return allBodies;
    
    return allBodies.filter(body => {
      const isEarth = typeof body.name === "string" && ['tierra', 'earth'].includes(body.name.toLowerCase());
      const isImpactor = Boolean(body.isImpactor);
      return isEarth || isImpactor;
    });
  }, [allBodies, isCollisionAnalysis]);
  
  const initialized = finalPlanets.length > 0 && impactorData !== null;
  const isLoading = isLoadingSolar || isLoadingImpactor || isLoadingJ2000;
  const speedPresets = [1, 60, 3600, 86400, 604800, 2592000];

  return (
    <div ref={containerRef} className="flex h-screen flex-col overflow-hidden bg-gray-900 text-white">
      <header className="absolute top-0 left-0 right-0 z-30 p-4 bg-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/logo.svg" alt="SIAER logo" className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">Impactor Simulation</h1>
              <p className="text-sm text-indigo-200">Vista dedicada para explorar la fase II del impacto</p>
              {j2000Data && (
                <p className="text-xs text-yellow-300 mt-1">📅 Using reference orbital data</p>
              )}
              <button 
                onClick={() => {
                  console.log('Final planets:', finalPlanets);
                  console.log('J2000 data:', j2000Data);
                  console.log('Solar system data:', solarSystemData);
                  console.log('Tierra J2000:', finalPlanets.find(p => p.name === 'Tierra')?.meanAnomalyDeg);
                }}
                className="text-xs text-blue-300 mt-1 underline"
              >
                Debug Data
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center space-y-2">
              <button 
                onClick={handleCollisionAnalysis}
                className={`px-6 py-3 text-white rounded-lg transition-colors duration-200 font-semibold border shadow-sm ${
                  isCollisionAnalysis 
                    ? 'bg-green-600/80 hover:bg-green-500 border-green-400/60 shadow-green-900/40' 
                    : 'bg-red-600/80 hover:bg-red-500 border-red-400/60 shadow-red-900/40'
                }`}
              >
                {isCollisionAnalysis ? 'Análisis de Choque (ACTIVO)' : 'Análisis de Choque'}
              </button>
              
              {showSpeedMessage && (
                <div className="bg-yellow-600/90 text-white px-4 py-2 rounded-lg text-sm font-semibold border border-yellow-400/60 shadow-lg animate-pulse">
                  ⚡ Increase Simulator Speed
                </div>
              )}
              
            </div>
          </div>

          <button
            onClick={onGoBack}
            className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 border border-indigo-400/60 shadow-sm shadow-indigo-900/40"
          >
            <span>🚀</span>
            <span>Volver al Simulador Orbital</span>
          </button>
        </div>
      </header>

      <main className="absolute top-0 left-0 right-0 bottom-0">
        <div className="relative h-full w-full">
          {initialized ? (
            <SolarSystemVisualization
              className="h-full w-full"
              planets={collisionBodies}
              neoObjects={[]}
              generatedAt={generatedAt}
              timeScale={isSimulationFrozen ? 0 : timeScale}
              focusBodyName={isCollisionAnalysis ? earthBodyName : null}
              followFocus={isCollisionAnalysis && !isSimulationFrozen}
              enableFocusController={isCollisionAnalysis && !isSimulationFrozen}
              cameraDistanceMultiplier={1.6}
              hideOtherOrbits={isCollisionAnalysis}
              customCameraPosition={null}
              smallIndicators={isCollisionAnalysis}
              onCollision={handleSimulationCollision}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
                  <p className="text-sm text-gray-400">
                    {isLoadingSolar ? 'Loading solar system...' : 
                     isLoadingJ2000 ? 'Loading reference data...' : 
                     'Loading IMPACTOR-2025...'}
                  </p>
                </>
              ) : (
                <div className="text-center space-y-3">
                  <div className="text-red-300 text-lg">
                    {solarSystemError || j2000Error || impactorError || 'No se pudo cargar la simulación'}
                  </div>
                  <button
                    type="button"
                    onClick={retrySolar}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg border border-purple-400 transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Panel lateral izquierdo - Educación */}
      <div
        className={`fixed left-0 top-24 bottom-0 w-96 bg-transparent z-20 transition-transform duration-700 ease-out ${
          showPanels ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">📚 Orbital Education</h3>
            <p className="text-sm text-gray-300">Explanation of orbital parameters</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-indigo-200 mb-3">📊 Orbital Elements</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-emerald-400 mr-2">●</span>
                    <span className="text-white font-semibold">Semi-major axis (1.00 AU)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    The average distance from the asteroid to the Sun. IMPACTOR-2025 has the SAME orbit as Earth.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-red-400 mr-2"></div>
                      <span>IMPACTOR-2025 orbit</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-8 h-1 bg-blue-400 mr-2"></div>
                      <span>Earth orbit (IDENTICAL)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-rose-400 mr-2">●</span>
                    <span className="text-white font-semibold">Eccentricity (0.0001)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    How elliptical the orbit is. 0.0001 = practically circular, same as Earth.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <div className="w-6 h-6 border border-rose-400 rounded-full mr-2"></div>
                      <span>Nearly circular orbit</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-purple-400 mr-2">●</span>
                    <span className="text-white font-semibold">Inclination (0.0°)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    Angle between the asteroid's orbital plane and the ecliptic plane. 0° = coplanar with Earth.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <div className="w-8 h-1 bg-purple-400 mr-2"></div>
                      <span>Same plane as Earth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-rose-200 mb-3">⚡ Physical Parameters</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-amber-400 mr-2">●</span>
                    <span className="text-white font-semibold">Diameter (1.0 km)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    Asteroid size. 1 km diameter = very dangerous for Earth.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <div className="w-12 h-2 bg-red-400 rounded mr-2"></div>
                      <span>IMPACTOR-2025 (1km)</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-4 h-2 bg-gray-400 rounded mr-2"></div>
                      <span>Average building (300m)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-cyan-400 mr-2">●</span>
                    <span className="text-white font-semibold">Velocity (29.8 km/s)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    Average orbital velocity. 29.8 km/s = 107,280 km/h. Same velocity as Earth.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <span className="text-cyan-400">🚀</span>
                      <span className="ml-2">Synchronized with Earth</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 mr-2">●</span>
                    <span className="text-white font-semibold">Period (365.3 days)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    Time to complete one orbit around the Sun. IDENTICAL to Earth's year.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <span className="text-green-400">🔄</span>
                      <span className="ml-2">Synchronized with Earth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-emerald-200 mb-3">🎯 Earth Approach</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-red-400 mr-2">●</span>
                    <span className="text-white font-semibold">MOID (0.0 AU)</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    MOID = 0.0 AU means the orbits INTERSECT. IMPACT GUARANTEED.
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      <span>Earth</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                      <span>IMPACTOR-2025 (SAME ORBIT)</span>
                    </div>
                    <div className="text-red-400 text-xs mt-1">⚠️ INEVITABLE COLLISION</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-orange-400 mr-2">●</span>
                    <span className="text-white font-semibold">Apollo Class</span>
                  </div>
                  <p className="text-gray-300 ml-4 text-xs">
                    Asteroids that cross Earth's orbit. IMPACTOR-2025 is PHA (Potentially Hazardous Asteroid).
                  </p>
                  <div className="ml-4 mt-2 text-xs text-gray-400">
                    <div className="flex items-center">
                      <span className="text-orange-400">⚠️</span>
                      <span className="ml-2">PHA - Very dangerous</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-950/40 to-orange-950/40 rounded-lg p-4 border border-red-900/40">
              <h4 className="text-lg font-semibold text-red-200 mb-3">⚠️ Why is it EXTREMELY dangerous?</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>IDENTICAL orbit to Earth = guaranteed collision</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>1 km diameter = catastrophic global impact</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Perfect synchronization = impossible to avoid</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <span>Confirmed PHA = maximum deflection priority</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral derecho - Información IMPACTOR-2025 */}
      <div
        className={`fixed right-0 top-24 bottom-0 w-96 bg-transparent z-20 transition-transform duration-700 ease-out ${
          showPanels ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">🛰️ IMPACTOR-2025</h3>
            <p className="text-sm text-gray-300">Real-time orbital parameters</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-indigo-200 mb-3">📊 Orbital Elements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Semi-major axis:</span>
                  <span className="text-white font-mono">1.00 AU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Eccentricity:</span>
                  <span className="text-white font-mono">0.0001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Inclination:</span>
                  <span className="text-white font-mono">0.0°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Long. ascending node:</span>
                  <span className="text-white font-mono">0.0°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Argument of periapsis:</span>
                  <span className="text-white font-mono">0.0°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mean anomaly:</span>
                  <span className="text-white font-mono">10.72°</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-rose-200 mb-3">⚡ Physical Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Diameter:</span>
                  <span className="text-white font-mono">1.0 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Radius:</span>
                  <span className="text-white font-mono">0.5 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Orbital velocity:</span>
                  <span className="text-white font-mono">29.8 km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Orbital period:</span>
                  <span className="text-white font-mono">365.3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Absolute magnitude:</span>
                  <span className="text-white font-mono">18.5</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/60">
              <h4 className="text-lg font-semibold text-emerald-200 mb-3">🎯 Earth Approach</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">MOID (minimum distance):</span>
                  <span className="text-white font-mono">0.0 AU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Orbital class:</span>
                  <span className="text-white font-mono">Apollo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Is NEO:</span>
                  <span className="text-emerald-400 font-mono">Yes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Is PHA:</span>
                  <span className="text-rose-400 font-mono">Yes</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 rounded-lg p-4 border border-indigo-900/40">
              <h4 className="text-lg font-semibold text-indigo-200 mb-3">⚠️ Alert Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-rose-400 font-mono">VERY DANGEROUS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Trajectory:</span>
                  <span className="text-rose-400 font-mono">POTENTIAL IMPACT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Orbit:</span>
                  <span className="text-rose-400 font-mono">VERY DANGEROUS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Synchronization:</span>
                  <span className="text-white font-mono">With Earth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4"
      >
        <div className="pointer-events-auto w-full max-w-4xl rounded-2xl border border-indigo-900/40 bg-slate-950/60 px-6 py-4 shadow-xl shadow-indigo-950/30">
          <div className="flex flex-col gap-3 text-sm text-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="font-semibold text-white">Velocidad de simulación</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={toggleManualPause}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    collisionEvent
                      ? 'opacity-60 cursor-not-allowed border-slate-700 text-slate-500'
                      : isManuallyPaused || isSimulationFrozen
                        ? 'bg-emerald-600/80 border-emerald-400/60 text-white hover:bg-emerald-500/80'
                        : 'bg-indigo-600/80 border-indigo-400/60 text-white hover:bg-indigo-500/70'
                  }`}
                  disabled={Boolean(collisionEvent)}
                >
                  {isSimulationFrozen ? '▶️ Reanudar' : '⏸️ Pausar'}
                </button>
                <span className="text-indigo-200">
                  1 s real = <span className="text-indigo-300 font-semibold">{formatScale(timeScale)}</span> simulados ({timeScale.toLocaleString()} s)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Simulation Date</div>
                <div className="text-sm text-blue-300 font-mono">
                  {simulationDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </div>
            {collisionEvent && (
              <div className="text-center text-rose-400 text-sm font-semibold">
                🔴 Colisión detectada entre {collisionEvent.object1?.name} y {collisionEvent.object2?.name}. Simulación detenida.
              </div>
            )}
            <input
              type="range"
              min={1}
              max={2592000}
              step={1}
              value={timeScale}
              onChange={handleTimeScaleChange}
              className={`slider-range ${isSimulationFrozen ? 'slider-range--disabled' : ''}`}
              disabled={isSimulationFrozen}
            />
            <div className="flex flex-wrap gap-2">
              {speedPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTimeScalePreset(preset)}
                  className={`px-3 py-1 rounded-md border transition-colors ${
                    timeScale === preset
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-transparent border-white/10 text-gray-200 hover:bg-white/10'
                  } ${isSimulationFrozen ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isSimulationFrozen}
                >
                  {formatScale(preset)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Análisis de Choque - Solo derecho */}
      <div className={`fixed right-0 top-24 bottom-0 w-96 bg-transparent z-20 transition-all duration-700 ease-out ${
        isManuallyPaused 
          ? (showImpactData ? 'translate-x-0 scale-100' : 'translate-x-full scale-95')
          : (showAnalysisPanels ? 'translate-x-0 scale-100' : 'translate-x-full scale-95')
      }`}>
        <div className="h-full p-6 flex flex-col">
          <div className={`bg-transparent rounded-xl p-6 h-full overflow-y-auto transition-all duration-500 ${
            isManuallyPaused 
              ? (showImpactData ? 'opacity-100 scale-100' : 'opacity-0 scale-95')
              : (showAnalysisPanels ? 'opacity-100 scale-100' : 'opacity-0 scale-95')
          }`}>
            <div className="space-y-6">
              {/* Header */}
              <div className={`text-center border-b border-red-500/30 pb-4 transition-all duration-500 ${
                isManuallyPaused 
                  ? (showImpactData ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95')
                  : (showAnalysisPanels ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95')
              }`} style={{transitionDelay: isManuallyPaused && showImpactData ? '50ms' : '0ms'}}>
                <h2 className="text-2xl font-bold text-red-400 mb-2">
                  {isManuallyPaused ? '💥 Impact Data' : '🚨 Collision Analysis'}
                </h2>
                <p className="text-sm text-red-300">
                  {isManuallyPaused ? 'Collins-Melosh-Marcus Parameters' : 'Real-time NEO PHA Tracking'}
                </p>
              </div>

              {isManuallyPaused ? (
                // Panel de datos de impacto (cuando está pausado)
                <>
                  {/* Impact Parameters for Collins-Melosh-Marcus */}
                  <div className={`bg-red-900/20 border border-red-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '100ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
                      <span className="mr-2">🌍</span>
                      Target Parameters
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Target:</span>
                        <span className="text-red-400 font-semibold">Earth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Density:</span>
                        <span className="text-yellow-400">2.7 g/cm³ (continental)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Gravity:</span>
                        <span className="text-yellow-400">9.81 m/s²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Atmosphere:</span>
                        <span className="text-yellow-400">Present (100 km)</span>
                      </div>
                    </div>
                  </div>

                  {/* Impactor Parameters */}
                  <div className={`bg-orange-900/20 border border-orange-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '200ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-orange-300 mb-3 flex items-center">
                      <span className="mr-2">☄️</span>
                      Impactor Parameters
                    </h3>
                    
                    {/* Impactor size visualization */}
                    <div className="mb-4 p-3 bg-orange-800/20 rounded-lg border border-orange-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-orange-200 mb-2">Size Comparison</div>
                        <div className="relative w-full h-16 bg-gray-800/50 rounded border border-orange-300/30">
                          {/* Earth for scale */}
                          <div className="absolute bottom-0 left-2 w-8 h-8 bg-blue-400 rounded-full border border-blue-300"></div>
                          <div className="absolute bottom-0 left-2 -translate-y-10 text-xs text-blue-300">Earth</div>
                          {/* Impactor */}
                          <div className="absolute bottom-0 right-4 w-2 h-2 bg-orange-400 rounded-full border border-orange-300 animate-pulse"></div>
                          <div className="absolute bottom-0 right-4 -translate-y-6 text-xs text-orange-300">IMPACTOR-2025</div>
                          {/* Scale line */}
                          <div className="absolute bottom-2 left-10 right-4 h-px bg-gray-400"></div>
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">1 km diameter</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Diameter:</span>
                        <span className="text-orange-400">1.0 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Density:</span>
                        <span className="text-orange-400">3.0 g/cm³ (iron)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Mass:</span>
                        <span className="text-orange-400">1.57 × 10¹² kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Velocity:</span>
                        <span className="text-orange-400">11.2 km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Composition:</span>
                        <span className="text-orange-400">Iron-Nickel</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Geometry */}
                  <div className={`bg-purple-900/20 border border-purple-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '300ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                      <span className="mr-2">📐</span>
                      Impact Geometry
                    </h3>
                    
                    {/* Visual representation of impact angle */}
                    <div className="mb-4 p-3 bg-purple-800/20 rounded-lg border border-purple-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-purple-200 mb-1">Entry Trajectory</div>
                        <div className="relative w-full h-16 bg-gray-800/50 rounded border border-purple-300/30">
                          {/* Earth surface */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-400"></div>
                          {/* Impact trajectory */}
                          <div className="absolute bottom-1 right-4 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-orange-400 transform rotate-45 origin-bottom"></div>
                          {/* Angle indicator */}
                          <div className="absolute bottom-2 right-8 text-xs text-orange-300 font-bold">45°</div>
                          {/* Impact point */}
                          <div className="absolute bottom-0 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Entry Angle:</span>
                        <span className="text-purple-400">45° (optimal)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Azimuth:</span>
                        <span className="text-purple-400">Northeast (45°)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Latitude:</span>
                        <span className="text-purple-400">40.7128° N</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Longitude:</span>
                        <span className="text-purple-400">74.0060° W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Location:</span>
                        <span className="text-purple-400">New York City</span>
                      </div>
                    </div>
                  </div>

                  {/* Energy Calculations */}
                  <div className={`bg-blue-900/20 border border-blue-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '400ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                      <span className="mr-2">⚡</span>
                      Energy Calculations
                    </h3>
                    
                    {/* Energy comparison visualization */}
                    <div className="mb-4 p-3 bg-blue-800/20 rounded-lg border border-blue-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-blue-200 mb-2">Energy Comparison</div>
                        <div className="space-y-1">
                          {/* Hiroshima bomb bar */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-300 w-16">Hiroshima:</span>
                            <div className="flex-1 bg-gray-700 rounded h-2">
                              <div className="bg-red-400 h-2 rounded" style={{width: '1px'}}></div>
                            </div>
                            <span className="text-xs text-red-400 ml-2">15 kt</span>
                          </div>
                          {/* TNT equivalent bar */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-300 w-16">TNT:</span>
                            <div className="flex-1 bg-gray-700 rounded h-2">
                              <div className="bg-yellow-400 h-2 rounded" style={{width: '2%'}}></div>
                            </div>
                            <span className="text-xs text-yellow-400 ml-2">23.5 Mt</span>
                          </div>
                          {/* Impact energy bar */}
                          <div className="flex items-center">
                            <span className="text-xs text-gray-300 w-16">Impact:</span>
                            <div className="flex-1 bg-gray-700 rounded h-3">
                              <div className="bg-blue-400 h-3 rounded animate-pulse" style={{width: '100%'}}></div>
                            </div>
                            <span className="text-xs text-blue-400 ml-2">9.85×10¹⁹ J</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Kinetic Energy:</span>
                        <span className="text-blue-400">9.85 × 10¹⁹ J</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">TNT Equivalent:</span>
                        <span className="text-blue-400">23.5 Megatons</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Hiroshima:</span>
                        <span className="text-blue-400">1,570 × H-bomb</span>
                      </div>
                    </div>
                  </div>

                  {/* Environmental Effects Preview */}
                  <div className={`bg-green-900/20 border border-green-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '500ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                      <span className="mr-2">🌪️</span>
                      Expected Effects
                    </h3>
                    
                    {/* Crater visualization */}
                    <div className="mb-4 p-3 bg-green-800/20 rounded-lg border border-green-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-green-200 mb-2">Impact Crater Scale</div>
                        <div className="relative w-full h-20 bg-gray-800/50 rounded border border-green-300/30">
                          {/* Crater */}
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gray-600 rounded-full border-2 border-yellow-400"></div>
                          {/* Scale indicators */}
                          <div className="absolute bottom-0 left-2 text-xs text-yellow-300">0 km</div>
                          <div className="absolute bottom-0 right-2 text-xs text-yellow-300">15 km</div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs text-yellow-300">7.5 km</div>
                          {/* Fireball radius */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-orange-400 rounded-full animate-pulse opacity-60"></div>
                          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-orange-300">Fireball</div>
                        </div>
                      </div>
                    </div>

                    {/* Effects zones visualization */}
                    <div className="mb-4 p-3 bg-green-800/20 rounded-lg border border-green-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-green-200 mb-2">Destruction Zones</div>
                        <div className="relative w-full h-16 bg-gray-800/50 rounded border border-green-300/30">
                          {/* Center point */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                          {/* Zone 1 - Crater */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-red-400 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-6 text-xs text-red-400">Crater</div>
                          {/* Zone 2 - Fireball */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-orange-400 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-8 text-xs text-orange-400">Fireball</div>
                          {/* Zone 3 - Ejecta */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-yellow-400 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -translate-y-10 text-xs text-yellow-400">Ejecta</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Crater Diameter:</span>
                        <span className="text-green-400">~15 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Fireball Radius:</span>
                        <span className="text-green-400">~8 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Earthquake:</span>
                        <span className="text-green-400">7.2 Richter</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ejecta Distance:</span>
                        <span className="text-green-400">~500 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Affected Area:</span>
                        <span className="text-green-400">~785,000 km²</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Location */}
                  <div className={`bg-indigo-900/20 border border-indigo-500/40 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '600ms' : '0ms'}}>
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center">
                      <span className="mr-2">📍</span>
                      Impact Location
                    </h3>
                    
                    {/* Geographic visualization */}
                    <div className="mb-4 p-3 bg-indigo-800/20 rounded-lg border border-indigo-400/30">
                      <div className="text-center mb-2">
                        <div className="text-xs text-indigo-200 mb-2">Impact Site</div>
                        <div className="relative w-full h-20 bg-gray-800/50 rounded border border-indigo-300/30">
                          {/* Map representation */}
                          <div className="absolute inset-2 bg-gradient-to-br from-green-600/30 to-blue-600/30 rounded"></div>
                          {/* Impact point */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-yellow-400"></div>
                          {/* Coordinates */}
                          <div className="absolute top-1 left-1 text-xs text-yellow-300">40.7°N</div>
                          <div className="absolute bottom-1 right-1 text-xs text-yellow-300">74.0°W</div>
                          {/* City label */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs text-white font-bold">NYC</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Coordinates:</span>
                        <span className="text-indigo-400">40.7128° N, 74.0060° W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">City:</span>
                        <span className="text-indigo-400">New York City</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Population:</span>
                        <span className="text-indigo-400">8.4 million</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Terrain:</span>
                        <span className="text-indigo-400">Urban/Coastal</span>
                      </div>
                    </div>
                  </div>

                  {/* Collins-Melosh-Marcus Reference */}
                  <div className={`bg-slate-900/30 border border-slate-600/50 rounded-lg p-4 transition-all duration-500 ${
                    showImpactData ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`} style={{transitionDelay: showImpactData ? '700ms' : '0ms'}}>
                    <div className="flex items-start">
                      <span className="text-blue-400 text-lg mr-3">📚</span>
                      <div>
                        <h4 className="text-blue-300 font-semibold mb-2">Reference</h4>
                        <p className="text-blue-200 text-xs leading-relaxed">
                          Collins, G. S., Melosh, H. J., & Marcus, R. A. (2005). 
                          "Earth Impact Effects Program: A web-based computer program 
                          for calculating the regional environmental consequences of 
                          a meteoroid impact on Earth."
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Panel de análisis de colisión (cuando está en análisis activo)
                <>
                  {/* NEO PHA Status */}
                  <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-300 mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      NEO PHA Classification
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Status:</span>
                        <span className="text-red-400 font-semibold">POTENTIALLY HAZARDOUS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">MOID:</span>
                        <span className="text-yellow-400">{impactorData?.moid_au || 0.0} AU</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Magnitude (H):</span>
                        <span className="text-yellow-400">{impactorData?.absolute_magnitude_h || 18.5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Constant Tracking */}
                  <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                      <span className="mr-2">📡</span>
                      Continuous Monitoring
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-200 mb-1">Ground-Based Telescopes</h4>
                        <p className="text-gray-300 text-xs">
                          Automated sky surveys detect and track NEOs using optical telescopes with wide-field cameras.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-200 mb-1">Radar Observations</h4>
                        <p className="text-gray-300 text-xs">
                          Deep Space Network radar provides precise orbital measurements and physical characteristics.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-200 mb-1">Space-Based Assets</h4>
                        <p className="text-gray-300 text-xs">
                          NEOWISE and future missions provide infrared detection capabilities for dark objects.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Data */}
                  <div className="bg-green-900/20 border border-green-500/40 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                      <span className="mr-2">📊</span>
                      Current Tracking Data
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Observation:</span>
                        <span className="text-green-400">Real-time</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Observation Arc:</span>
                        <span className="text-green-400">365+ days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Uncertainty:</span>
                        <span className="text-green-400">Low (0.1%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Next Close Approach:</span>
                        <span className="text-yellow-400">TBD</span>
                      </div>
                    </div>
                  </div>

                  {/* Monitoring Systems */}
                  <div className="bg-purple-900/20 border border-purple-500/40 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                      <span className="mr-2">🛰️</span>
                      Active Monitoring Systems
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Catalina Sky Survey</span>
                        <span className="text-green-400">● Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pan-STARRS</span>
                        <span className="text-green-400">● Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">ATLAS</span>
                        <span className="text-green-400">● Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">NEOWISE</span>
                        <span className="text-green-400">● Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Goldstone Radar</span>
                        <span className="text-yellow-400">○ Standby</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-red-900/30 border border-red-600/60 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-red-200 text-sm font-semibold">
                        ⚠️ This object requires continuous monitoring due to its PHA classification and potential impact trajectory.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de siguiente fase - Parte inferior izquierda */}
      <div className={`fixed bottom-6 left-6 z-30 transition-all duration-700 ease-out ${
        showNextPhaseButton 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-95'
      }`} style={{transitionDelay: showNextPhaseButton ? '500ms' : '0ms'}}>
        <button
          onClick={handleNextPhase}
          className="px-6 py-3 bg-gradient-to-r from-purple-600/90 to-pink-600/90 hover:from-purple-500/90 hover:to-pink-500/90 text-white rounded-lg transition-all duration-300 font-semibold border border-purple-400/60 shadow-lg hover:shadow-purple-900/40 transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center space-x-2">
            <span>🚀</span>
            <span>Pasar a la Siguiente Fase</span>
          </span>
        </button>
      </div>
    </div>
  );
}
