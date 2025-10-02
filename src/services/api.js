/**
 * Servicio para comunicación con la API del backend MeteorMadness
 */

import axios from 'axios';

// URL base del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos timeout para simulaciones
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Servicio de API para MeteorMadness
 */
export class MeteorMadnessAPI {
  /**
   * Verifica el estado de salud del backend
   */
  static async healthCheck() {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene la información de bienvenida de la API
   */
  static async getWelcome() {
    try {
      const response = await api.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene todos los presets orbitales disponibles
   */
  static async getPresets() {
    try {
      const response = await api.get('/api/orbital/presets');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Valida elementos orbitales sin ejecutar simulación
   * @param {Object} elements - Elementos orbitales
   * @param {number} elements.a - Semi-eje mayor (km)
   * @param {number} elements.e - Excentricidad (0-1)
   * @param {number} elements.i - Inclinación (grados)
   * @param {number} elements.omega - Argumento del periapsis (grados)
   * @param {number} elements.Omega - Longitud del nodo ascendente (grados)
   * @param {number} elements.M0 - Anomalía media inicial (grados)
   */
  static async validateElements(elements) {
    try {
      const response = await api.post('/api/orbital/elements', { elements });
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }

  /**
   * Ejecuta una simulación orbital completa
   * @param {Object} params - Parámetros de la simulación
   * @param {Object} params.elements - Elementos orbitales
   * @param {number} [params.duration=7200] - Duración en segundos (default: 2 horas)
   * @param {number} [params.timestep=60] - Paso de tiempo en segundos (default: 60s)
   */
  static async simulate(params) {
    try {
      const payload = {
        elements: params.elements,
        duration: params.duration || 7200,
        timestep: params.timestep || 60
      };

      const response = await api.post('/api/orbital/simulate', payload);
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }

  /**
   * Simula usando un preset predefinido
   * @param {string} presetName - Nombre del preset
   * @param {number} [duration=7200] - Duración en segundos
   * @param {number} [timestep=60] - Paso de tiempo en segundos
   */
  static async simulatePreset(presetName, duration = 7200, timestep = 60) {
    try {
      // Primero obtener el preset
      const presetsResult = await this.getPresets();
      if (!presetsResult.success) {
        return presetsResult;
      }

      const preset = presetsResult.data.presets[presetName];
      if (!preset) {
        return { 
          success: false, 
          error: `Preset '${presetName}' no encontrado` 
        };
      }

      // Luego ejecutar la simulación
      return await this.simulate({
        elements: preset.elements,
        duration,
        timestep
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Busca objetos NEO usando el backend (proxy SBDB Query)
   * @param {string} query - Texto de búsqueda
   * @param {number} [limit=10] - Límite de resultados
   */
  static async searchNeoObjects(query, limit = 10) {
    if (!query || !query.trim()) {
      return { success: true, data: { results: [], count: 0 } };
    }

    try {
      const response = await api.get('/api/neo/search', {
        params: { q: query.trim(), limit }
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }

  /**
   * Obtiene los datos detallados de un NEO desde el backend
   * @param {string} designation - Identificador/designación del NEO
   */
  static async getNeoObject(designation) {
    if (!designation) {
      return { success: false, error: { error: 'Designación requerida' } };
    }

    try {
      const response = await api.get('/api/neo/object', {
        params: { designation }
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }

  /**
   * Obtiene el estado orbital aproximado de los planetas del sistema solar
   */
  static async getSolarSystemState() {
    try {
      const response = await api.get('/api/solar/system');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }

  /**
   * Obtiene los datos del meteorito IMPACTOR-2025
   */
  static async getImpactor2025() {
    try {
      const response = await api.get('/api/impactor/2025');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorData = error.response?.data || { error: error.message };
      return { success: false, error: errorData };
    }
  }
}

export default MeteorMadnessAPI;
