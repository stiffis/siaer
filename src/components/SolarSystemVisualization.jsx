import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Line, Text, Stars, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SCALE_FACTOR = 1 / 1_000_000; // Reducir unidades para la visualización
const SUN_RADIUS_KM = 695_700;

const degToRad = THREE.MathUtils.degToRad;

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
  const indicatorRadius = isNeo ? 0.35 : 0.45;
  const labelOffset = isNeo ? 0.45 : 0.55;
  const ringWidth = isNeo ? 0.025 : 0.035;
  const { camera } = useThree();
  const SCREEN_SCALE = 0.03;
  const MIN_SCALE = 12;
  const labelColor = isNeo ? '#e8faff' : planet.orbitColor || planet.color || '#ffffff';

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
        ringRef.current.material.opacity = (isNeo ? 1 : 0.8) * visibility;
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
            outlineWidth={isNeo ? 0.04 : 0.03}
            outlineColor="#000000"
        >
          {isNeo ? `NEO: ${planet.name}` : planet.name}
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

export default function SolarSystemVisualization({ className = '', planets = [], neoObjects = [], generatedAt, timeScale = 1 }) {
  const maxOrbitDistance = useMemo(() => {
    const bodies = [...planets, ...neoObjects];
    if (!bodies.length) return 1;
    const maxSemiMajor = Math.max(...bodies.map((p) => p.semiMajorAxisKm || 0));
    return Math.max(1, maxSemiMajor * SCALE_FACTOR);
  }, [planets, neoObjects]);

  const simulationTimeRef = useRef(0);

  useEffect(() => {
    simulationTimeRef.current = 0;
  }, [generatedAt]);

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
