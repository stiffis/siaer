/**
 * Componente de visualización 3D de órbitas usando Three.js
 */

import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Sphere, Text } from "@react-three/drei";
import * as THREE from "three";

const EARTH_TEXTURE_URL =
  import.meta.env.VITE_EARTH_TEXTURE_URL || "/textures/earth-daymap.jpg";

const EARTH_CLOUDS_TEXTURE_URL =
  import.meta.env.VITE_EARTH_CLOUDS_URL || "/textures/earth-clouds.png";

// Componente para la Tierra
function Earth() {
  const earthRef = useRef();
  const cloudRef = useRef();

  const earthTexture = useLoader(
    THREE.TextureLoader,
    EARTH_TEXTURE_URL,
    (loader) => {
      loader.setCrossOrigin("anonymous");
    },
  );

  const cloudsTexture = useLoader(
    THREE.TextureLoader,
    EARTH_CLOUDS_TEXTURE_URL,
    (loader) => {
      loader.setCrossOrigin("anonymous");
    },
  );

  useEffect(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
    }

    if (cloudsTexture) {
      cloudsTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [earthTexture, cloudsTexture]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05; // Rotación lenta de la Tierra
    }

    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.08; // Nubes ligeramente más rápidas
    }
  });

  return (
    <group>
      <Sphere ref={earthRef} args={[6371, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          map={earthTexture}
          shininess={12}
          specular={new THREE.Color("#111822")}
        />
      </Sphere>

      {cloudsTexture && (
        <Sphere ref={cloudRef} args={[6430, 64, 64]} position={[0, 0, 0]}>
          <meshPhongMaterial
            map={cloudsTexture}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </Sphere>
      )}
    </group>
  );
}

// Componente para la trayectoria orbital
function OrbitalTrajectory({
  positions,
  currentIndex,
  showComplete = true,
  trailLength = 100,
}) {
  const hasPositions = Array.isArray(positions) && positions.length > 0;

  const points = useMemo(() => {
    if (!hasPositions) return [];
    return positions.map((pos) => new THREE.Vector3(pos[0], pos[1], pos[2]));
  }, [positions, hasPositions]);

  const trailPoints = useMemo(() => {
    if (!hasPositions) return [];
    return points.slice(
      Math.max(0, currentIndex - trailLength),
      currentIndex + 1,
    );
  }, [points, hasPositions, currentIndex, trailLength]);

  const tronTrail = useMemo(() => {
    if (trailPoints.length < 2) {
      return null;
    }

    const curve = new THREE.CatmullRomCurve3(trailPoints);
    const segments = Math.max(128, trailPoints.length * 6);

    const coreRadius = 60;
    const glowRadius = 120;

    return {
      core: new THREE.TubeGeometry(curve, segments, coreRadius, 24, false),
      glow: new THREE.TubeGeometry(curve, segments, glowRadius, 24, false),
    };
  }, [trailPoints]);

  useEffect(() => {
    if (!tronTrail) return undefined;
    return () => {
      tronTrail.core.dispose();
      tronTrail.glow.dispose();
    };
  }, [tronTrail]);

  if (!hasPositions) return null;

  return (
    <group>
      {showComplete && (
        <Line
          points={points}
          color="#888888"
          lineWidth={4}
          transparent
          opacity={0.3}
        />
      )}

      {tronTrail && trailPoints.length > 1 && (
        <group>
          <mesh geometry={tronTrail.glow}>
            <meshBasicMaterial
              color="#00fff6"
              transparent
              opacity={0.07}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh geometry={tronTrail.core}>
            <meshStandardMaterial
              color="#00fff6"
              emissive="#00fff6"
              emissiveIntensity={1.1}
              metalness={0.05}
              roughness={0.25}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Componente para el satélite animado
function Satellite({ position, isImpacting = false }) {
  const satelliteRef = useRef();
  const [scale, setScale] = useState(1);

  useFrame((state) => {
    if (satelliteRef.current) {
      if (isImpacting) {
        // Efecto de "explosión" en impacto
        const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.5 + 1;
        setScale(pulse * 2);
        satelliteRef.current.material.color.setHex(0xff4444);
      } else {
        // Satélite normal
        setScale(1);
        satelliteRef.current.material.color.setHex(0x44ff44);
      }
    }
  });

  if (!position) return null;

  return (
    <Sphere
      ref={satelliteRef}
      args={[200, 8, 8]}
      position={position}
      scale={scale}
    >
      <meshPhongMaterial
        color={isImpacting ? "#FF4444" : "#44FF44"}
        emissive={isImpacting ? "#440000" : "#004400"}
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
}

// Componente para información de texto en 3D
function InfoText({ text, position, color = "white" }) {
  if (!text || !position) return null;

  return (
    <Text
      position={position}
      fontSize={400}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

function Skybox() {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, "/textures/space-skybox.jpg");

  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
  }, [scene, texture]);

  return null;
}

// Componente principal de escena 3D
function OrbitalScene({
  simulationData,
  currentFrame,
  isPlaying,
  showTrajectory = true,
  showInfo = true,
  cameraDistance,
  cameraFar,
}) {
  const { camera } = useThree();

  useEffect(() => {
    const distance = cameraDistance || 15000;
    const farPlane = Math.max(100000, cameraFar || distance * 8);

    camera.position.set(distance, distance, distance);
    camera.lookAt(0, 0, 0);
    if (camera.far !== farPlane) {
      camera.far = farPlane;
      camera.updateProjectionMatrix();
    }
  }, [camera, cameraDistance, cameraFar]);

  if (!simulationData?.trajectory?.positions) {
    return (
      <group>
        <Suspense fallback={null}>
          <Earth />
        </Suspense>
        <InfoText
          text="Cargando simulación..."
          position={[0, 10000, 0]}
          color="yellow"
        />
      </group>
    );
  }

  const { positions, times } = simulationData.trajectory;
  const currentPosition = positions[currentFrame] || positions[0];

  // Verificar si está impactando
  const isImpacting =
    simulationData.analysis?.impact?.will_impact &&
    currentFrame >= simulationData.analysis.impact.impact_index;

  return (
    <group>
      {/* Tierra */}
      <Suspense fallback={null}>
        <Earth />
      </Suspense>

      {/* Trayectoria orbital */}
      {showTrajectory && (
        <OrbitalTrajectory
          positions={positions}
          currentIndex={currentFrame}
          showComplete={!isPlaying}
        />
      )}

      {/* Satélite */}
      <Satellite position={currentPosition} isImpacting={isImpacting} />

      {/* Información de impacto */}
      {isImpacting && showInfo && (
        <InfoText
          text="¡IMPACTO!"
          position={[
            currentPosition[0],
            currentPosition[1] + 2000,
            currentPosition[2],
          ]}
          color="red"
        />
      )}

      {/* Información de tiempo actual */}
      {showInfo && times && (
        <InfoText
          text={`T: ${(times[currentFrame] / 3600).toFixed(2)}h`}
          position={[0, -10000, 0]}
          color="cyan"
        />
      )}
    </group>
  );
}

// Componente principal de visualización
export default function OrbitalVisualization({
  simulationData,
  currentFrame = 0,
  isPlaying = false,
  className = "",
  showTrajectory = true,
  showInfo = true,
}) {
  const maxSceneDistance = useMemo(() => {
    const positions = simulationData?.trajectory?.positions;
    if (!positions || positions.length === 0) return 15000;

    let maxDistance = 0;
    for (const pos of positions) {
      if (!Array.isArray(pos)) continue;
      const distance = Math.hypot(pos[0], pos[1], pos[2]);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    return Math.max(15000, maxDistance);
  }, [simulationData]);

  const cameraDistance = useMemo(() => {
    return Math.max(15000, maxSceneDistance * 1.05);
  }, [maxSceneDistance]);

  const cameraFar = useMemo(() => {
    return Math.max(100000, cameraDistance * 6);
  }, [cameraDistance]);

  const controlsMaxDistance = useMemo(() => {
    return Math.max(50000, cameraFar * 0.9);
  }, [cameraFar]);

  const controlsMinDistance = useMemo(() => {
    return 1000;
  }, []);

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ outputColorSpace: THREE.SRGBColorSpace, logarithmicDepthBuffer: true }}
        camera={{
          fov: 50,
          near: 1,
          far: cameraFar,
          position: [cameraDistance, cameraDistance, cameraDistance],
        }}
      >
        <Skybox />
        {/* Iluminación */}
        <ambientLight intensity={0.35} color="#ffe4c4" />
        <directionalLight
          position={[10000, 10000, 5000]}
          intensity={0.95}
          color="#ffd1a1"
          castShadow
        />
        <pointLight
          position={[0, 0, 0]}
          intensity={0.55}
          color="#ff9f5c"
        />

        {/* Controles de cámara */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.2}
          panSpeed={0.5}
          rotateSpeed={0.3}
          minDistance={controlsMinDistance}
          maxDistance={controlsMaxDistance}
        />

        {/* Escena orbital */}
        <OrbitalScene
          simulationData={simulationData}
          currentFrame={currentFrame}
          isPlaying={isPlaying}
          showTrajectory={showTrajectory}
          showInfo={showInfo}
          cameraDistance={cameraDistance}
          cameraFar={cameraFar}
        />
      </Canvas>
    </div>
  );
}
