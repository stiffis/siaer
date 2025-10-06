import React, { useEffect, useRef, useState } from 'react';
import h337 from 'heatmap.js';

// Función para calcular radios térmicos basados en Collins-Melosh-Marcus
const calculateThermalRadii = (impactEnergy, impactorDiameter) => {
  // Energía en joules, diámetro en km
  const energyJoules = impactEnergy; // 9.85e19 J para IMPACTOR-2025
  const diameterKm = impactorDiameter; // 1 km
  
  // Cálculos basados en Collins-Melosh-Marcus
  const craterRadius = diameterKm * 7.5; // Radio del cráter
  const fireballRadius = craterRadius * 2.5; // Radio de la bola de fuego
  const thermalRadiationRadius = craterRadius * 15; // Radio de radiación térmica
  const thermalPulseRadius = craterRadius * 25; // Radio del pulso térmico
  
  return {
    crater: craterRadius,
    fireball: fireballRadius,
    thermalRadiation: thermalRadiationRadius,
    thermalPulse: thermalPulseRadius
  };
};

// Función para generar puntos de calor basados en la distancia del epicentro
const generateHeatPoints = (centerX, centerY, width, height, radii) => {
  const points = [];
  const maxIntensity = 100;
  
  // Generar puntos para cada zona térmica
  const zones = [
    { radius: radii.crater, intensity: maxIntensity, color: '#ff0000', name: 'Incineration' },
    { radius: radii.fireball, intensity: 80, color: '#ff4500', name: 'Combustion' },
    { radius: radii.thermalRadiation, intensity: 60, color: '#ff8800', name: 'Thermal Radiation' },
    { radius: radii.thermalPulse, intensity: 40, color: '#ffaa00', name: 'Thermal Pulse' }
  ];
  
  zones.forEach(zone => {
    const pointsPerZone = Math.max(50, Math.floor(zone.radius * 10));
    
    for (let i = 0; i < pointsPerZone; i++) {
      // Generar punto aleatorio dentro del radio
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * zone.radius;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      // Verificar que el punto esté dentro del canvas
      if (x >= 0 && x < width && y >= 0 && y < height) {
        // Calcular intensidad basada en la distancia del centro
        const normalizedDistance = distance / zone.radius;
        const intensity = Math.max(1, zone.intensity * (1 - normalizedDistance));
        
        points.push({
          x: Math.floor(x),
          y: Math.floor(y),
          value: intensity,
          radius: Math.max(5, zone.radius * 0.1),
          color: zone.color
        });
      }
    }
  });
  
  return points;
};

const ThermalMap = ({ 
  impactLat = 40.7128, 
  impactLng = -74.0060,
  impactEnergy = 9.85e19, // Joules
  impactorDiameter = 1.0, // km
  showAnimation = true
}) => {
  const canvasRef = useRef(null);
  const heatmapInstanceRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showLegend, setShowLegend] = useState(true);

  // Calcular radios térmicos
  const thermalRadii = calculateThermalRadii(impactEnergy, impactorDiameter);

  useEffect(() => {
    if (canvasRef.current && !heatmapInstanceRef.current) {
      // Configurar el canvas
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Configurar el heatmap
      const heatmapInstance = h337.create({
        container: canvasRef.current,
        radius: 50,
        maxOpacity: 0.8,
        minOpacity: 0.1,
        blur: 0.8,
        gradient: {
          0.0: '#0000ff', // Azul (frío)
          0.2: '#00ffff', // Cian
          0.4: '#00ff00', // Verde
          0.6: '#ffff00', // Amarillo
          0.8: '#ff8800', // Naranja
          1.0: '#ff0000'  // Rojo (caliente)
        }
      });
      
      // Configurar datos iniciales vacíos
      heatmapInstance.setData({
        max: 100,
        min: 0,
        data: []
      });
      
      heatmapInstanceRef.current = heatmapInstance;
      
      // Generar datos de calor
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Escalar los radios para el canvas
      const scaleFactor = Math.min(rect.width, rect.height) / (thermalRadii.thermalPulse * 4);
      const scaledRadii = {
        crater: thermalRadii.crater * scaleFactor,
        fireball: thermalRadii.fireball * scaleFactor,
        thermalRadiation: thermalRadii.thermalRadiation * scaleFactor,
        thermalPulse: thermalRadii.thermalPulse * scaleFactor
      };
      
      const heatPoints = generateHeatPoints(centerX, centerY, rect.width, rect.height, scaledRadii);
      
      // Configurar datos del heatmap
      heatmapInstance.setData({
        max: 100,
        min: 0,
        data: heatPoints
      });
      
      // Iniciar animación si está habilitada
      if (showAnimation) {
        startThermalAnimation();
      }
    }
  }, [impactLat, impactLng, impactEnergy, impactorDiameter, showAnimation, thermalRadii]);

  const startThermalAnimation = () => {
    setIsAnimating(true);
    let phase = 0;
    
    animationRef.current = setInterval(() => {
      phase = (phase + 1) % 4;
      setCurrentPhase(phase);
      
      // Aplicar efectos de animación - regenerar datos en lugar de modificar existentes
      if (heatmapInstanceRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const scaleFactor = Math.min(rect.width, rect.height) / (thermalRadii.thermalPulse * 4);
        const scaledRadii = {
          crater: thermalRadii.crater * scaleFactor,
          fireball: thermalRadii.fireball * scaleFactor,
          thermalRadiation: thermalRadii.thermalRadiation * scaleFactor,
          thermalPulse: thermalRadii.thermalPulse * scaleFactor
        };
        
        const heatPoints = generateHeatPoints(centerX, centerY, rect.width, rect.height, scaledRadii);
        
        // Aplicar variación de intensidad basada en la fase
        const animatedPoints = heatPoints.map(point => ({
          ...point,
          value: phase === 0 ? point.value : point.value * (0.5 + 0.5 * Math.random())
        }));
        
        heatmapInstanceRef.current.setData({
          max: 100,
          min: 0,
          data: animatedPoints
        });
      }
    }, 2000); // Cambiar cada 2 segundos
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetHeatmap = () => {
    if (heatmapInstanceRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const scaleFactor = Math.min(rect.width, rect.height) / (thermalRadii.thermalPulse * 4);
      const scaledRadii = {
        crater: thermalRadii.crater * scaleFactor,
        fireball: thermalRadii.fireball * scaleFactor,
        thermalRadiation: thermalRadii.thermalRadiation * scaleFactor,
        thermalPulse: thermalRadii.thermalPulse * scaleFactor
      };
      
      const heatPoints = generateHeatPoints(centerX, centerY, rect.width, rect.height, scaledRadii);
      
      heatmapInstanceRef.current.setData({
        max: 100,
        min: 0,
        data: heatPoints
      });
    }
  };

  // Manejar resize de ventana
  useEffect(() => {
    const handleResize = () => {
      if (heatmapInstanceRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Regenerar datos con el nuevo tamaño
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const scaleFactor = Math.min(rect.width, rect.height) / (thermalRadii.thermalPulse * 4);
        const scaledRadii = {
          crater: thermalRadii.crater * scaleFactor,
          fireball: thermalRadii.fireball * scaleFactor,
          thermalRadiation: thermalRadii.thermalRadiation * scaleFactor,
          thermalPulse: thermalRadii.thermalPulse * scaleFactor
        };
        
        const heatPoints = generateHeatPoints(centerX, centerY, rect.width, rect.height, scaledRadii);
        
        heatmapInstanceRef.current.setData({
          max: 100,
          min: 0,
          data: heatPoints
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [thermalRadii]);

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        .thermal-map-container {
          position: relative;
          width: 100%;
          height: 600px;
          border-radius: 8px;
          border: 2px solid #374151;
          overflow: hidden;
          background: #1a1a1a;
        }
        
        .thermal-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: rgba(0,0,0,0.8);
          padding: 10px;
          border-radius: 5px;
          color: white;
          display: flex;
          gap: 5px;
        }
        
        .thermal-controls button {
          background: #ff4500;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .thermal-controls button:hover {
          background: #ff6500;
        }
        
        .thermal-legend {
          position: absolute;
          bottom: 10px;
          left: 10px;
          z-index: 1000;
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 15px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.4;
          border: 1px solid #444;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          max-width: 300px;
        }
        
        .thermal-legend h4 {
          margin: 0 0 12px 0;
          color: #fff;
          font-size: 14px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          margin: 6px 0;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 10px;
          box-shadow: 0 0 8px currentColor;
        }
        
        .legend-stats {
          font-size: 10px;
          color: #ccc;
          margin-top: 10px;
          border-top: 1px solid #444;
          padding-top: 10px;
        }
        
        .temperature-scale {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 1000;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 10px;
          border-radius: 5px;
          font-size: 12px;
        }
        
        .scale-bar {
          width: 200px;
          height: 20px;
          background: linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff8800, #ff0000);
          border-radius: 3px;
          margin: 5px 0;
          position: relative;
        }
        
        .scale-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          margin-top: 2px;
        }
      `}</style>
      
      <div className="thermal-map-container">
        {/* Controles */}
        <div className="thermal-controls">
          <button onClick={isAnimating ? stopAnimation : startThermalAnimation}>
            {isAnimating ? '⏸️ Pausar' : '▶️ Iniciar'}
          </button>
          <button onClick={resetHeatmap}>
            🔄 Reset
          </button>
          <button onClick={() => setShowLegend(!showLegend)}>
            {showLegend ? '👁️ Ocultar' : '👁️ Mostrar'} Leyenda
          </button>
        </div>
        
        {/* Escala de temperatura */}
        <div className="temperature-scale">
          <div>🌡️ Escala de Temperatura</div>
          <div className="scale-bar"></div>
          <div className="scale-labels">
            <span>0°C</span>
            <span>500°C</span>
            <span>1000°C</span>
            <span>1500°C</span>
            <span>2000°C</span>
          </div>
        </div>
        
        {/* Leyenda */}
        {showLegend && (
          <div className="thermal-legend">
            <h4>🌡️ Efectos Térmicos IMPACTOR-2025</h4>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ff0000' }}></div>
                <span>Zona de Incineración (&gt;1000°C)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ff4500' }}></div>
              <span>Zona de Combustión (300-1000°C)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ff8800' }}></div>
              <span>Radiación Térmica (100-300°C)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#ffaa00' }}></div>
              <span>Pulso Térmico (50-100°C)</span>
            </div>
            <div className="legend-stats">
              <div>📍 Epicentro: {impactLat.toFixed(4)}°N, {Math.abs(impactLng).toFixed(4)}°W</div>
              <div>💥 Energía: {(impactEnergy / 1e19).toFixed(2)} × 10¹⁹ J</div>
              <div>⏱️ Duración: 5-10 minutos</div>
              <div>🔥 Radio máximo: {thermalRadii.thermalPulse.toFixed(1)} km</div>
            </div>
          </div>
        )}
        
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: '100%', 
            height: '100%',
            display: 'block'
          }}
        />
      </div>
    </div>
  );
};

export default ThermalMap;