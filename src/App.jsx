/**
 * MeteorMadness - Simulador Orbital 3D
 * Frontend React con Three.js para visualización de órbitas
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import OrbitalVisualization from './components/OrbitalVisualization';
import ControlPanel from './components/ControlPanel';
import AnimationControls from './components/AnimationControls';
import SolarSystemVisualization from './components/SolarSystemVisualization';
import MeteorMadnessAPI from './services/api';

function App() {
  // Estados principales
  const [elements, setElements] = useState({
    a: 7000,      // Semi-eje mayor (km)
    e: 0.2,       // Excentricidad
    i: 28.5,      // Inclinación (grados)
    omega: 0,     // Argumento del periapsis (grados)
    Omega: 0,     // Longitud del nodo ascendente (grados)
    M0: 0         // Anomalía media inicial (grados)
  });
  
  const [simParams, setSimParams] = useState({
    duration: 7200, // 2 horas
    timestep: 60,   // 1 minuto
  });

  const [simulationData, setSimulationData] = useState(null);
  const [presets, setPresets] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isIntroFading, setIsIntroFading] = useState(false);
  const [introProgress, setIntroProgress] = useState(5);
  const [isIntroReady, setIsIntroReady] = useState(false);
  const [introLoadDurationMs, setIntroLoadDurationMs] = useState(null);
  const [neoSearchResults, setNeoSearchResults] = useState([]);
  const [isSearchingNeo, setIsSearchingNeo] = useState(false);
  const [neoSearchError, setNeoSearchError] = useState(null);
  const [viewMode, setViewMode] = useState('solar');
  const [solarSystemData, setSolarSystemData] = useState(null);
  const [isLoadingSolar, setIsLoadingSolar] = useState(false);
  const [solarError, setSolarError] = useState(null);
  const [solarTimeScale, setSolarTimeScale] = useState(1);
  const [solarSearchQuery, setSolarSearchQuery] = useState('');
  const [solarNeoObject, setSolarNeoObject] = useState(null);
  const [isLoadingSolarNeo, setIsLoadingSolarNeo] = useState(false);
  const [solarNeoInfo, setSolarNeoInfo] = useState(null);
  const [solarNeoError, setSolarNeoError] = useState(null);

  // Estados de animación
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);

  // Referencias
  const animationRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const introDismissedRef = useRef(false);
  const introFadeTimeoutRef = useRef(null);
  const introSessionRef = useRef({ id: 0, autoDismiss: false, active: true, completed: false });
  const introStartTimeRef = useRef(Date.now());
  const neoSearchRequestIdRef = useRef(0);
  const solarSearchTimeoutRef = useRef(null);

  // Verificar conexión con backend al inicio
  useEffect(() => {
    checkBackendConnection();
    loadPresets();
  }, []);

  // Simular automáticamente cuando cambian los elementos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (connectionStatus === 'connected' && viewMode === 'orbit') {
        runSimulation();
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [elements, simParams, connectionStatus, viewMode]);

  // Manejo de la animación
  useEffect(() => {
    if (isPlaying && simulationData?.trajectory?.positions) {
      const animate = (currentTime) => {
        if (currentTime - lastFrameTimeRef.current >= (100 / animationSpeed)) {
          setCurrentFrame(prev => {
            const maxFrames = simulationData.trajectory.positions.length - 1;
            const next = prev + 1;
            
            if (next > maxFrames) {
              setIsPlaying(false);
              return maxFrames;
            }
            
            return next;
          });
          
          lastFrameTimeRef.current = currentTime;
        }
        
        if (isPlaying) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animationSpeed, simulationData]);

  useEffect(() => {
    return () => {
      if (introFadeTimeoutRef.current) {
        clearTimeout(introFadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'solar') {
      setIsPlaying(false);
      setNeoSearchResults([]);
      setNeoSearchError(null);
      setIsSearchingNeo(false);
      setSolarSearchQuery('');
      setSolarNeoError(null);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!isIntroVisible || isIntroReady || introProgress >= 100) {
      return;
    }

    const intervalId = setInterval(() => {
      setIntroProgress(prev => {
        if (prev >= 90) {
          return prev;
        }

        const increment = Math.random() * 6 + 4;
        return Math.min(prev + increment, 90);
      });
    }, 240);

    return () => clearInterval(intervalId);
  }, [introProgress, isIntroVisible, isIntroReady]);

  useEffect(() => {
    if (isIntroReady || introProgress < 100) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsIntroReady(true);
    }, 320);

    return () => clearTimeout(timeoutId);
  }, [introProgress, isIntroReady]);

  const startIntro = useCallback((autoDismiss = false) => {
    const nextId = introSessionRef.current.id + 1;
    introSessionRef.current = {
      id: nextId,
      autoDismiss,
      active: true,
      completed: false,
    };

    introStartTimeRef.current = Date.now();
    introDismissedRef.current = false;

    if (introFadeTimeoutRef.current) {
      clearTimeout(introFadeTimeoutRef.current);
      introFadeTimeoutRef.current = null;
    }

    setIntroProgress(5);
    setIntroLoadDurationMs(null);
    setIsIntroReady(false);
    setIsIntroFading(false);
    setIsIntroVisible(true);
  }, []);

  const markIntroLoaded = useCallback((sessionId) => {
    const session = introSessionRef.current;
    if (!session.active || session.completed || session.id !== sessionId) {
      return;
    }

    session.completed = true;
    setIntroProgress(100);
    setIntroLoadDurationMs(Date.now() - introStartTimeRef.current);
  }, []);

// Funciones de API
const checkBackendConnection = async () => {
    try {
      const result = await MeteorMadnessAPI.healthCheck();
      if (result.success) {
        setConnectionStatus('connected');
        setError(null);
      } else {
        setConnectionStatus('error');
        setError('No se puede conectar con el backend');
      }
    } catch (err) {
      console.error('Error al verificar el backend:', err);
      setConnectionStatus('error');
      setError('Backend no disponible en http://localhost:5000');
    }
  };

  const loadPresets = async () => {
    try {
      const result = await MeteorMadnessAPI.getPresets();
      if (result.success) {
        setPresets(result.data.presets || {});
      }
    } catch (err) {
      console.warn('No se pudieron cargar los presets:', err);
    }
  };

  const loadSolarSystemData = useCallback(async (sessionId = introSessionRef.current.id) => {
    if (connectionStatus !== 'connected') {
      setSolarError('Backend no disponible para consultar el sistema solar');
      markIntroLoaded(sessionId);
      return;
    }

    try {
      setIsLoadingSolar(true);
      setSolarError(null);
      const result = await MeteorMadnessAPI.getSolarSystemState();
      if (result.success) {
        setSolarSystemData(result.data);
      } else {
        const message = result.error?.error || result.error || 'No se pudo obtener el sistema solar';
        setSolarError(message);
      }
    } catch (err) {
      setSolarError(err.message || 'Error de comunicación al obtener el sistema solar');
    } finally {
      setIsLoadingSolar(false);
      markIntroLoaded(sessionId);
    }
  }, [connectionStatus, markIntroLoaded]);

  useEffect(() => {
    if (viewMode === 'solar' && connectionStatus === 'connected' && !solarSystemData && !isLoadingSolar) {
      loadSolarSystemData(introSessionRef.current.id);
    }
  }, [viewMode, connectionStatus, solarSystemData, isLoadingSolar, loadSolarSystemData]);

  const handleViewModeChange = useCallback((mode) => {
    if (!mode || mode === viewMode) {
      return false;
    }

    startIntro(true);
    setViewMode(mode);

    const sessionId = introSessionRef.current.id;

    if (connectionStatus !== 'connected') {
      markIntroLoaded(sessionId);
      return true;
    }

    if (mode === 'solar') {
      if (solarSystemData) {
        markIntroLoaded(sessionId);
      }
    }

    return true;
  }, [connectionStatus, markIntroLoaded, solarSystemData, startIntro, viewMode]);

  const handleSolarSpeedChange = useCallback((event) => {
    setSolarTimeScale(Number(event.target.value));
  }, []);

  const handleSolarSpeedPreset = useCallback((value) => {
    setSolarTimeScale(value);
  }, []);

  const formatSolarScale = useCallback((scale) => {
    if (scale < 60) return `${scale.toFixed(0)} s`;
    if (scale < 3600) return `${(scale / 60).toFixed(scale >= 600 ? 0 : 1)} min`;
    if (scale < 86400) return `${(scale / 3600).toFixed(scale >= 36000 ? 0 : 1)} h`;
    return `${(scale / 86400).toFixed(scale >= 86400 * 10 ? 0 : 1)} días`;
  }, []);

  const handleClearSolarNeo = useCallback(() => {
    setSolarNeoObject(null);
    setSolarNeoInfo(null);
    setSolarNeoError(null);
    setIsLoadingSolarNeo(false);
  }, []);

  const handleNeoSearch = useCallback(async (query) => {
    const trimmed = (query || '').trim();

    if (!trimmed) {
      neoSearchRequestIdRef.current += 1;
      setIsSearchingNeo(false);
      setNeoSearchError(null);
      setNeoSearchResults([]);
      return;
    }

    const requestId = neoSearchRequestIdRef.current + 1;
    neoSearchRequestIdRef.current = requestId;
    setIsSearchingNeo(true);

    try {
      const result = await MeteorMadnessAPI.searchNeoObjects(trimmed, 10);
      if (neoSearchRequestIdRef.current !== requestId) {
        return;
      }

      if (result.success) {
        setNeoSearchResults(result.data?.results || []);
        setNeoSearchError(null);
      } else {
        setNeoSearchResults([]);
        const errorMessage = result.error?.error || result.error || 'Error en la búsqueda de NEOs';
        setNeoSearchError(errorMessage);
      }
    } catch (err) {
      if (neoSearchRequestIdRef.current !== requestId) {
        return;
      }
      setNeoSearchResults([]);
      setNeoSearchError(err.message || 'Error inesperado en la búsqueda de NEOs');
    } finally {
      if (neoSearchRequestIdRef.current === requestId) {
        setIsSearchingNeo(false);
      }
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'solar') {
      if (solarSearchTimeoutRef.current) {
        clearTimeout(solarSearchTimeoutRef.current);
      }
      return;
    }

    if (solarSearchTimeoutRef.current) {
      clearTimeout(solarSearchTimeoutRef.current);
    }

    const trimmed = solarSearchQuery.trim();
    setSolarNeoError(null);
    solarSearchTimeoutRef.current = setTimeout(() => {
      if (!trimmed) {
        setIsSearchingNeo(false);
        setNeoSearchError(null);
        setNeoSearchResults([]);
        setIsLoadingSolarNeo(false);
        return;
      }
      handleNeoSearch(trimmed);
    }, 400);

    return () => {
      if (solarSearchTimeoutRef.current) {
        clearTimeout(solarSearchTimeoutRef.current);
      }
    };
  }, [solarSearchQuery, viewMode, handleNeoSearch]);

  const dismissIntro = useCallback(() => {
    if (introDismissedRef.current || !isIntroReady) {
      return;
    }

    introDismissedRef.current = true;
    introSessionRef.current.active = false;
    introSessionRef.current.autoDismiss = false;
    setIsIntroFading(true);
    introFadeTimeoutRef.current = setTimeout(() => {
      setIsIntroVisible(false);
      setIsIntroFading(false);
      introFadeTimeoutRef.current = null;
    }, 600);
  }, [isIntroReady]);

  useEffect(() => {
    if (!isIntroReady) {
      return;
    }

    if (introSessionRef.current.autoDismiss && introSessionRef.current.active && !introDismissedRef.current) {
      dismissIntro();
    }
  }, [dismissIntro, isIntroReady]);

  useEffect(() => {
    if (!isIntroVisible || introDismissedRef.current || !isIntroReady || introSessionRef.current.autoDismiss) {
      return;
    }

    const handleScrollDismiss = () => {
      dismissIntro();
    };

    const handleWheel = (event) => {
      if (!event) {
        return;
      }

      if (event.deltaY === 0 && event.deltaX === 0) {
        return;
      }

      handleScrollDismiss();
    };

    const handleTouch = () => {
      handleScrollDismiss();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('scroll', handleScrollDismiss, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('scroll', handleScrollDismiss);
    };
  }, [dismissIntro, isIntroReady, isIntroVisible]);

  const runSimulation = async () => {
    if (connectionStatus !== 'connected' || viewMode !== 'orbit') return;

    const sessionId = introSessionRef.current.id;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await MeteorMadnessAPI.simulate({
        elements,
        duration: simParams.duration,
        timestep: simParams.timestep
      });

      if (result.success) {
        setSimulationData(result.data.data);
        setCurrentFrame(0);
        setIsPlaying(false);
      } else {
        setError(result.error?.error || 'Error en la simulación');
        setSimulationData(null);
      }
    } catch (err) {
      console.error('Error al ejecutar la simulación:', err);
      setError('Error de comunicación con el backend');
      setSimulationData(null);
    } finally {
      setIsLoading(false);
      markIntroLoaded(sessionId);
    }
  };

  // Manejadores de eventos
  const handleElementsChange = useCallback((newElements) => {
    setElements(newElements);
  }, []);
  
  const handleSimParamsChange = useCallback((newParams) => {
    setSimParams(newParams);
  }, []);

  const handlePresetSelect = useCallback((presetKey, presetElements) => {
    setElements(presetElements);
  }, []);

  const handleNeoSelect = useCallback(async (item) => {
    if (!item?.designation) return;

    if (viewMode === 'solar') {
      if (connectionStatus !== 'connected') {
        setSolarNeoError('Backend no disponible para consultar datos del NEO');
        return;
      }

      setIsLoadingSolarNeo(true);
      setSolarNeoError(null);

      try {
        const result = await MeteorMadnessAPI.getNeoObject(item.designation);

        if (!result.success) {
          const message = result.error?.error || result.error || 'No se pudo obtener datos del NEO';
          setSolarNeoError(message);
          setIsSearchingNeo(false);
          return;
        }

        const data = result.data || {};
        const elements = data.simulation_elements;

        if (!elements) {
          setSolarNeoError('El NEO no cuenta con elementos orbitales disponibles');
          setIsSearchingNeo(false);
          return;
        }

        const referenceDate = solarSystemData?.generatedAt ? new Date(solarSystemData.generatedAt) : new Date();
        const epochJD = data.orbit?.epoch?.jd;
        let epochDate = referenceDate;
        if (typeof epochJD === 'number' && Number.isFinite(epochJD)) {
          const epochMs = (epochJD - 2440587.5) * 86400000;
          if (Number.isFinite(epochMs)) {
            epochDate = new Date(epochMs);
          }
        }

        const deltaSeconds = (referenceDate.getTime() - epochDate.getTime()) / 1000;
        const mu = Number(elements.mu) || 1.32712440018e11;
        const aKm = Number(elements.a);
        const eccentricity = Number(elements.e);
        const inclinationDeg = Number(elements.i);
        const ascendingNodeDeg = Number(elements.Omega);
        const periapsisDeg = Number(elements.omega);
        const meanAnomalyDeg = Number(elements.M0);

        if (!Number.isFinite(aKm) || !Number.isFinite(eccentricity)) {
          setSolarNeoError('Datos orbitales incompletos para el NEO seleccionado');
          setIsSearchingNeo(false);
          return;
        }

        const meanMotion = Math.sqrt(mu / Math.pow(aKm, 3));
        const meanAnomalyNowRad = (meanAnomalyDeg * Math.PI) / 180 + meanMotion * deltaSeconds;
        const meanAnomalyNowDeg = ((meanAnomalyNowRad * 180) / Math.PI) % 360;
        const wrappedMeanAnomalyDeg = (meanAnomalyNowDeg + 360) % 360;
        const orbitalPeriodDays = (2 * Math.PI) / meanMotion / 86400;

        const neoColor = '#7cf9ff';
        setSolarNeoObject({
          name: data.object?.full_name || item.full_name || item.designation,
          color: neoColor,
          orbitColor: neoColor,
          radiusKm: 1,
          semiMajorAxisKm: aKm,
          eccentricity,
          inclinationDeg,
          longitudeOfAscendingNodeDeg: ascendingNodeDeg,
          argumentOfPeriapsisDeg: periapsisDeg,
          meanAnomalyDeg: wrappedMeanAnomalyDeg,
          orbitalPeriodDays,
          isNeo: true,
        });
        setSolarNeoInfo({
          fullName: data.object?.full_name || item.full_name || item.designation,
          designation: data.object?.designation || item.designation,
          moidAu: data.orbit?.moid ?? item.moid_au,
          absoluteMagnitudeH: data.physical?.H ?? item.absolute_magnitude_h,
          pha: data.object?.pha ?? item.pha,
        });
        setSolarNeoError(null);
        setSolarSearchQuery('');
        setNeoSearchResults([]);
      } catch (err) {
        console.error('Error al obtener datos del NEO:', err);
        setSolarNeoError('Error de comunicación al obtener datos del NEO');
      } finally {
        setIsLoadingSolarNeo(false);
      }

      return;
    }

    if (connectionStatus !== 'connected') {
      setError('Backend no disponible para consultar datos NEO');
      return;
    }

    handleViewModeChange('orbit');
    setError(null);
    let triggeredSimulation = false;

    try {
      setIsLoading(true);
      const result = await MeteorMadnessAPI.getNeoObject(item.designation);

      if (!result.success) {
        const message = result.error?.error || result.error || 'No se pudo obtener datos del NEO';
        setError(message);
        setIsLoading(false);
        return;
      }

      const data = result.data || {};
      const simulationElements = data.simulation_elements;

      if (!simulationElements) {
        setError('El NEO no cuenta con elementos suficientes para simular');
        setIsLoading(false);
        return;
      }

      setNeoSearchResults([]);
      setElements(simulationElements);
      triggeredSimulation = true;
      setNeoSearchError(null);
    } catch (err) {
      console.error('Error al obtener datos del NEO:', err);
      setError('Error de comunicación al obtener datos del NEO');
      setIsLoading(false);
    } finally {
      if (!triggeredSimulation) {
        setIsLoading(false);
      }
    }
  }, [connectionStatus, handleViewModeChange, viewMode, solarSystemData]);

  const handleRetrySolar = useCallback(() => {
    loadSolarSystemData();
  }, [loadSolarSystemData]);

  const handlePlay = useCallback(() => {
    if (simulationData?.trajectory?.positions) {
      setIsPlaying(true);
    }
  }, [simulationData]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
  }, []);

  const handleFrameSeek = useCallback((frame) => {
    setCurrentFrame(frame);
    setIsPlaying(false);
  }, []);

  const handleSpeedChange = useCallback((speed) => {
    setAnimationSpeed(speed);
  }, []);

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  // Retry connection
  const retryConnection = () => {
    setConnectionStatus('connecting');
    checkBackendConnection();
  };

  // Render de estado de error
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg border border-gray-600 max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Backend No Disponible
          </h1>
          <p className="text-gray-400 mb-6">
            No se puede conectar con el backend de MeteorMadness en http://localhost:5000
          </p>
          <div className="space-y-3">
            <button
              onClick={retryConnection}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white rounded-lg transition-colors"
            >
              🔄 Reintentar Conexión
            </button>
            <div className="text-sm text-gray-500">
              Asegúrate de que el backend esté ejecutándose:<br/>
              <code className="text-gray-300">cd backend && python app.py</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render de estado de carga inicial
  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Conectando con el backend...</p>
        </div>
      </div>
    );
  }

  const totalFrames = simulationData?.trajectory?.positions?.length || 0;
  const solarPlanets = solarSystemData?.planets || [];
  const solarGeneratedAt = solarSystemData?.generatedAt || null;
  const isSolarReady = solarPlanets.length > 0;
  const solarSpeedPresets = [1, 60, 3600, 86400, 604800, 2592000];
  const solarTimeScaleLabel = formatSolarScale(solarTimeScale);
  const solarGeneratedLabel = solarGeneratedAt ? new Date(solarGeneratedAt).toLocaleString() : null;
  const introLoadDurationLabel = introLoadDurationMs != null
    ? introLoadDurationMs >= 1000
      ? `${(introLoadDurationMs / 1000).toFixed(introLoadDurationMs >= 5000 ? 0 : 1)} s`
      : `${Math.round(introLoadDurationMs)} ms`
    : null;

  const bottomPanelStyle = viewMode === 'orbit'
    ? {
        left: isPanelOpen
          ? 'max(1rem, min(calc(20rem + 1.5rem), calc(100% - 10rem)))'
          : '1rem',
        right: '1rem',
        transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out',
      }
    : {
        left: '1rem',
        right: '1rem',
        transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out',
      };

  // Render principal
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {isIntroVisible && (
        <div
          className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-gray-900 transition-opacity duration-700 ${isIntroFading ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex flex-col items-center space-y-6 text-white px-6">
            <h1 className="text-2xl font-semibold tracking-widest">SIAER</h1>
            <div className="w-72 max-w-xs">
              <p className="text-xs text-gray-300 uppercase tracking-[0.3em] text-center mb-4">Inicializando simulación...</p>
              <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(introProgress, 100)}%` }}
                ></div>
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center uppercase tracking-[0.2em]">
                {Math.round(Math.min(introProgress, 100))}%
              </p>
            </div>
            {isIntroReady && (
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Desplázate hacia arriba o abajo para comenzar</p>
            )}
          </div>
          {introLoadDurationLabel && (
            <div className="absolute bottom-6 left-6 text-xs text-gray-500 uppercase tracking-[0.2em]">
              Tiempo de carga: {introLoadDurationLabel}
            </div>
          )}
        </div>
      )}
      {/* Header */}
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

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800/60 border border-gray-600/50 rounded-lg px-2 py-1">
              <button
                type="button"
                onClick={() => handleViewModeChange('orbit')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'orbit'
                    ? 'bg-blue-500 text-white'
                    : 'bg-transparent text-gray-300 hover:text-white'
                }`}
              >
                Simulación NEO
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('solar')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'solar'
                    ? 'bg-purple-500 text-white'
                    : 'bg-transparent text-gray-300 hover:text-white'
                }`}
              >
                Vista Sistema Solar
              </button>
            </div>
            <button
              type="button"
              onClick={togglePanel}
              aria-pressed={isPanelOpen}
              disabled={viewMode === 'solar'}
              className={`px-3 py-2 border border-gray-500/60 rounded-lg text-sm text-white transition-colors ${
                viewMode === 'solar'
                  ? 'bg-gray-700/40 cursor-not-allowed opacity-50'
                  : 'bg-gray-700/70 hover:bg-gray-600/80'
              }`}
            >
              {isPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}
            </button>
            <div className="flex items-center text-sm text-green-300">
              <div className="w-2 h-2 bg-green-300 rounded-full mr-2"></div>
              Backend conectado
            </div>
            {error && (
              <div className="text-sm text-red-300 max-w-md truncate">
                ⚠️ {error}
              </div>
            )}
            {solarError && viewMode === 'solar' && (
              <div className="text-sm text-red-300 max-w-md truncate">
                ⚠️ {solarError}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          {viewMode === 'solar' ? (
            isSolarReady ? (
              <SolarSystemVisualization
                className="h-full w-full"
                planets={solarPlanets}
                neoObjects={solarNeoObject ? [solarNeoObject] : []}
                generatedAt={solarGeneratedAt}
                timeScale={solarTimeScale}
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-300">
                {isLoadingSolar ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
                    <p className="text-sm text-gray-400">Cargando sistema solar...</p>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-red-300 text-lg">
                      {solarError || 'No se pudo cargar el sistema solar'}
                    </div>
                    <button
                      type="button"
                      onClick={handleRetrySolar}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg border border-purple-400 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            <OrbitalVisualization
              simulationData={simulationData}
              currentFrame={currentFrame}
              isPlaying={isPlaying}
              showTrajectory={true}
              showInfo={true}
              className="h-full w-full"
            />
          )}

          {viewMode === 'solar' && (
            <div className="pointer-events-none absolute top-24 right-6 z-30 flex flex-col w-80 max-w-full">
              <div className="pointer-events-auto bg-transparent border border-transparent rounded-2xl p-4 space-y-3 text-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-100 mb-2">Buscador NEO</h3>
                  <input
                    type="text"
                    value={solarSearchQuery}
                    onChange={(e) => setSolarSearchQuery(e.target.value)}
                    placeholder="Nombre o designación (ej. Apophis)"
                    className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                {neoSearchError && (
                  <div className="text-xs text-red-400">
                    {typeof neoSearchError === 'string' ? neoSearchError : neoSearchError.error}
                  </div>
                )}
                {isSearchingNeo && (
                  <div className="text-xs text-gray-300">Buscando objetos cercanos...</div>
                )}
                {isLoadingSolarNeo && (
                  <div className="text-xs text-purple-300">Cargando órbita seleccionada...</div>
                )}
                {solarNeoError && (
                  <div className="text-xs text-red-400">{solarNeoError}</div>
                )}
                {!isSearchingNeo && neoSearchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto border border-transparent rounded-lg divide-y divide-transparent">
                    {neoSearchResults.map((item) => (
                      <button
                        key={item.designation || item.full_name}
                        onClick={() => handleNeoSelect(item)}
                        className="w-full text-left px-3 py-2 bg-transparent hover:bg-white/10 transition-colors text-sm text-gray-100"
                        type="button"
                      >
                        <div className="font-semibold">
                          {item.full_name || item.designation}
                        </div>
                        <div className="text-xs text-gray-300 flex flex-wrap gap-2 mt-1">
                          {item.moid_au !== undefined && (
                            <span>MOID: {item.moid_au}</span>
                          )}
                          {item.absolute_magnitude_h !== undefined && (
                            <span>H: {item.absolute_magnitude_h}</span>
                          )}
                          {item.pha !== undefined && (
                            <span>{item.pha ? '⚠️ PHA' : 'PHA: No'}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {!isSearchingNeo && !neoSearchResults.length && solarSearchQuery.trim() !== '' && !neoSearchError && (
                  <div className="text-xs text-gray-300">Sin resultados para "{solarSearchQuery}"</div>
                )}
                {solarNeoInfo && (
                  <div className="text-xs text-gray-200 bg-transparent border border-transparent rounded-lg p-3 space-y-1">
                    <div className="text-sm text-gray-100 font-semibold">NEO en vista:</div>
                    <div>{solarNeoInfo.fullName || solarNeoInfo.designation}</div>
                    {solarNeoInfo.moidAu !== undefined && solarNeoInfo.moidAu !== null && (
                      <div>MOID: {solarNeoInfo.moidAu} au</div>
                    )}
                    {solarNeoInfo.absoluteMagnitudeH !== undefined && solarNeoInfo.absoluteMagnitudeH !== null && (
                      <div>Magnitud H: {solarNeoInfo.absoluteMagnitudeH}</div>
                    )}
                    {solarNeoInfo.pha !== undefined && (
                      <div>{solarNeoInfo.pha ? '⚠️ Potencialmente peligroso (PHA)' : 'No catalogado como PHA'}</div>
                    )}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleClearSolarNeo}
                        className="px-3 py-1 text-[11px] rounded-md border border-purple-500 text-purple-200 hover:bg-purple-900/50"
                      >
                        Quitar órbita NEO
                      </button>
                    </div>
                  </div>
                )}
                <div className="text-[11px] text-gray-300">
                  Seleccionar un NEO añadirá su órbita a la vista del sistema solar.
                </div>
              </div>
            </div>
          )}

          {viewMode === 'orbit' && (
            <div className="pointer-events-none absolute inset-0 z-20 flex">
              <div
                className={`mt-24 mb-6 ml-4 w-80 max-h-[calc(100%-7rem)] overflow-y-auto rounded-2xl border border-transparent bg-transparent transition-all duration-300 ease-in-out transform ${
                  isPanelOpen
                    ? 'pointer-events-auto translate-x-0 opacity-100'
                    : 'pointer-events-none -translate-x-[calc(100%+1.5rem)] opacity-0'
                }`}
              >
                <ControlPanel
                  elements={elements}
                  onElementsChange={handleElementsChange}
                  presets={presets}
                  onPresetSelect={handlePresetSelect}
                  simulationData={simulationData}
                  isLoading={isLoading}
                  simParams={simParams}
                  onSimParamsChange={handleSimParamsChange}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {viewMode === 'orbit' && (
          <div
            className="pointer-events-none fixed bottom-6 z-20 flex justify-center"
            style={bottomPanelStyle}
          >
            <div className="pointer-events-auto mx-4 w-full max-w-5xl rounded-2xl border border-transparent bg-transparent">
              <AnimationControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onReset={handleReset}
                currentFrame={currentFrame}
                totalFrames={totalFrames}
                onFrameSeek={handleFrameSeek}
                speed={animationSpeed}
                onSpeedChange={handleSpeedChange}
                simulationData={simulationData}
                disabled={isLoading || !simulationData}
                className="rounded-2xl"
              />
            </div>
          </div>
        )}

        {viewMode === 'solar' && (
          <div
            className="pointer-events-none fixed bottom-6 z-20 flex justify-center w-full"
            style={{ left: '1rem', right: '1rem', transition: 'left 0.3s ease-in-out, right 0.3s ease-in-out' }}
          >
            <div className="pointer-events-auto mx-4 w-full max-w-4xl rounded-2xl border border-transparent bg-transparent px-6 py-4">
              <div className="flex flex-col gap-3 text-sm text-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="font-semibold text-gray-100">Velocidad de simulación</span>
                  <span className="text-gray-300">
                    1 s real = <span className="text-purple-300 font-semibold">{solarTimeScaleLabel}</span> simulados ({solarTimeScale.toLocaleString()} s)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2592000}
                  step={1}
                  value={solarTimeScale}
                  onChange={handleSolarSpeedChange}
                  className={`slider-range ${isLoadingSolar ? 'slider-range--disabled' : ''}`}
                />
                <div className="flex items-center flex-wrap gap-2">
                  {solarSpeedPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSolarSpeedPreset(preset)}
                      className={`px-3 py-1 rounded-md border transition-colors ${
                        solarTimeScale === preset
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-transparent border-white/10 text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      {formatSolarScale(preset)}
                    </button>
                  ))}
                </div>
                {solarGeneratedLabel && (
                  <div className="text-xs text-gray-300">
                    Datos generados: <span className="text-gray-100">{solarGeneratedLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
