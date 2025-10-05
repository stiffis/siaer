/**
 * Vista orbital reutilizando el visualizador del sistema solar
 * para mostrar únicamente la Tierra y el NEO seleccionado.
 */

import React, { useMemo } from "react";
import SolarSystemVisualization from "./SolarSystemVisualization";

const DEFAULT_EARTH = {
  name: "Tierra",
  color: "#6ba4ff",
  orbitColor: "#3fa9f5",
  radiusKm: 6371,
  semiMajorAxisKm: 0,
  eccentricity: 0,
  inclinationDeg: 0,
  longitudeOfAscendingNodeDeg: 0,
  argumentOfPeriapsisDeg: 0,
  meanAnomalyDeg: 0,
  orbitalPeriodDays: 1,
  isStationary: true,
  textureUrl: "/textures/earth-daymap.jpg",
};

const DEFAULT_NEO = {
  name: "NEO",
  color: "#2B7BFF",
  orbitColor: "#7cf9ff",
  radiusKm: 1,
  semiMajorAxisKm: 1.2 * 149_597_870.7,
  eccentricity: 0.1,
  inclinationDeg: 5,
  longitudeOfAscendingNodeDeg: 40,
  argumentOfPeriapsisDeg: 30,
  meanAnomalyDeg: 0,
  orbitalPeriodDays: 450,
  isNeo: true,
};

function normalizePlanet(data, fallback) {
  if (!data) {
    return fallback;
  }

  return {
    ...fallback,
    ...data,
    color: data.color || fallback.color,
    orbitColor: data.orbitColor || data.color || fallback.orbitColor,
    radiusKm: Number.isFinite(data.radiusKm)
      ? data.radiusKm
      : fallback.radiusKm,
    semiMajorAxisKm: Number.isFinite(data.semiMajorAxisKm)
      ? data.semiMajorAxisKm
      : fallback.semiMajorAxisKm,
    eccentricity: Number.isFinite(data.eccentricity)
      ? data.eccentricity
      : fallback.eccentricity,
    inclinationDeg: Number.isFinite(data.inclinationDeg)
      ? data.inclinationDeg
      : fallback.inclinationDeg,
    longitudeOfAscendingNodeDeg: Number.isFinite(
      data.longitudeOfAscendingNodeDeg,
    )
      ? data.longitudeOfAscendingNodeDeg
      : fallback.longitudeOfAscendingNodeDeg,
    argumentOfPeriapsisDeg: Number.isFinite(data.argumentOfPeriapsisDeg)
      ? data.argumentOfPeriapsisDeg
      : fallback.argumentOfPeriapsisDeg,
    meanAnomalyDeg: Number.isFinite(data.meanAnomalyDeg)
      ? data.meanAnomalyDeg
      : fallback.meanAnomalyDeg,
    orbitalPeriodDays: Number.isFinite(data.orbitalPeriodDays)
      ? data.orbitalPeriodDays
      : fallback.orbitalPeriodDays,
  };
}

export default function OrbitalVisualization({
  earthOrbitData,
  neoOrbitData,
  timeScale = 1,
  generatedAt,
  onCollision,
  className = "h-full w-full",
  focusBodyName = "Tierra",
  followFocus = true,
  cameraDistanceMultiplier = 0.9,
  showStars = true,
}) {
  const earthPlanet = useMemo(() => {
    // Si tenemos datos del backend, usarlos; si no, usar DEFAULT_EARTH
    if (earthOrbitData) {
      const normalized = normalizePlanet(earthOrbitData, DEFAULT_EARTH);
      if ((normalized.name || '').toLowerCase() === 'tierra') {
        return {
          ...normalized,
          semiMajorAxisKm: 0,
          eccentricity: 0,
          inclinationDeg: 0,
          longitudeOfAscendingNodeDeg: 0,
          argumentOfPeriapsisDeg: 0,
          meanAnomalyDeg: 0,
          orbitalPeriodDays: 1,
          isStationary: true,
        };
      }
      return normalized;
    }
    return DEFAULT_EARTH;
  }, [earthOrbitData]);

  const neoObject = useMemo(() => {
    const normalized = normalizePlanet(neoOrbitData, DEFAULT_NEO);
    return {
      ...normalized,
      color: normalized.color || DEFAULT_NEO.color,
      orbitColor:
        normalized.orbitColor || normalized.color || DEFAULT_NEO.orbitColor,
      radiusKm: normalized.radiusKm ?? DEFAULT_NEO.radiusKm,
      isNeo: true,
      isImpactor: neoOrbitData?.isImpactor || false,
    };
  }, [neoOrbitData]);

  const planets = useMemo(() => [earthPlanet], [earthPlanet]);
  const neoObjects = useMemo(() => [neoObject], [neoObject]);

  return (
    <SolarSystemVisualization
      className={className}
      planets={planets}
      neoObjects={neoObjects}
      generatedAt={generatedAt}
      timeScale={timeScale}
      onCollision={onCollision}
      focusBodyName={focusBodyName}
      followFocus={followFocus}
      cameraDistanceMultiplier={cameraDistanceMultiplier}
      showStars={showStars}
      alwaysShowLabels
    />
  );
}
