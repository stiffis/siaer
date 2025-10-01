# 🚀 MeteorMadness Frontend

Frontend moderno para el simulador orbital MeteorMadness, construido con React 19 + Vite + Three.js + Tailwind CSS.

## 🎯 Características

### 🌟 **Visualización 3D Avanzada**
- **Three.js + React Three Fiber**: Renderizado 3D optimizado
- **Tierra 3D interactiva**: Modelo esférico con rotación
- **Trayectorias orbitales**: Visualización completa de órbitas
- **Satélite animado**: Movimiento en tiempo real con efectos visuales
- **Detección de impactos**: Alertas visuales cuando la órbita impacta

### 🎮 **Panel de Control Interactivo**
- **Elementos orbitales keplerianos**: Controles para todos los parámetros
  - Semi-eje mayor (a)
  - Excentricidad (e) 
  - Inclinación (i)
  - Argumento del periapsis (ω)
  - Longitud del nodo ascendente (Ω)
  - Anomalía media (M₀)
- **Validación en tiempo real**: Feedback inmediato de parámetros
- **Información orbital**: Período, perigeo, apogeo calculados automáticamente

### 🛰️ **Presets Integrados**
- **ISS**: Órbita real de la Estación Espacial Internacional
- **Geoestacionaria**: Satélite geoestacionario
- **Molniya**: Órbita elíptica rusa de comunicaciones
- **Polar**: Órbita de observación terrestre
- **CRASH**: ⚠️ Órbita educativa de impacto

### 🎬 **Controles de Animación**
- **Play/Pause/Reset**: Control completo de la simulación
- **Velocidad ajustable**: 0.1x a 5x velocidad de reproducción
- **Scrubbing**: Navegación directa a cualquier punto de la simulación
- **Información en tiempo real**: Tiempo transcurrido, estado orbital

### 🎨 **UI Moderna y Espacial**
- **Tema oscuro espacial**: Colores y gradientes inspirados en el espacio
- **Tailwind CSS**: Diseño moderno y responsive
- **Animaciones suaves**: Transiciones y efectos visuales
- **Controles intuitivos**: Sliders y botones optimizados para UX

## 🛠️ Tecnologías

- **React 19**: Framework frontend moderno
- **Vite**: Build tool rápido y optimizado
- **Three.js**: Biblioteca 3D para WebGL
- **React Three Fiber**: Integración React-Three.js
- **React Three Drei**: Helpers y componentes 3D
- **Tailwind CSS**: Framework de utilidades CSS
- **Axios**: Cliente HTTP para API

## 🚀 Inicio Rápido

### Prerequisitos

1. **Node.js 18+** instalado
2. **Backend de MeteorMadness** ejecutándose en `http://localhost:5000`

### Instalación

```bash
# Navegar al directorio del frontend
cd frontend/siaer

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# O usar el script de desarrollo
./start_dev.sh
```

### Verificar Backend

El frontend necesita que el backend esté corriendo:

```bash
# En otra terminal
cd backend
source venv/bin/activate
python app.py
```

## 🌐 Uso

1. **Abre tu navegador** en `http://localhost:5173`

2. **Conecta con el backend**: La aplicación verificará automáticamente la conexión

3. **Experimenta con órbitas**:
   - Usa los sliders para modificar elementos orbitales
   - Prueba diferentes presets (ISS, CRASH, etc.)
   - Observa cómo cambian las órbitas en tiempo real

4. **Controla la animación**:
   - Presiona **Play** para ver el satélite orbitando
   - Ajusta la **velocidad** para simulaciones rápidas o lentas
   - Usa **Reset** para volver al inicio

5. **Explora los controles de cámara**:
   - **Arrastrar**: Rotar vista
   - **Rueda del ratón**: Zoom in/out
   - **Clic derecho + arrastrar**: Pan/desplazar vista

## 📊 Elementos Orbitales

### Parámetros Controlables

| Parámetro | Símbolo | Rango | Descripción |
|-----------|---------|--------|-------------|
| Semi-eje mayor | a | 6,000 - 50,000 km | Tamaño de la órbita |
| Excentricidad | e | 0.0 - 0.99 | Forma elíptica (0=circular, 0.99=muy elíptica) |
| Inclinación | i | 0° - 180° | Ángulo respecto al ecuador |
| Arg. Periapsis | ω | 0° - 360° | Orientación de la elipse |
| Long. Nodo Asc. | Ω | 0° - 360° | Rotación del plano orbital |
| Anomalía Media | M₀ | 0° - 360° | Posición inicial del satélite |

### Información Calculada Automáticamente

- **Período orbital**: Tiempo para completar una órbita
- **Altitud de perigeo**: Altura mínima sobre la Tierra
- **Altitud de apogeo**: Altura máxima sobre la Tierra
- **Detección de impacto**: Si la órbita intersecta la superficie terrestre

## 🎮 Presets Educativos

### ISS (Estación Espacial Internacional)
- Órbita real de la ISS
- Altitud: ~400 km
- Período: ~90 minutos
- Inclinación: 51.6°

### Geoestacionaria
- Satélite que permanece sobre un punto de la Tierra
- Altitud: ~35,786 km
- Período: 24 horas
- Inclinación: 0°

### Molniya
- Órbita elíptica rusa de comunicaciones
- Período: ~12 horas
- Alta excentricidad
- Inclinación: 63.4°

### ⚠️ CRASH (Educativo)
- Órbita de impacto con la Tierra
- Perigeo por debajo de la superficie
- Para demostrar órbitas inviables

## 🔧 Desarrollo

### Estructura del Proyecto

```
src/
├── components/           # Componentes React
│   ├── OrbitalVisualization.jsx    # Visualización 3D
│   ├── ControlPanel.jsx            # Panel de controles
│   └── AnimationControls.jsx       # Controles de animación
├── services/            # Servicios de API
│   └── api.js          # Comunicación con backend
├── App.jsx             # Componente principal
├── App.css            # Estilos personalizados
└── main.jsx           # Punto de entrada
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev         # Servidor de desarrollo (puerto 5173)
./start_dev.sh     # Script con verificación de backend

# Construcción
npm run build      # Build para producción
npm run preview    # Vista previa del build

# Linting
npm run lint       # Verificar código con ESLint
```

### API Backend

El frontend se conecta a estos endpoints del backend:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Verificar estado del backend |
| `/api/orbital/presets` | GET | Obtener presets de órbitas |
| `/api/orbital/simulate` | POST | Ejecutar simulación orbital |

## 🐛 Solución de Problemas

### Backend No Disponible
**Problema**: "Backend No Disponible" al abrir la aplicación

**Solución**:
```bash
cd backend
source venv/bin/activate
python app.py
```

### Errores de Simulación
**Problema**: Error al simular órbitas

**Posibles causas**:
- Parámetros orbitales inválidos
- Backend no responsive
- Problemas de red

**Solución**:
- Verifica que los parámetros estén en rangos válidos
- Reinicia el backend
- Usa el botón "Reintentar Conexión"

### Rendimiento 3D Lento
**Problema**: La visualización 3D es lenta

**Soluciones**:
- Reduce la calidad gráfica del navegador
- Cierra otras pestañas/aplicaciones
- Verifica que tu navegador soporte WebGL

### Problemas de Instalación
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node.js
node --version  # Debe ser 18+
```

## 🤝 Contribución

### Cómo Contribuir

1. **Fork** el proyecto
2. **Crea una rama** para tu feature
3. **Implementa** tu mejora
4. **Prueba** con diferentes presets y parámetros
5. **Envía** un pull request

### Áreas de Mejora

- **Más efectos visuales**: Estelas, partículas, etc.
- **Múltiples satélites**: Simulación de constelaciones
- **Texturas realistas**: Tierra con texturas, nubes
- **Métricas avanzadas**: Velocidades, aceleraciones
- **Export/Import**: Guardar y cargar configuraciones
- **Mobile responsive**: Mejor soporte para dispositivos móviles

## 📄 Licencia

Este proyecto es parte de MeteorMadness y está disponible bajo la licencia MIT.

## 🎉 ¡Disfruta Explorando el Espacio!

MeteorMadness te permite experimentar con la mecánica orbital de forma intuitiva y visual. Desde órbitas simples hasta complejas maniobras, ¡el espacio es el límite!

---

**¿Problemas?** Abre un issue en el repositorio
**¿Ideas?** ¡Las contribuciones son bienvenidas!

🚀 **¡Happy Orbiting!** 🌍