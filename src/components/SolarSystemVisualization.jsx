import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Line, Text, Stars, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SCALE_FACTOR = 1 / 1_000_000; // Reducir unidades para la visualización
const SUN_RADIUS_KM = 695_700;

const degToRad = THREE.MathUtils.degToRad;

// Constantes físicas
const AU_IN_KM = 149597870.7;
const SUN_MU = 1.32712440018e11; // km³/s²
const EARTH_RADIUS_KM = 6371;
const ATMOSPHERE_HEIGHT_KM = 100;

// Funciones de cálculo orbital
function calculateOrbitalVelocity(elements, trueAnomaly) {
  const a = elements.semiMajorAxisKm;
  const e = elements.eccentricity;
  const mu = elements.mu || SUN_MU;
  
  // Distancia al Sol en el punto actual
  const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));
  
  // Velocidad orbital usando ecuación vis-viva
  const v = Math.sqrt(mu * (2/r - 1/a));
  
  // Componentes de velocidad
  const vTangential = v * Math.cos(trueAnomaly);
  const vRadial = v * Math.sin(trueAnomaly);
  
  return {
    magnitude: v,
    tangential: vTangential,
    radial: vRadial,
    distance: r
  };
}

function calculateVelocityVector(elements, trueAnomaly) {
  const velocity = calculateOrbitalVelocity(elements, trueAnomaly);
  
  // Convertir a coordenadas cartesianas en el plano orbital
  const xVel = -velocity.magnitude * Math.sin(trueAnomaly);
  const yVel = velocity.magnitude * Math.cos(trueAnomaly);
  const zVel = 0;
  
  // Aplicar rotaciones orbitales
  const omega = degToRad(elements.argumentOfPeriapsisDeg);
  const inclination = degToRad(elements.inclinationDeg);
  const Omega = degToRad(elements.longitudeOfAscendingNodeDeg);
  
  // Rotación por argumento del periapsis
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const x1 = xVel * cosOmega - yVel * sinOmega;
  const y1 = xVel * sinOmega + yVel * cosOmega;
  const z1 = zVel;
  
  // Rotación por inclinación
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const x2 = x1;
  const y2 = y1 * cosI - z1 * sinI;
  const z2 = y1 * sinI + z1 * cosI;
  
  // Rotación por longitud del nodo ascendente
  const cosBigOmega = Math.cos(Omega);
  const sinBigOmega = Math.sin(Omega);
  const x = x2 * cosBigOmega - y2 * sinBigOmega;
  const y = x2 * sinBigOmega + y2 * cosBigOmega;
  const z = z2;
  
  return [x, y, z];
}

function calculateEntryAngle(relativeVelocity, relativePosition) {
  // Normalizar vectores
  const velMag = Math.sqrt(relativeVelocity[0]**2 + relativeVelocity[1]**2 + relativeVelocity[2]**2);
  const posMag = Math.sqrt(relativePosition[0]**2 + relativePosition[1]**2 + relativePosition[2]**2);
  
  if (velMag === 0 || posMag === 0) return 90;
  
  const velUnit = [relativeVelocity[0]/velMag, relativeVelocity[1]/velMag, relativeVelocity[2]/velMag];
  const posUnit = [relativePosition[0]/posMag, relativePosition[1]/posMag, relativePosition[2]/posMag];
  
  // Producto punto
  const dotProduct = velUnit[0]*posUnit[0] + velUnit[1]*posUnit[1] + velUnit[2]*posUnit[2];
  
  // Ángulo en grados
  const angle = Math.acos(Math.abs(dotProduct)) * (180 / Math.PI);
  
  return angle;
}

function classifyImpact(entryAngle, relativeVelocity) {
  if (entryAngle < 15) {
    return "IMPACTO_DIRECTO";
  } else if (entryAngle < 30) {
    return "IMPACTO_SEVERO";
  } else if (entryAngle < 45) {
    return "IMPACTO_MODERADO";
  } else if (entryAngle < 60) {
    return "IMPACTO_SUAVE";
  } else {
    return "ROZAMIENTO_ATMOSFERICO";
  }
}

function calculateKineticEnergy(massKg, velocityMs) {
  // Energía cinética en Joules
  return 0.5 * massKg * velocityMs * velocityMs;
}

function solveKepler(meanAnomaly, eccentricity, tolerance = 1e-6) {
  let E = meanAnomaly;
  for (let i = 0; i < 50; i += 1) {
    const f = E - eccentricity * Math.sin(E) - meanAnomaly;
    const fPrime = 1 - eccentricity * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < tolerance) {
      break;
    }
  }
  return E;
}

function orbitalToCartesian(planet, trueAnomaly) {
  const {
    semiMajorAxisKm: a,
    eccentricity: e,
    argumentOfPeriapsisDeg,
    inclinationDeg,
    longitudeOfAscendingNodeDeg,
  } = planet;

  const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));
  const xOrb = r * Math.cos(trueAnomaly);
  const yOrb = r * Math.sin(trueAnomaly);

  const omega = degToRad(argumentOfPeriapsisDeg);
  const inclination = degToRad(inclinationDeg);
  const bigOmega = degToRad(longitudeOfAscendingNodeDeg);

  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);
  const cosBigOmega = Math.cos(bigOmega);
  const sinBigOmega = Math.sin(bigOmega);

  const x1 = xOrb * cosOmega - yOrb * sinOmega;
  const y1 = xOrb * sinOmega + yOrb * cosOmega;
  const z1 = 0;

  const x2 = x1;
  const y2 = y1 * cosI - z1 * sinI;
  const z2 = y1 * sinI + z1 * cosI;

  const x = x2 * cosBigOmega - y2 * sinBigOmega;
  const y = x2 * sinBigOmega + y2 * cosBigOmega;
  const z = z2;

  return [x * SCALE_FACTOR, y * SCALE_FACTOR, z * SCALE_FACTOR];
}

function computePlanetPosition(planet, elapsedSeconds) {
  const meanMotion = (2 * Math.PI) / (planet.orbitalPeriodDays * 86400);
  const M0 = degToRad(planet.meanAnomalyDeg || 0);
  const meanAnomaly = M0 + meanMotion * elapsedSeconds;
  const normalizedM = ((meanAnomaly % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const eccentricAnomaly = solveKepler(normalizedM, planet.eccentricity);
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + planet.eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - planet.eccentricity) * Math.cos(eccentricAnomaly / 2),
  );

  return orbitalToCartesian(planet, trueAnomaly);
}

function createOrbitPoints(planet, segments = 256) {
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const trueAnomaly = (i / segments) * 2 * Math.PI;
    points.push(orbitalToCartesian(planet, trueAnomaly));
  }
  return points;
}

function PlanetOrbit({ planet }) {
  const points = useMemo(() => createOrbitPoints(planet), [planet]);
  return (
    <Line
      points={points}
      color={planet.orbitColor || planet.color || '#888888'}
      lineWidth={2.5}
      transparent
      opacity={0.85}
    />
  );
}

function SolarTimeController({ timeScale, simulationTimeRef }) {
  useFrame((_, delta) => {
    simulationTimeRef.current += delta * timeScale;
  });
  return null;
}

// Componente para detectar colisiones reales entre objetos
function CollisionDetector({ planets, neoObjects, onCollision, simulationTimeRef }) {
  const lastCollisionTimeRef = useRef({});
  
  useFrame(() => {
    const elapsed = simulationTimeRef.current;
    const allObjects = [...planets, ...neoObjects];
    
    // Verificar colisiones entre todos los pares de objetos
    for (let i = 0; i < allObjects.length; i++) {
      for (let j = i + 1; j < allObjects.length; j++) {
        const obj1 = allObjects[i];
        const obj2 = allObjects[j];
        
        // Calcular posiciones actuales (en unidades escaladas)
        const pos1Scaled = computePlanetPosition(obj1, elapsed);
        const pos2Scaled = computePlanetPosition(obj2, elapsed);
        
        // Convertir a coordenadas reales (km)
        const pos1Real = [
          pos1Scaled[0] / SCALE_FACTOR,
          pos1Scaled[1] / SCALE_FACTOR,
          pos1Scaled[2] / SCALE_FACTOR
        ];
        const pos2Real = [
          pos2Scaled[0] / SCALE_FACTOR,
          pos2Scaled[1] / SCALE_FACTOR,
          pos2Scaled[2] / SCALE_FACTOR
        ];
        
        // Calcular distancia real entre objetos (km)
        const distanceReal = Math.sqrt(
          Math.pow(pos1Real[0] - pos2Real[0], 2) +
          Math.pow(pos1Real[1] - pos2Real[1], 2) +
          Math.pow(pos1Real[2] - pos2Real[2], 2)
        );
        
        // Umbral de colisión = suma de radios de los objetos
        const collisionThreshold = (obj1.radiusKm || 0) + (obj2.radiusKm || 0);
        
        // Crear clave única para este par de objetos
        const collisionKey = `${obj1.name}-${obj2.name}`;
        const lastCollisionTime = lastCollisionTimeRef.current[collisionKey] || 0;
        
        // Detectar colisión atmosférica si están dentro del umbral
        if (distanceReal < collisionThreshold && elapsed - lastCollisionTime > 2.0) {
          lastCollisionTimeRef.current[collisionKey] = elapsed;
          
          // Calcular información detallada de la colisión
          const collisionData = calculateCollisionDetails(obj1, obj2, pos1Real, pos2Real, elapsed);
          
          // Reportar colisión con información completa
          onCollision({
            object1: obj1,
            object2: obj2,
            distance: distanceReal,
            threshold: collisionThreshold,
            time: elapsed,
            position1: pos1Real,
            position2: pos2Real,
            ...collisionData
          });
        }
      }
    }
  });
  
  return null;
}

// Función para calcular detalles de la colisión
function calculateCollisionDetails(obj1, obj2, pos1, pos2, elapsed) {
  // Calcular anomalía verdadera para ambos objetos
  const trueAnomaly1 = calculateTrueAnomaly(obj1, elapsed);
  const trueAnomaly2 = calculateTrueAnomaly(obj2, elapsed);
  
  // Calcular velocidades orbitales
  const vel1 = calculateVelocityVector(obj1, trueAnomaly1);
  const vel2 = calculateVelocityVector(obj2, trueAnomaly2);
  
  // Velocidad relativa
  const relativeVelocity = [
    vel1[0] - vel2[0],
    vel1[1] - vel2[1],
    vel1[2] - vel2[2]
  ];
  
  // Posición relativa
  const relativePosition = [
    pos1[0] - pos2[0],
    pos1[1] - pos2[1],
    pos1[2] - pos2[2]
  ];
  
  // Calcular ángulo de entrada atmosférica
  const entryAngle = calculateEntryAngle(relativeVelocity, relativePosition);
  
  // Clasificar tipo de impacto
  const impactType = classifyImpact(entryAngle, Math.sqrt(relativeVelocity[0]**2 + relativeVelocity[1]**2 + relativeVelocity[2]**2));
  
  // Determinar tipo de colisión
  let collisionType = "CLOSE_APPROACH";
  const earthRadius = EARTH_RADIUS_KM;
  const atmosphereHeight = ATMOSPHERE_HEIGHT_KM;
  
  if (Math.min(obj1.radiusKm || 0, obj2.radiusKm || 0) === earthRadius) {
    const distance = Math.sqrt(relativePosition[0]**2 + relativePosition[1]**2 + relativePosition[2]**2);
    if (distance < earthRadius) {
      collisionType = "SURFACE_IMPACT";
    } else if (distance < earthRadius + atmosphereHeight) {
      collisionType = "ATMOSPHERIC_ENTRY";
    }
  }
  
  return {
    entryAngle: entryAngle,
    relativeVelocity: Math.sqrt(relativeVelocity[0]**2 + relativeVelocity[1]**2 + relativeVelocity[2]**2),
    impactType: impactType,
    collisionType: collisionType,
    velocity1: vel1,
    velocity2: vel2
  };
}

// Función auxiliar para calcular anomalía verdadera
function calculateTrueAnomaly(obj, elapsed) {
  const meanMotion = (2 * Math.PI) / (obj.orbitalPeriodDays * 86400);
  const M0 = degToRad(obj.meanAnomalyDeg || 0);
  const meanAnomaly = M0 + meanMotion * elapsed;
  const normalizedM = ((meanAnomaly % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  
  // Resolver ecuación de Kepler
  const eccentricAnomaly = solveKepler(normalizedM, obj.eccentricity);
  
  // Convertir a anomalía verdadera
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + obj.eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - obj.eccentricity) * Math.cos(eccentricAnomaly / 2)
  );
  
  return trueAnomaly;
}

// Componente para mostrar efectos visuales de colisión
function CollisionEffect({ collision, onComplete }) {
  const meshRef = useRef();
  const [opacity, setOpacity] = useState(1);
  
  useEffect(() => {
    if (!collision) return;
    
    // Animación de explosión
    const duration = 2000; // 2 segundos
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress >= 1) {
        setOpacity(0);
        onComplete();
        return;
      }
      
      // Efecto de fade out
      setOpacity(1 - progress);
      
      // Escalar el efecto
      if (meshRef.current) {
        const scale = 1 + progress * 3; // Crece 3x
        meshRef.current.scale.set(scale, scale, scale);
      }
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [collision, onComplete]);
  
  if (!collision) return null;
  
  return (
    <group position={collision.position1}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial 
          color="#ff4444" 
          transparent 
          opacity={opacity}
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Efecto de partículas */}
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={opacity * 0.7}
        />
      </mesh>
    </group>
  );
}

function computeLabelVisibility(planet, camera, maxOrbitDistance) {
  const planetDistance = planet.semiMajorAxisKm * SCALE_FACTOR;
  const normalizedPlanet = planetDistance / maxOrbitDistance;
  const normalizedCamera = camera.position.length() / (maxOrbitDistance * 1.5);

  const fadeStart = Math.max(0.12, normalizedPlanet * 0.55);
  const fadeEnd = fadeStart + 0.7;

  if (normalizedCamera <= fadeStart) return 1;
  if (normalizedCamera >= fadeEnd) return 0;

  return 1 - (normalizedCamera - fadeStart) / (fadeEnd - fadeStart);
}

function PlanetBody({ planet, maxOrbitDistance, simulationTimeRef }) {
  const groupRef = useRef();
  const billboardRef = useRef();
  const ringRef = useRef();
  const textRef = useRef();
  const isNeo = Boolean(planet.isNeo);
  const isImpactor = Boolean(planet.isImpactor);
  const indicatorRadius = isImpactor ? 0.4 : (isNeo ? 0.35 : 0.45);
  const labelOffset = isImpactor ? 0.5 : (isNeo ? 0.45 : 0.55);
  const ringWidth = isImpactor ? 0.03 : (isNeo ? 0.025 : 0.035);
  const { camera } = useThree();
  const SCREEN_SCALE = 0.03;
  const MIN_SCALE = 12;
  const labelColor = isImpactor ? '#ff4444' : (isNeo ? '#e8faff' : planet.orbitColor || planet.color || '#ffffff');

  useFrame(() => {
    const elapsed = simulationTimeRef.current;
    const [x, y, z] = computePlanetPosition(planet, elapsed);
    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }

    if (groupRef.current && billboardRef.current) {
      const distance = camera.position.distanceTo(groupRef.current.position);
      const scaleValue = Math.max(MIN_SCALE, distance * SCREEN_SCALE);
      billboardRef.current.scale.set(scaleValue, scaleValue, scaleValue);

      const visibility = computeLabelVisibility(planet, camera, maxOrbitDistance);
      billboardRef.current.visible = visibility > 0.05;

      if (ringRef.current?.material) {
        ringRef.current.material.opacity = (isImpactor ? 1 : (isNeo ? 1 : 0.8)) * visibility;
      }

      if (textRef.current) {
        if (textRef.current.material) {
          textRef.current.material.opacity = visibility;
        }
        if (typeof textRef.current.outlineOpacity === 'number') {
          textRef.current.outlineOpacity = visibility;
        }
        textRef.current.visible = visibility > 0.05;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Billboard ref={billboardRef} follow position={[0, 0, 0]}>
        <group>
          <mesh ref={ringRef}>
            <ringGeometry args={[indicatorRadius - ringWidth, indicatorRadius, 128]} />
            <meshBasicMaterial
              color={planet.orbitColor || planet.color || '#ffffff'}
              side={THREE.DoubleSide}
              transparent
              opacity={0.8}
            />
          </mesh>
          <Text
            ref={textRef}
            position={[labelOffset, 0, 0]}
            fontSize={0.7}
            color={labelColor}
            anchorX="left"
            anchorY="middle"
            outlineWidth={isImpactor ? 0.05 : (isNeo ? 0.04 : 0.03)}
            outlineColor="#000000"
        >
          {isImpactor ? `IMPACTOR: ${planet.name}` : (isNeo ? `NEO: ${planet.name}` : planet.name)}
        </Text>
      </group>
    </Billboard>
  </group>
);
}

function Sun() {
  const sunRadius = Math.max(SUN_RADIUS_KM * SCALE_FACTOR * 3, 6);
  return (
    <group>
      <Sphere args={[sunRadius, 64, 64]}>
        <meshStandardMaterial emissive="#ffcc55" emissiveIntensity={1.5} color="#ffaa33" />
      </Sphere>
      <pointLight args={[0xffffff, 2.2, 0]} />
    </group>
  );
}

function SolarSkybox() {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, '/textures/space-skybox.jpg');

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;

    return () => {
      if (scene.background === texture) {
        scene.background = null;
      }
    };
  }, [scene, texture]);

  return null;
}

export default function SolarSystemVisualization({ className = '', planets = [], neoObjects = [], generatedAt, timeScale = 1, onCollision }) {
  const maxOrbitDistance = useMemo(() => {
    const bodies = [...planets, ...neoObjects];
    if (!bodies.length) return 1;
    const maxSemiMajor = Math.max(...bodies.map((p) => p.semiMajorAxisKm || 0));
    return Math.max(1, maxSemiMajor * SCALE_FACTOR);
  }, [planets, neoObjects]);

  const simulationTimeRef = useRef(0);
  const [collisions, setCollisions] = useState([]);

  useEffect(() => {
    simulationTimeRef.current = 0;
  }, [generatedAt]);

  const handleCollision = (collisionData) => {
    // Añadir nueva colisión
    setCollisions(prev => [...prev, { ...collisionData, id: Date.now() }]);
    
    // Notificar al componente padre si existe callback
    if (onCollision) {
      onCollision(collisionData);
    }
    
    // Log en consola para debugging
    console.log('🚨 COLISIÓN DETECTADA:', {
      objetos: `${collisionData.object1.name} ↔ ${collisionData.object2.name}`,
      distancia: collisionData.distance,
      tiempo: collisionData.time
    });
  };

  const handleCollisionComplete = (collisionId) => {
    setCollisions(prev => prev.filter(c => c.id !== collisionId));
  };

  const cameraDistance = maxOrbitDistance * 1.6;
  const cameraFar = cameraDistance * 12;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ outputColorSpace: THREE.SRGBColorSpace, logarithmicDepthBuffer: true }}
        camera={{
          position: [cameraDistance, cameraDistance * 0.45, cameraDistance],
          fov: 45,
          near: 0.1,
          far: cameraFar,
        }}
      >
        <SolarSkybox />
        <SolarTimeController timeScale={timeScale} simulationTimeRef={simulationTimeRef} />
        <CollisionDetector 
          planets={planets} 
          neoObjects={neoObjects} 
          onCollision={handleCollision}
          simulationTimeRef={simulationTimeRef}
        />
        <ambientLight intensity={0.1} />
        <Stars radius={500} depth={60} count={2000} factor={4} fade speed={1} />

        <Sun />

        {[...planets, ...neoObjects].map((planet) => (
          <group key={planet.name || planet.designation}>
            <PlanetOrbit planet={planet} />
            <PlanetBody
              planet={planet}
              maxOrbitDistance={maxOrbitDistance}
              simulationTimeRef={simulationTimeRef}
            />
          </group>
        ))}

        {/* Efectos de colisión */}
        {collisions.map((collision) => (
          <CollisionEffect
            key={collision.id}
            collision={collision}
            onComplete={() => handleCollisionComplete(collision.id)}
          />
        ))}

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={1.4}
          panSpeed={0.5}
          rotateSpeed={0.35}
          minDistance={maxOrbitDistance * 0.1}
          maxDistance={cameraFar * 0.9}
        />
      </Canvas>
    </div>
  );
}
