/**
 * Panel de controles para elementos orbitales y simulación
 */

import React, { useState, useEffect } from "react";

// Componente para sliders de parámetros orbitales
function OrbitalSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  disabled = false,
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-200">{label}</label>
        <span className="text-xs text-gray-400">
          {value.toFixed(step < 1 ? 3 : 1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className={`slider-range slider-range--lg ${disabled ? "slider-range--disabled" : ""}`}
        style={{
          width: "calc(100% + 1rem)",
          marginLeft: "-0.5rem",
          marginRight: "-0.5rem",
        }}
      />
    </div>
  );
}

// Componente para botones de preset
function PresetButton({ name, description, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full p-2 mb-2 text-left bg-transparent hover:bg-white/10 
                 disabled:bg-transparent disabled:opacity-50 
                 border border-transparent rounded-lg transition-colors
                 text-sm"
    >
      <div className="font-semibold text-gray-100">{name}</div>
      <div className="text-xs text-gray-400">{description}</div>
    </button>
  );
}

// Componente principal del panel de control
export default function ControlPanel({
  elements,
  onElementsChange,
  presets = {},
  onPresetSelect,
  simulationData,
  isLoading = false,
  simParams,
  onSimParamsChange,
  className = "",
}) {
  const [localElements, setLocalElements] = useState({
    a: 7000, // Semi-eje mayor (km)
    e: 0.2, // Excentricidad
    i: 28.5, // Inclinación (grados)
    omega: 0, // Argumento del periapsis (grados)
    Omega: 0, // Longitud del nodo ascendente (grados)
    M0: 0, // Anomalía media inicial (grados)
  });

  // Sincronizar con elementos externos
  useEffect(() => {
    if (elements) {
      setLocalElements(elements);
    }
  }, [elements]);

  // Manejar cambios en los elementos
  const handleElementChange = (key, value) => {
    const newElements = { ...localElements, [key]: value };
    setLocalElements(newElements);
    onElementsChange(newElements);
  };

  const handleSimParamChange = (key, value) => {
    const newParams = { ...simParams, [key]: value };
    onSimParamsChange(newParams);
  };

  // Manejar selección de preset
  const handlePresetClick = (presetKey) => {
    const preset = presets[presetKey];
    if (preset && preset.elements) {
      setLocalElements(preset.elements);
      onPresetSelect(presetKey, preset.elements);
    }
  };

  // Resetear a valores por defecto
  const handleReset = () => {
    const defaultElements = {
      a: 7000,
      e: 0.2,
      i: 28.5,
      omega: 0,
      Omega: 0,
      M0: 0,
    };
    setLocalElements(defaultElements);
    onElementsChange(defaultElements);
  };

  return (
    <div
      className={`bg-transparent border-r border-transparent text-gray-100 overflow-y-auto control-panel-scroll no-scrollbar ${className}`}
    >
      <div className="p-4">
        {/* Título */}
        <h2 className="text-xl font-bold text-gray-100 mb-6 text-center">
          🚀 Control Orbital
        </h2>

        {/* Información orbital */}
        {simulationData?.orbital_info && (
          <div className="mb-6 p-3 bg-transparent border border-white/10 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">
              📊 Información Orbital
            </h3>
            <div className="text-xs text-gray-300 space-y-1">
              <div>
                Período:{" "}
                {simulationData.orbital_info.orbital_period_hours.toFixed(2)} h
              </div>
              <div>
                Perigeo:{" "}
                {simulationData.orbital_info.perigee_altitude.toFixed(0)} km
              </div>
              <div>
                Apogeo: {simulationData.orbital_info.apogee_altitude.toFixed(0)}{" "}
                km
              </div>
              {simulationData.orbital_info.will_impact_earth && (
                <div className="text-rose-400 font-semibold">
                  ⚠️ IMPACTO:{" "}
                  {simulationData.orbital_info.impact_depth.toFixed(0)} km bajo
                  superficie
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controles de elementos orbitales */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Elementos Orbitales
          </h3>

          <OrbitalSlider
            label="Semi-eje mayor (a)"
            value={localElements.a}
            min={6000}
            max={50000}
            step={100}
            unit="km"
            onChange={(value) => handleElementChange("a", value)}
            disabled={isLoading}
          />

          <OrbitalSlider
            label="Excentricidad (e)"
            value={localElements.e}
            min={0}
            max={0.99}
            step={0.01}
            onChange={(value) => handleElementChange("e", value)}
            disabled={isLoading}
          />

          <OrbitalSlider
            label="Inclinación (i)"
            value={localElements.i}
            min={0}
            max={180}
            step={1}
            unit="°"
            onChange={(value) => handleElementChange("i", value)}
            disabled={isLoading}
          />

          <OrbitalSlider
            label="Arg. Periapsis (ω)"
            value={localElements.omega}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={(value) => handleElementChange("omega", value)}
            disabled={isLoading}
          />

          <OrbitalSlider
            label="Long. Nodo Asc. (Ω)"
            value={localElements.Omega}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={(value) => handleElementChange("Omega", value)}
            disabled={isLoading}
          />

          <OrbitalSlider
            label="Anomalía Media (M₀)"
            value={localElements.M0}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={(value) => handleElementChange("M0", value)}
            disabled={isLoading}
          />
        </div>

        {/* Parámetros de Simulación */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            Parámetros de Simulación
          </h3>
          <OrbitalSlider
            label="Duración de Simulación"
            value={simParams.duration / 3600} // Convertir a horas
            min={1}
            max={48}
            step={1}
            unit="horas"
            onChange={(value) => handleSimParamChange("duration", value * 3600)}
            disabled={isLoading}
          />
          <OrbitalSlider
            label="Paso de Tiempo"
            value={simParams.timestep / 60} // Convertir a minutos
            min={1}
            max={120}
            step={1}
            unit="minutos"
            onChange={(value) => handleSimParamChange("timestep", value * 60)}
            disabled={isLoading}
          />
        </div>

        {/* Botón de reset */}
        <div className="mb-6">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="w-full p-3 bg-transparent hover:bg-white/10 
                       disabled:bg-transparent disabled:text-gray-500 disabled:border-transparent disabled:cursor-not-allowed 
                       border border-white/10 rounded-lg transition-colors
                       text-white font-semibold"
          >
            🔄 Reset a Defecto
          </button>
        </div>

        {/* Presets */}
        {Object.keys(presets).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Presets de Órbitas
            </h3>

            {Object.entries(presets).map(([key, preset]) => (
              <PresetButton
                key={key}
                name={preset.name}
                description={preset.description}
                onClick={() => handlePresetClick(key)}
                disabled={isLoading}
              />
            ))}
          </div>
        )}

        {/* Estado de carga */}
        {isLoading && (
          <div className="mt-6 p-3 bg-transparent border border-white/10 rounded-xl">
            <div className="flex items-center justify-center text-gray-200">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
              Calculando órbita...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
