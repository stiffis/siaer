/**
 * Controles de animación para la simulación orbital
 */

import React, { useState } from 'react';

// Componente de botón de control
function ControlButton({ onClick, disabled, children, className = "", title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2 bg-transparent hover:bg-white/10 
                  disabled:bg-transparent disabled:text-gray-500 disabled:border-transparent
                  border border-transparent rounded-lg transition-colors
                  text-white font-medium text-sm
                  ${className}`}
    >
      {children}
    </button>
  );
}

// Componente de slider de velocidad
function SpeedSlider({ speed, onSpeedChange, disabled }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-300">Lento</span>
      <input
        type="range"
        min={0.1}
        max={5}
        step={0.1}
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={`slider-range flex-1 ${disabled ? 'slider-range--disabled' : ''}`}
      />
      <span className="text-xs text-gray-300">Rápido</span>
      <span className="text-xs text-gray-200 min-w-[3rem] text-right">
        {speed.toFixed(1)}x
      </span>
    </div>
  );
}

// Componente de barra de progreso
function ProgressBar({ current, total, onSeek, disabled }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const handleClick = (e) => {
    if (disabled || !onSeek) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercentage = x / rect.width;
    const newFrame = Math.floor(clickPercentage * total);
    
    onSeek(Math.max(0, Math.min(newFrame, total - 1)));
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs text-gray-300 min-w-[4rem]">
        {Math.floor(current / 60).toString().padStart(2, '0')}:{(current % 60).toString().padStart(2, '0')}
      </span>
      
      <div 
        className="flex-1 h-3 bg-transparent rounded-lg cursor-pointer relative overflow-hidden"
        onClick={handleClick}
      >
        <div 
          className="h-full bg-white/50 transition-all duration-100 rounded-lg"
          style={{ width: `${percentage}%` }}
        />
        {/* Marcador de posición actual */}
        <div 
          className="absolute top-0 w-1 h-full bg-white/80 opacity-80"
          style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
        />
      </div>
      
      <span className="text-xs text-gray-300 min-w-[4rem] text-right">
        {Math.floor(total / 60).toString().padStart(2, '0')}:{(total % 60).toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// Componente principal de controles de animación
export default function AnimationControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  currentFrame,
  totalFrames,
  onFrameSeek,
  speed,
  onSpeedChange,
  simulationData,
  disabled = false,
  className = ""
}) {
  const [showInfo, setShowInfo] = useState(false);

  // Información del frame actual
  const currentTime = simulationData?.trajectory?.times?.[currentFrame] || 0;
  const totalTime = simulationData?.trajectory?.times?.[totalFrames - 1] || 0;
  
  // Información de impacto
  const impactInfo = simulationData?.analysis?.impact;
  const isAtImpact = impactInfo?.will_impact && 
    currentFrame >= (impactInfo.impact_index || 0);

  return (
    <div className={`bg-transparent border-t border-transparent px-3 py-3 text-gray-100 ${className}`}>
      {/* Controles principales */}
      <div className="flex items-center justify-between mb-3">
        {/* Grupo de controles de reproducción */}
        <div className="flex items-center space-x-2">
          <ControlButton
            onClick={onReset}
            disabled={disabled}
            title="Reiniciar simulación"
          >
            ⏮️ Reset
          </ControlButton>
          
          <ControlButton
            onClick={isPlaying ? onPause : onPlay}
            disabled={disabled || totalFrames === 0}
            title={isPlaying ? "Pausar animación" : "Reproducir animación"}
            className="px-6"
          >
            {isPlaying ? '⏸️ Pausa' : '▶️ Play'}
          </ControlButton>
        </div>

        {/* Información del estado */}
        <div className="flex items-center space-x-4">
          {isAtImpact && (
            <div className="flex items-center text-red-400 text-sm font-semibold animate-pulse">
              ⚠️ IMPACTO
            </div>
          )}
          
          <div className="text-sm text-gray-300">
            Frame: {currentFrame + 1}/{totalFrames}
          </div>
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showInfo ? '🔽 Menos info' : '🔼 Más info'}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <ProgressBar
          current={currentFrame}
          total={totalFrames}
          onSeek={onFrameSeek}
          disabled={disabled}
        />
      </div>

      {/* Control de velocidad */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-200">Velocidad de Animación</span>
        </div>
        <SpeedSlider
          speed={speed}
          onSpeedChange={onSpeedChange}
          disabled={disabled}
        />
      </div>

      {/* Información extendida */}
      {showInfo && simulationData && (
        <div className="border-t border-gray-800 pt-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Información temporal */}
            <div>
              <h4 className="text-gray-100 font-semibold mb-2">⏱️ Tiempo</h4>
              <div className="space-y-1 text-gray-300">
                <div>Actual: {(currentTime / 3600).toFixed(2)} h</div>
                <div>Total: {(totalTime / 3600).toFixed(2)} h</div>
                {impactInfo?.will_impact && (
                  <div className="text-rose-400">
                    Impacto en: {(impactInfo.impact_time / 3600).toFixed(2)} h
                  </div>
                )}
              </div>
            </div>

            {/* Información orbital */}
            <div>
              <h4 className="text-gray-100 font-semibold mb-2">🛰️ Órbita</h4>
              <div className="space-y-1 text-gray-300">
                {simulationData.orbital_info && (
                  <>
                    <div>
                      Período: {simulationData.orbital_info.orbital_period_hours.toFixed(2)} h
                    </div>
                    <div>
                      Perigeo: {simulationData.orbital_info.perigee_altitude.toFixed(0)} km
                    </div>
                    <div>
                      Apogeo: {simulationData.orbital_info.apogee_altitude.toFixed(0)} km
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Análisis de la simulación */}
          {simulationData.analysis && (
            <div className="mt-4">
              <h4 className="text-gray-100 font-semibold mb-2">📊 Análisis</h4>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-300">
                <div>
                  <div>Alt. mín: {simulationData.analysis.min_altitude.toFixed(0)} km</div>
                  <div>Alt. máx: {simulationData.analysis.max_altitude.toFixed(0)} km</div>
                </div>
                <div>
                  <div>Vel. prom: {simulationData.analysis.avg_velocity.toFixed(2)} km/s</div>
                  <div>Puntos: {simulationData.trajectory.positions.length}</div>
                </div>
                <div>
                  {impactInfo?.will_impact ? (
                    <div className="text-rose-400">
                      ⚠️ Impacto detectado
                    </div>
                  ) : (
                    <div className="text-emerald-300">
                      ✅ Órbita estable
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
