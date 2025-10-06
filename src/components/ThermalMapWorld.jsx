import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Función para crear iconos personalizados
const createCustomIcon = (color = '#ff0000', size = 20) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 15px rgba(0,0,0,0.7);
      animation: pulse 2s infinite;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

const ThermalMapWorld = ({ 
  impactLat = 40.7128, 
  impactLng = -74.0060,
  impactEnergy = 9.85e19,
  impactorDiameter = 1.0,
  showAnimation = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  const thermalRadii = calculateThermalRadii(impactEnergy, impactorDiameter);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Crear el mapa
      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false,
        zoomSnap: 0.5,
        zoomDelta: 0.5
      }).setView([impactLat, impactLng], 6);

      mapInstanceRef.current = map;

      // Agregar capa de tiles de OpenStreetMap
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      
      // Agregar la capa con un pequeño delay para asegurar que el contenedor esté listo
      setTimeout(() => {
        osmLayer.addTo(map);
        map.invalidateSize();
      }, 100);

      // Crear capas térmicas con gradientes
      const thermalLayers = createThermalLayers(impactLat, impactLng, thermalRadii);
      
      // Agregar todas las capas al mapa
      Object.values(thermalLayers).forEach(layer => {
        if (layer) layer.addTo(map);
      });

      // Agregar marcador del impacto
      const impactMarker = L.marker([impactLat, impactLng], {
        icon: createCustomIcon('#ff0000', 25)
      }).addTo(map);

      // Popup del marcador de impacto
      impactMarker.bindPopup(`
        <div style="text-align: center; color: white;">
          <h3 style="color: #ff0000; margin: 0 0 10px 0;">🌡️ Epicentro Térmico</h3>
          <p><strong>Coordenadas:</strong> ${impactLat.toFixed(4)}°N, ${Math.abs(impactLng).toFixed(4)}°W</p>
          <p><strong>Temperatura máxima:</strong> >2000°C</p>
          <p><strong>Energía liberada:</strong> ${(impactEnergy / 1e19).toFixed(2)} × 10¹⁹ J</p>
          <p><strong>Duración del pulso:</strong> 5-10 minutos</p>
        </div>
      `);

      // Agregar leyenda térmica
      const thermalLegend = createThermalLegend(thermalRadii);
      thermalLegend.addTo(map);

      // Ajustar la vista para mostrar todas las zonas térmicas
      const group = new L.featureGroup(Object.values(thermalLayers).filter(layer => layer));
      map.fitBounds(group.getBounds().pad(0.15));

      // Iniciar animación si está habilitada
      if (showAnimation) {
        startThermalAnimation(thermalLayers);
      }

      // Cleanup function
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [impactLat, impactLng, impactEnergy, impactorDiameter, showAnimation]);

  const createThermalLayers = (lat, lng, radii) => {
    const layers = {};

    // Zona de incineración (>1000°C) - Rojo intenso
    layers.incineration = L.circle([lat, lng], {
      color: '#ff0000',
      fillColor: '#ff0000',
      fillOpacity: 0.8,
      radius: radii.crater * 1000,
      weight: 4,
      className: 'thermal-zone incineration-zone'
    });

    // Zona de combustión (300-1000°C) - Naranja
    layers.combustion = L.circle([lat, lng], {
      color: '#ff4500',
      fillColor: '#ff4500',
      fillOpacity: 0.6,
      radius: radii.fireball * 1000,
      weight: 3,
      className: 'thermal-zone combustion-zone'
    });

    // Zona de radiación térmica (100-300°C) - Amarillo
    layers.thermalRadiation = L.circle([lat, lng], {
      color: '#ff8800',
      fillColor: '#ff8800',
      fillOpacity: 0.4,
      radius: radii.thermalRadiation * 1000,
      weight: 2,
      className: 'thermal-zone radiation-zone'
    });

    // Zona de pulso térmico (50-100°C) - Amarillo claro
    layers.thermalPulse = L.circle([lat, lng], {
      color: '#ffaa00',
      fillColor: '#ffaa00',
      fillOpacity: 0.2,
      radius: radii.thermalPulse * 1000,
      weight: 2,
      className: 'thermal-zone pulse-zone'
    });

    // Agregar popups informativos
    layers.incineration.bindPopup(`
      <div style="text-align: center; color: white;">
        <h3 style="color: #ff0000; margin: 0 0 10px 0;">🔥 Zona de Incineración</h3>
        <p><strong>Temperatura:</strong> >1000°C</p>
        <p><strong>Radio:</strong> ${radii.crater.toFixed(1)} km</p>
        <p><strong>Efectos:</strong> Vaporización instantánea</p>
        <p><strong>Duración:</strong> 0-30 segundos</p>
      </div>
    `);

    layers.combustion.bindPopup(`
      <div style="text-align: center; color: white;">
        <h3 style="color: #ff4500; margin: 0 0 10px 0;">🔥 Zona de Combustión</h3>
        <p><strong>Temperatura:</strong> 300-1000°C</p>
        <p><strong>Radio:</strong> ${radii.fireball.toFixed(1)} km</p>
        <p><strong>Efectos:</strong> Incendios masivos, fusión de materiales</p>
        <p><strong>Duración:</strong> 1-5 minutos</p>
      </div>
    `);

    layers.thermalRadiation.bindPopup(`
      <div style="text-align: center; color: white;">
        <h3 style="color: #ff8800; margin: 0 0 10px 0;">☀️ Radiación Térmica</h3>
        <p><strong>Temperatura:</strong> 100-300°C</p>
        <p><strong>Radio:</strong> ${radii.thermalRadiation.toFixed(1)} km</p>
        <p><strong>Efectos:</strong> Quemaduras graves, incendios</p>
        <p><strong>Duración:</strong> 5-15 minutos</p>
      </div>
    `);

    layers.thermalPulse.bindPopup(`
      <div style="text-align: center; color: white;">
        <h3 style="color: #ffaa00; margin: 0 0 10px 0;">🌡️ Pulso Térmico</h3>
        <p><strong>Temperatura:</strong> 50-100°C</p>
        <p><strong>Radio:</strong> ${radii.thermalPulse.toFixed(1)} km</p>
        <p><strong>Efectos:</strong> Quemaduras leves, calor intenso</p>
        <p><strong>Duración:</strong> 10-30 minutos</p>
      </div>
    `);

    return layers;
  };

  const createThermalLegend = (radii) => {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'thermal-legend');
      div.style.cssText = `
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.4;
        border: 1px solid #444;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        max-width: 300px;
      `;
      div.innerHTML = `
        <h4 style="margin: 0 0 12px 0; color: #fff; font-size: 14px;">🌡️ Efectos Térmicos</h4>
        <div style="display: flex; align-items: center; margin: 6px 0;">
          <div style="width: 16px; height: 16px; background: #ff0000; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 8px #ff0000;"></div>
          <span>Incineración (>1000°C)</span>
        </div>
        <div style="display: flex; align-items: center; margin: 6px 0;">
          <div style="width: 16px; height: 16px; background: #ff4500; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 6px #ff4500;"></div>
          <span>Combustión (300-1000°C)</span>
        </div>
        <div style="display: flex; align-items: center; margin: 6px 0;">
          <div style="width: 16px; height: 16px; background: #ff8800; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 4px #ff8800;"></div>
          <span>Radiación (100-300°C)</span>
        </div>
        <div style="display: flex; align-items: center; margin: 6px 0;">
          <div style="width: 16px; height: 16px; background: #ffaa00; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 2px #ffaa00;"></div>
          <span>Pulso Térmico (50-100°C)</span>
        </div>
        <hr style="border: none; border-top: 1px solid #444; margin: 10px 0;">
        <div style="font-size: 10px; color: #ccc;">
          <div>Radio de incineración: ${radii.crater.toFixed(1)} km</div>
          <div>Radio de combustión: ${radii.fireball.toFixed(1)} km</div>
          <div>Radio de radiación: ${radii.thermalRadiation.toFixed(1)} km</div>
          <div>Radio del pulso: ${radii.thermalPulse.toFixed(1)} km</div>
        </div>
      `;
      return div;
    };
    return legend;
  };

  const startThermalAnimation = (layers) => {
    setIsAnimating(true);
    let phase = 0;
    
    animationRef.current = setInterval(() => {
      phase = (phase + 1) % 4;
      
      // Aplicar efectos de animación a las capas
      Object.values(layers).forEach((layer, index) => {
        if (layer) {
          const opacity = phase === index ? 0.9 : 0.3;
          layer.setStyle({ fillOpacity: opacity });
        }
      });
    }, 2000); // Cambiar cada 2 segundos
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  return (
    <div className="w-full h-full relative">
      <style jsx global>{`
        .leaflet-container {
          background: #1a1a1a !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          color: white !important;
          border-radius: 8px !important;
        }
        
        .leaflet-popup-tip {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        
        .leaflet-control-zoom a {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
          border: 1px solid #374151 !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: rgba(0, 0, 0, 0.9) !important;
        }
        
        .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.8) !important;
          color: white !important;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .thermal-zone {
          transition: all 0.5s ease-in-out;
        }
        
        .incineration-zone {
          animation: thermal-pulse 3s infinite;
        }
        
        .combustion-zone {
          animation: thermal-pulse 3s infinite 0.5s;
        }
        
        .radiation-zone {
          animation: thermal-pulse 3s infinite 1s;
        }
        
        .pulse-zone {
          animation: thermal-pulse 3s infinite 1.5s;
        }
        
        @keyframes thermal-pulse {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
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
      `}</style>
      
      {/* Controles de animación */}
      <div className="thermal-controls">
        <span>Animación:</span>
        <button onClick={isAnimating ? stopAnimation : () => {}}>
          {isAnimating ? '⏸️ Pausar' : '▶️ Iniciar'}
        </button>
      </div>
      
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '600px',
          borderRadius: '8px',
          border: '2px solid #374151'
        }}
      />
    </div>
  );
};

export default ThermalMapWorld;