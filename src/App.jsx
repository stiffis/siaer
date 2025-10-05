/**
 * MeteorMadness - Simulador Orbital 3D
 * Frontend React con Three.js para visualización de órbitas
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import SolarSystemVisualization from './components/SolarSystemVisualization';
import ImpactorPage from './pages/ImpactorPage';
import ImpactorSimPage from './pages/ImpactorSimPage';
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
  const [impactorObject, setImpactorObject] = useState(null);
  const [isLoadingImpactor, setIsLoadingImpactor] = useState(false);
  const [impactorError, setImpactorError] = useState(null);
  const [collisions, setCollisions] = useState([]);
  const [showCollisionNotifications, setShowCollisionNotifications] = useState(true);
  const [neoTimeScale, setNeoTimeScale] = useState(1);
  const [currentNeoOrbit, setCurrentNeoOrbit] = useState(null);
  const [currentNeoName, setCurrentNeoName] = useState('NEO');
  const [showImpactorPage, setShowImpactorPage] = useState(false);
  const [showImpactorSimPage, setShowImpactorSimPage] = useState(false);

  // Estados de animación
  // Referencias
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

  useEffect(() => {
    return () => {
      if (introFadeTimeoutRef.current) {
        clearTimeout(introFadeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'solar') {
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

  const handleGoBackFromImpactor = useCallback(() => {
    startIntro(true);
    const sessionId = introSessionRef.current.id;
    setShowImpactorPage(false);

    setTimeout(() => {
      markIntroLoaded(sessionId);
    }, 600);
  }, [markIntroLoaded, startIntro]);

  const handleImpactorSimBack = useCallback(() => {
    startIntro(true);
    const sessionId = introSessionRef.current.id;
    setShowImpactorSimPage(false);

    setTimeout(() => {
      markIntroLoaded(sessionId);
    }, 600);
  }, [markIntroLoaded, startIntro]);

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

  const simulationElementsToOrbitData = useCallback((elements, name = 'NEO') => {
    if (!elements) {
      return null;
    }

    const semiMajorAxisKm = Number(elements.a);
    const eccentricity = Number(elements.e);
    const inclinationDeg = Number(elements.i);
    const longitudeOfAscendingNodeDeg = Number(elements.Omega);
    const argumentOfPeriapsisDeg = Number(elements.omega);
    const meanAnomalyDeg = Number(elements.M0);
    const mu = Number(elements.mu);

    const resolvedMu = Number.isFinite(mu) ? mu : 3.986004418e5;

    if (!Number.isFinite(semiMajorAxisKm)) {
      return null;
    }

    const orbitalPeriodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisKm, 3) / resolvedMu);

    return {
      name,
      semiMajorAxisKm,
      eccentricity: Number.isFinite(eccentricity) ? eccentricity : 0,
      inclinationDeg: Number.isFinite(inclinationDeg) ? inclinationDeg : 0,
      longitudeOfAscendingNodeDeg: Number.isFinite(longitudeOfAscendingNodeDeg) ? longitudeOfAscendingNodeDeg : 0,
      argumentOfPeriapsisDeg: Number.isFinite(argumentOfPeriapsisDeg) ? argumentOfPeriapsisDeg : 0,
      meanAnomalyDeg: Number.isFinite(meanAnomalyDeg) ? meanAnomalyDeg : 0,
      orbitalPeriodDays: orbitalPeriodSeconds / 86400,
      mu: resolvedMu,
    };
  }, []);

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

  // Inicializar currentNeoOrbit cuando los elementos cambien
  useEffect(() => {
    if (viewMode === 'orbit') {
      const orbit = simulationElementsToOrbitData(elements, currentNeoName);
      if (orbit) {
        setCurrentNeoOrbit(prevOrbit => {
          const currentColor = prevOrbit?.color || prevOrbit?.orbitColor || '#2B7BFF';
          return { ...orbit, color: currentColor, orbitColor: currentColor };
        });
      }
    }
  }, [elements, simulationElementsToOrbitData, currentNeoName, viewMode]);

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
    if (connectionStatus !== 'connected') {
      return;
    }

    if (!solarSystemData && !isLoadingSolar) {
      loadSolarSystemData();
    }
  }, [connectionStatus, solarSystemData, isLoadingSolar, loadSolarSystemData]);

  useEffect(() => {
    // Cargar datos del sistema solar tanto para vista solar como para simulación NEO (necesitamos datos de la Tierra)
    if (connectionStatus === 'connected' && !solarSystemData && !isLoadingSolar) {
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

  const handleAdvancePhase = useCallback(() => {
    startIntro(true);
    const sessionId = introSessionRef.current.id;
    setShowImpactorPage(false);
    setShowImpactorSimPage(true);

    setTimeout(() => {
      markIntroLoaded(sessionId);
    }, 600);
  }, [markIntroLoaded, startIntro]);

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

  const handleLoadImpactor2025 = useCallback(async () => {
    if (connectionStatus !== 'connected') {
      setImpactorError('Backend no disponible para cargar IMPACTOR-2025');
      return;
    }

    setIsLoadingImpactor(true);
    setImpactorError(null);

    try {
      const result = await MeteorMadnessAPI.getImpactor2025();

      if (!result.success) {
        const message = result.error?.error || result.error || 'No se pudo obtener datos de IMPACTOR-2025';
        setImpactorError(message);
        return;
      }

      const data = result.data || {};
      const elements = data.simulation_elements;

      if (!elements) {
        setImpactorError('IMPACTOR-2025 no cuenta con elementos orbitales disponibles');
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
        setImpactorError('Datos orbitales incompletos para IMPACTOR-2025');
        return;
      }

      const meanMotion = Math.sqrt(mu / Math.pow(aKm, 3));
      const meanAnomalyNowRad = (meanAnomalyDeg * Math.PI) / 180 + meanMotion * deltaSeconds;
      const meanAnomalyNowDeg = ((meanAnomalyNowRad * 180) / Math.PI) % 360;
      const wrappedMeanAnomalyDeg = (meanAnomalyNowDeg + 360) % 360;
      const orbitalPeriodDays = (2 * Math.PI) / meanMotion / 86400;

      const impactorColor = '#ff4444';
      const impactorName = data.name || 'IMPACTOR-2025';
      setImpactorObject({
        name: impactorName,
        color: impactorColor,
        orbitColor: impactorColor,
        radiusKm: data.radiusKm || 0.5,
        semiMajorAxisKm: aKm,
        eccentricity,
        inclinationDeg,
        longitudeOfAscendingNodeDeg: ascendingNodeDeg,
        argumentOfPeriapsisDeg: periapsisDeg,
        meanAnomalyDeg: wrappedMeanAnomalyDeg,
        orbitalPeriodDays,
        isNeo: true,
        isImpactor: true,
      });
      setCurrentNeoName(impactorName);
      setCurrentNeoOrbit({
        name: impactorName,
        semiMajorAxisKm: aKm,
        eccentricity,
        inclinationDeg,
        longitudeOfAscendingNodeDeg: ascendingNodeDeg,
        argumentOfPeriapsisDeg: periapsisDeg,
        meanAnomalyDeg: wrappedMeanAnomalyDeg,
        orbitalPeriodDays,
        mu,
        color: impactorColor,
        orbitColor: impactorColor,
        isImpactor: true,
      });
      setImpactorError(null);
    } catch (err) {
      console.error('Error al obtener datos de IMPACTOR-2025:', err);
      setImpactorError('Error de comunicación al obtener datos de IMPACTOR-2025');
    } finally {
      setIsLoadingImpactor(false);
    }
  }, [connectionStatus, solarSystemData]);

  const handleClearImpactor = useCallback(() => {
    setImpactorObject(null);
    setImpactorError(null);
    setIsLoadingImpactor(false);
    setCurrentNeoOrbit(null);
    setCurrentNeoName('NEO');
  }, []);

  const handleLoadImpactorForNeoSimulation = useCallback(async () => {
    if (connectionStatus !== 'connected') {
      setError('Backend no disponible para cargar IMPACTOR-2025');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await MeteorMadnessAPI.getImpactor2025();

      if (!result.success) {
        const message = result.error?.error || result.error || 'No se pudo obtener datos de IMPACTOR-2025';
        setError(message);
        return;
      }

      const data = result.data || {};
      const impactorElements = data.simulation_elements;

      if (!impactorElements) {
        setError('IMPACTOR-2025 no cuenta con elementos orbitales disponibles');
        return;
      }

      // Configurar elementos orbitales para la simulación NEO
      const neoElements = {
        a: Number(impactorElements.a),
        e: Number(impactorElements.e), 
        i: Number(impactorElements.i),
        omega: Number(impactorElements.omega),
        Omega: Number(impactorElements.Omega),
        M0: Number(impactorElements.M0)
      };

      setElements(neoElements);
      setCurrentNeoName('IMPACTOR-2025');
      
      // Crear órbita para visualización
      const orbit = simulationElementsToOrbitData(neoElements, 'IMPACTOR-2025');
      if (orbit) {
        setCurrentNeoOrbit({ 
          ...orbit, 
          color: '#ff4444', 
          orbitColor: '#ff4444',
          isImpactor: true 
        });
      }

      setError(null);
    } catch (err) {
      console.error('Error al obtener datos de IMPACTOR-2025:', err);
      setError('Error de comunicación al obtener datos de IMPACTOR-2025');
    } finally {
      setIsLoading(false);
    }
  }, [connectionStatus, simulationElementsToOrbitData]);

  const handleCollision = useCallback((collisionData) => {
    const collision = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      object1: collisionData.object1.name,
      object2: collisionData.object2.name,
      distance: collisionData.distance,
      threshold: collisionData.threshold,
      time: collisionData.time,
      entryAngle: collisionData.entryAngle,
      relativeVelocity: collisionData.relativeVelocity,
      impactType: collisionData.impactType,
      collisionType: collisionData.collisionType
    };
    
    setCollisions(prev => [collision, ...prev.slice(0, 9)]); // Mantener solo las últimas 10 colisiones
    
    // Mostrar notificación temporal
    if (showCollisionNotifications) {
      // Crear notificación visual temporal
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg border border-red-500 max-w-sm';
      
      // Determinar el emoji según el tipo de colisión
      let emoji = '💥';
      let title = '¡COLISIÓN DETECTADA!';
      
      if (collisionData.collisionType === 'ATMOSPHERIC_ENTRY') {
        emoji = '🌍';
        title = '¡ENTRADA ATMOSFÉRICA!';
      } else if (collisionData.collisionType === 'SURFACE_IMPACT') {
        emoji = '💥';
        title = '¡IMPACTO SUPERFICIAL!';
      }
      
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <span class="text-xl">${emoji}</span>
          <div>
            <div class="font-semibold">${title}</div>
            <div class="text-sm">${collision.object1} ↔ ${collision.object2}</div>
            <div class="text-xs opacity-75">${collision.timestamp}</div>
            <div class="text-xs opacity-75">Ángulo: ${collisionData.entryAngle?.toFixed(1)}°</div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remover después de 7 segundos (más tiempo para leer la información)
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 7000);
    }
  }, [showCollisionNotifications]);

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

        const name = currentNeoName || 'NEO';
        const orbit = simulationElementsToOrbitData(elements, name);
        if (orbit) {
          const previousColor = currentNeoOrbit?.color || currentNeoOrbit?.orbitColor || '#2B7BFF';
          setCurrentNeoOrbit({ ...orbit, color: previousColor, orbitColor: previousColor });
        }
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
    setCurrentNeoName('Simulación personalizada');
  }, []);
  
  const handleSimParamsChange = useCallback((newParams) => {
    setSimParams(newParams);
  }, []);

  const handlePresetSelect = useCallback((presetKey, presetElements) => {
    setElements(presetElements);

    const preset = presets[presetKey];
    const presetName = preset?.name || presetKey || 'Preset';
    setCurrentNeoName(presetName);

    const referenceElements = preset?.elements || presetElements;
    const orbit = simulationElementsToOrbitData(referenceElements, presetName);
    if (orbit) {
      const presetColor = preset?.color || preset?.orbitColor || '#2B7BFF';
      setCurrentNeoOrbit({ ...orbit, color: presetColor, orbitColor: presetColor });
    }
  }, [presets, simulationElementsToOrbitData]);

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
        const neoName = data.object?.full_name || item.full_name || item.designation;
        setSolarNeoObject({
          name: neoName,
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

        setCurrentNeoName(neoName || 'NEO');
        setCurrentNeoOrbit({
          name: neoName || 'NEO',
          semiMajorAxisKm: aKm,
          eccentricity,
          inclinationDeg,
          longitudeOfAscendingNodeDeg: ascendingNodeDeg,
          argumentOfPeriapsisDeg: periapsisDeg,
          meanAnomalyDeg: wrappedMeanAnomalyDeg,
          orbitalPeriodDays,
          mu,
          color: neoColor,
          orbitColor: neoColor,
        });
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

      const neoName = data.object?.full_name || item.full_name || item.designation;
      setCurrentNeoName(neoName || 'NEO');
      const orbitFromElements = simulationElementsToOrbitData(simulationElements, neoName || 'NEO');
      const neoColor = '#7cf9ff';
      if (orbitFromElements) {
        setCurrentNeoOrbit({ ...orbitFromElements, color: neoColor, orbitColor: neoColor });
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
  }, [connectionStatus, handleViewModeChange, viewMode, solarSystemData, simulationElementsToOrbitData]);

  const handleRetrySolar = useCallback(() => {
    loadSolarSystemData();
  }, [loadSolarSystemData]);

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

  const solarPlanets = solarSystemData?.planets || [];
  const solarGeneratedAt = solarSystemData?.generatedAt || null;
  const isSolarReady = solarPlanets.length > 0;
  const speedPresets = [1, 60, 3600, 86400, 604800, 2592000];
  const solarSpeedPresets = speedPresets;
  const neoSpeedPresets = speedPresets;
  const solarTimeScaleLabel = formatSolarScale(solarTimeScale);
  const neoTimeScaleLabel = formatSolarScale(neoTimeScale);
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
  
  // Si se debe mostrar la página de impactos, renderizarla en lugar del contenido principal
  if (showImpactorSimPage) {
    return (
      <ImpactorSimPage
        onGoBack={handleImpactorSimBack}
        solarSystemData={solarSystemData}
        solarSystemError={solarError}
        isLoadingSolar={isLoadingSolar}
        retrySolar={handleRetrySolar}
      />
    );
  }

  if (showImpactorPage) {
    return <ImpactorPage onGoBack={handleGoBackFromImpactor} onAdvancePhase={handleAdvancePhase} />;
  }

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
              <div className="space-y-4">
                <p className="text-xs text-gray-400 uppercase tracking-[0.2em]">Desplázate hacia arriba o abajo para comenzar</p>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setShowImpactorPage(true)}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    🚀 IMPACTOR-2025
                  </button>
                  <p className="text-xs text-gray-500 text-center">Analiza efectos de impactos de asteroides</p>
                </div>
              </div>
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
                neoObjects={[...(solarNeoObject ? [solarNeoObject] : []), ...(impactorObject ? [impactorObject] : [])]}
                generatedAt={solarGeneratedAt}
                timeScale={solarTimeScale}
                onCollision={handleCollision}
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
            <div className="h-full w-full" />
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

          {viewMode === 'solar' && (
            <div className="pointer-events-none absolute top-96 right-6 z-30 flex flex-col w-80 max-w-full">
              <div className="pointer-events-auto bg-transparent border border-transparent rounded-2xl p-4 space-y-3 text-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-100 mb-2">IMPACTOR-2025</h3>
                  <div className="text-xs text-gray-300 mb-3">
                    Meteorito hipotético con trayectoria de impacto potencial
                  </div>
                  {impactorError && (
                    <div className="text-xs text-red-400 mb-3">
                      {typeof impactorError === 'string' ? impactorError : impactorError.error}
                    </div>
                  )}
                  {isLoadingImpactor && (
                    <div className="text-xs text-red-300 mb-3">Cargando IMPACTOR-2025...</div>
                  )}
                  {impactorObject && (
                    <div className="text-xs text-gray-200 bg-transparent border border-transparent rounded-lg p-3 space-y-1 mb-3">
                      <div className="text-sm text-gray-100 font-semibold">IMPACTOR-2025 en vista:</div>
                      <div className="text-red-300 font-semibold">⚠️ Objeto con trayectoria de impacto potencial</div>
                      <div>Período orbital: {impactorObject.orbitalPeriodDays.toFixed(1)} días</div>
                      <div>Semi-eje mayor: {(impactorObject.semiMajorAxisKm / 149597870.7).toFixed(3)} AU</div>
                      <div>Excentricidad: {impactorObject.eccentricity.toFixed(3)}</div>
                      <div>Inclinación: {impactorObject.inclinationDeg.toFixed(1)}°</div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleClearImpactor}
                          className="px-3 py-1 text-[11px] rounded-md border border-red-500 text-red-200 hover:bg-red-900/50"
                        >
                          Quitar IMPACTOR-2025
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLoadImpactor2025}
                    disabled={isLoadingImpactor || connectionStatus !== 'connected'}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                      isLoadingImpactor || connectionStatus !== 'connected'
                        ? 'bg-gray-700/40 border-gray-500/60 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600/80 border-red-500 text-white hover:bg-red-700/90'
                    }`}
                  >
                    {isLoadingImpactor ? 'Cargando...' : '🚀 Cargar IMPACTOR-2025'}
                  </button>
                </div>
                <div className="text-[11px] text-gray-300">
                  IMPACTOR-2025 es un meteorito hipotético con parámetros orbitales específicos para simulación educativa.
                </div>
              </div>
            </div>
          )}

          {viewMode === 'solar' && (
            <div className="pointer-events-none absolute top-24 left-6 z-30 flex flex-col w-80 max-w-full">
              <div className="pointer-events-auto bg-transparent border border-transparent rounded-2xl p-4 space-y-3 text-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-100">Detección de Colisiones</h3>
                    <button
                      type="button"
                      onClick={() => setShowCollisionNotifications(!showCollisionNotifications)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        showCollisionNotifications
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-gray-600 border-gray-500 text-gray-300'
                      }`}
                    >
                      {showCollisionNotifications ? '🔔 ON' : '🔕 OFF'}
                    </button>
                  </div>
                  
                  {collisions.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {collisions.map((collision) => (
                        <div key={collision.id} className="bg-red-900/30 border border-red-500/50 rounded p-2 text-xs">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="text-red-400">
                              {collision.collisionType === 'ATMOSPHERIC_ENTRY' ? '🌍' : 
                               collision.collisionType === 'SURFACE_IMPACT' ? '💥' : '⚠️'}
                            </span>
                            <span className="font-semibold text-red-300">
                              {collision.collisionType === 'ATMOSPHERIC_ENTRY' ? 'ENTRADA ATMOSFÉRICA' :
                               collision.collisionType === 'SURFACE_IMPACT' ? 'IMPACTO SUPERFICIAL' : 'COLISIÓN'}
                            </span>
                          </div>
                          <div className="text-gray-200 space-y-1">
                            <div className="font-medium">{collision.object1} ↔ {collision.object2}</div>
                            <div className="text-gray-400 text-[10px]">{collision.timestamp}</div>
                            <div className="grid grid-cols-2 gap-1 text-[10px]">
                              <div>Distancia: {(collision.distance / 1000).toFixed(1)} km</div>
                              <div>Umbral: {(collision.threshold / 1000).toFixed(1)} km</div>
                              <div>Ángulo: {collision.entryAngle?.toFixed(1)}°</div>
                              <div>Velocidad: {(collision.relativeVelocity / 1000).toFixed(1)} km/s</div>
                            </div>
                            <div className="text-[10px] text-yellow-300">
                              Tipo: {collision.impactType?.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No se han detectado colisiones
                    </div>
                  )}
                  
                  <div className="text-[11px] text-gray-300 mt-2">
                    El sistema detecta automáticamente cuando dos objetos están muy cerca.
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'orbit' && (
            <div className="pointer-events-none absolute top-24 right-6 z-30 flex flex-col w-80 max-w-full">
              <div className="pointer-events-auto bg-transparent border border-transparent rounded-2xl p-4 space-y-3 text-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-100 mb-2">IMPACTOR-2025</h3>
                  <div className="text-xs text-gray-300 mb-3">
                    Cargar meteorito hipotético para simulación de impacto
                  </div>
                  {error && currentNeoName === 'IMPACTOR-2025' && (
                    <div className="text-xs text-red-400 mb-3">
                      {typeof error === 'string' ? error : error.error}
                    </div>
                  )}
                  {isLoading && currentNeoName === 'IMPACTOR-2025' && (
                    <div className="text-xs text-red-300 mb-3">Cargando IMPACTOR-2025...</div>
                  )}
                  {currentNeoName === 'IMPACTOR-2025' && currentNeoOrbit && (
                    <div className="text-xs text-gray-200 bg-transparent border border-transparent rounded-lg p-3 space-y-1 mb-3">
                      <div className="text-sm text-gray-100 font-semibold">IMPACTOR-2025 cargado:</div>
                      <div className="text-red-300 font-semibold">⚠️ Objeto con trayectoria de impacto potencial</div>
                      <div>Período orbital: {currentNeoOrbit.orbitalPeriodDays?.toFixed(1)} días</div>
                      <div>Semi-eje mayor: {(currentNeoOrbit.semiMajorAxisKm / 149597870.7).toFixed(3)} AU</div>
                      <div>Excentricidad: {currentNeoOrbit.eccentricity?.toFixed(3)}</div>
                      <div>Inclinación: {currentNeoOrbit.inclinationDeg?.toFixed(1)}°</div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleLoadImpactorForNeoSimulation}
                    disabled={isLoading || connectionStatus !== 'connected'}
                    className={`w-full px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
                      isLoading || connectionStatus !== 'connected'
                        ? 'bg-gray-700/40 border-gray-500/60 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600/80 border-red-500 text-white hover:bg-red-700/90'
                    }`}
                  >
                    {isLoading && currentNeoName === 'IMPACTOR-2025' ? 'Cargando...' : '🚀 Cargar IMPACTOR-2025'}
                  </button>
                </div>
                <div className="text-[11px] text-gray-300">
                  Esto cargará los elementos orbitales de IMPACTOR-2025 en la simulación.
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
            className="pointer-events-none fixed bottom-6 z-20 flex justify-center w-full"
            style={bottomPanelStyle}
          >
            <div className="pointer-events-auto mx-4 w-full max-w-4xl rounded-2xl border border-transparent bg-transparent px-6 py-4">
              <div className="flex flex-col gap-3 text-sm text-gray-200">
                <div className="text-xs text-gray-300">
                  Objeto simulado: <span className="text-gray-100 font-semibold">{currentNeoName}</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <span className="font-semibold text-gray-100">Velocidad de simulación</span>
                  <span className="text-gray-300">
                    1 s real = <span className="text-purple-300 font-semibold">{neoTimeScaleLabel}</span> simulados ({neoTimeScale.toLocaleString()} s)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2592000}
                  step={1}
                  value={neoTimeScale}
                  onChange={(event) => setNeoTimeScale(Number(event.target.value))}
                  className="slider-range"
                />
                <div className="flex items-center flex-wrap gap-2">
                  {neoSpeedPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNeoTimeScale(preset)}
                      className={`px-3 py-1 rounded-md border transition-colors ${
                        neoTimeScale === preset
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
