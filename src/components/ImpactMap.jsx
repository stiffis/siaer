import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar iconos por defecto de Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix para los iconos de Leaflet - usar iconos personalizados
const createCustomIcon = (color = '#ff0000') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Función para configurar popups y leyenda
const setupMapElements = (map, impactZone, devastationZone, shockwaveZone, atmosphericZone, impactMarker) => {
  // Popup del marcador de impacto
  impactMarker.bindPopup(`
    <div style="text-align: center;">
      <h3 style="color: #ff0000; margin: 0 0 10px 0;">💥 Epicentro del Impacto</h3>
      <p><strong>Coordenadas:</strong> ${impactMarker.getLatLng().lat.toFixed(4)}°N, ${Math.abs(impactMarker.getLatLng().lng).toFixed(4)}°W</p>
      <p><strong>Ubicación:</strong> Nueva York, NY</p>
      <p><strong>Diámetro del cráter:</strong> ~30 km</p>
      <p><strong>Profundidad:</strong> ~2-3 km</p>
    </div>
  `);

  // Popups informativos
  impactZone.bindPopup(`
    <div style="text-align: center;">
      <h3 style="color: #ff0000; margin: 0 0 10px 0;">💥 Zona de Impacto Directo</h3>
      <p><strong>Radio:</strong> 15 km</p>
      <p><strong>Diámetro del cráter:</strong> ~30 km</p>
      <p><strong>Efectos:</strong> Destrucción total instantánea</p>
    </div>
  `);

  devastationZone.bindPopup(`
    <div style="text-align: center;">
      <h3 style="color: #ff8800; margin: 0 0 10px 0;">🔥 Zona de Devastación</h3>
      <p><strong>Radio:</strong> 100 km</p>
      <p><strong>Efectos:</strong> Destrucción de estructuras, incendios masivos</p>
      <p><strong>Población afectada:</strong> ~50-100 millones</p>
    </div>
  `);

  shockwaveZone.bindPopup(`
    <div style="text-align: center;">
      <h3 style="color: #ffaa00; margin: 0 0 10px 0;">💨 Ondas de Choque</h3>
      <p><strong>Radio:</strong> 500 km</p>
      <p><strong>Efectos:</strong> Ventanas rotas, daños estructurales</p>
      <p><strong>Velocidad del viento:</strong> &gt;300 km/h</p>
    </div>
  `);

  atmosphericZone.bindPopup(`
    <div style="text-align: center;">
      <h3 style="color: #0088ff; margin: 0 0 10px 0;">🌪️ Efectos Atmosféricos</h3>
      <p><strong>Radio:</strong> 2000 km</p>
      <p><strong>Efectos:</strong> Cambios climáticos temporales</p>
      <p><strong>Duración:</strong> Meses a años</p>
    </div>
  `);

  // Agregar leyenda
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'impact-legend');
    div.style.cssText = `
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      line-height: 1.4;
    `;
    div.innerHTML = `
      <h4 style="margin: 0 0 8px 0; color: #fff;">Leyenda de Impacto</h4>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background: #ff0000; border-radius: 50%; margin-right: 8px;"></div>
        <span>Impacto Directo (15 km)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background: #ff8800; border-radius: 50%; margin-right: 8px;"></div>
        <span>Devastación (100 km)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background: #ffaa00; border-radius: 50%; margin-right: 8px;"></div>
        <span>Ondas de Choque (500 km)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background: #0088ff; border-radius: 50%; margin-right: 8px;"></div>
        <span>Efectos Atmosféricos (2000 km)</span>
      </div>
    `;
    return div;
  };
  legend.addTo(map);
};

const ImpactMap = ({ 
  impactLat = 40.7128, 
  impactLng = -74.0060, 
  impactRadius = 15, // km
  devastationRadius = 100, // km
  shockwaveRadius = 500, // km
  atmosphericRadius = 2000 // km
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Crear el mapa
      const map = L.map(mapRef.current, {
        center: [impactLat, impactLng],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });
      mapInstanceRef.current = map;

      // Crear círculos de impacto
      const impactZone = L.circle([impactLat, impactLng], {
        color: '#ff0000',
        fillColor: '#ff0000',
        fillOpacity: 0.8,
        radius: impactRadius * 1000, // Convertir km a metros
        weight: 3
      });

      const devastationZone = L.circle([impactLat, impactLng], {
        color: '#ff8800',
        fillColor: '#ff8800',
        fillOpacity: 0.4,
        radius: devastationRadius * 1000,
        weight: 2
      });

      const shockwaveZone = L.circle([impactLat, impactLng], {
        color: '#ffaa00',
        fillColor: '#ffaa00',
        fillOpacity: 0.2,
        radius: shockwaveRadius * 1000,
        weight: 2
      });

      const atmosphericZone = L.circle([impactLat, impactLng], {
        color: '#0088ff',
        fillColor: '#0088ff',
        fillOpacity: 0.1,
        radius: atmosphericRadius * 1000,
        weight: 1
      });

      // Agregar marcador del impacto
      const impactMarker = L.marker([impactLat, impactLng], {
        icon: createCustomIcon('#ff0000')
      });

      // Agregar capa de tiles con timeout para asegurar que se cargue
      setTimeout(() => {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);
        
        // Agregar todos los elementos al mapa
        impactZone.addTo(map);
        devastationZone.addTo(map);
        shockwaveZone.addTo(map);
        atmosphericZone.addTo(map);
        impactMarker.addTo(map);
        
        // Forzar redimensionamiento
        map.invalidateSize();
        
        // Ajustar la vista para mostrar todas las zonas
        const group = new L.featureGroup([impactZone, devastationZone, shockwaveZone, atmosphericZone]);
        map.fitBounds(group.getBounds().pad(0.1));
        
        // Configurar popups y leyenda después de que el mapa esté listo
        setupMapElements(map, impactZone, devastationZone, shockwaveZone, atmosphericZone, impactMarker);
      }, 200);

      // Cleanup function
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [impactLat, impactLng, impactRadius, devastationRadius, shockwaveRadius, atmosphericRadius]);

  return (
    <div className="w-full h-full">
      <style jsx>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
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

export default ImpactMap;