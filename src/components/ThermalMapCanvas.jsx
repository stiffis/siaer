import React, { useEffect, useRef, useState } from 'react';

// Función para calcular radios térmicos basados en Collins-Melosh-Marcus
const calculateThermalRadii = (impactEnergy, impactorDiameter) => {
  const energyJoules = impactEnergy;
  const diameterKm = impactorDiameter;
  
  const craterRadius = diameterKm * 7.5;
  const fireballRadius = craterRadius * 2.5;
  const thermalRadiationRadius = craterRadius * 15;
  const thermalPulseRadius = craterRadius * 25;
  
  return {
    crater: craterRadius,
    fireball: fireballRadius,
    thermalRadiation: thermalRadiationRadius,
    thermalPulse: thermalPulseRadius
  };
};

// Función para dibujar círculos concéntricos con gradientes
const drawThermalZones = (ctx, centerX, centerY, radii, animationPhase = 0) => {
  const zones = [
    { 
      radius: radii.crater, 
      color: '#ff0000', 
      alpha: 0.8 + 0.2 * Math.sin(animationPhase),
      name: 'Incineration',
      temp: '>1000°C'
    },
    { 
      radius: radii.fireball, 
      color: '#ff4500', 
      alpha: 0.6 + 0.2 * Math.sin(animationPhase + 1),
      name: 'Combustion',
      temp: '300-1000°C'
    },
    { 
      radius: radii.thermalRadiation, 
      color: '#ff8800', 
      alpha: 0.4 + 0.2 * Math.sin(animationPhase + 2),
      name: 'Thermal Radiation',
      temp: '100-300°C'
    },
    { 
      radius: radii.thermalPulse, 
      color: '#ffaa00', 
      alpha: 0.2 + 0.2 * Math.sin(animationPhase + 3),
      name: 'Thermal Pulse',
      temp: '50-100°C'
    }
  ];

  // Dibujar cada zona
  zones.forEach((zone, index) => {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, zone.radius);
    gradient.addColorStop(0, zone.color + 'FF');
    gradient.addColorStop(0.7, zone.color + Math.floor(zone.alpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, zone.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, zone.radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Dibujar borde
    ctx.strokeStyle = zone.color + 'CC';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

const ThermalMapCanvas = ({ 
  impactLat = 40.7128, 
  impactLng = -74.0060,
  impactEnergy = 9.85e19,
  impactorDiameter = 1.0,
  showAnimation = true
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [showLegend, setShowLegend] = useState(true);

  const thermalRadii = calculateThermalRadii(impactEnergy, impactorDiameter);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Configurar canvas
    canvas.width = rect.width;
    canvas.height = rect.height;
    
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

    const draw = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo oscuro
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar zonas térmicas
      drawThermalZones(ctx, centerX, centerY, scaledRadii, animationPhase);
      
      // Dibujar epicentro
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Dibujar anillo de pulso
      if (isAnimating) {
        const pulseRadius = 8 + Math.sin(animationPhase * 2) * 4;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    draw();

    if (showAnimation) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [thermalRadii, showAnimation, isAnimating, animationPhase]);

  const startAnimation = () => {
    setIsAnimating(true);
    animationRef.current = setInterval(() => {
      setAnimationPhase(prev => prev + 0.1);
    }, 50);
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetMap = () => {
    setAnimationPhase(0);
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const scaleFactor = Math.min(rect.width, rect.height) / (thermalRadii.thermalPulse * 4);
      const scaledRadii = {
        crater: thermalRadii.crater * scaleFactor,
        fireball: thermalRadii.fireball * scaleFactor,
        thermalRadiation: thermalRadii.thermalRadiation * scaleFactor,
        thermalPulse: thermalRadii.thermalPulse * scaleFactor
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawThermalZones(ctx, centerX, centerY, scaledRadii, 0);
      
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

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
          <button onClick={isAnimating ? stopAnimation : startAnimation}>
            {isAnimating ? '⏸️ Pausar' : '▶️ Iniciar'}
          </button>
          <button onClick={resetMap}>
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

export default ThermalMapCanvas;