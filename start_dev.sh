#!/bin/bash

# Script para iniciar el frontend de MeteorMadness
# Asegúrate de que el backend esté corriendo en http://localhost:5000

echo "🚀 Iniciando MeteorMadness Frontend..."
echo "========================================="
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "⚠️  Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar si el backend está corriendo
echo "🔍 Verificando backend..."
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend disponible en http://localhost:5000"
else
    echo "❌ Backend NO disponible en http://localhost:5000"
    echo ""
    echo "Para iniciar el backend, ejecuta:"
    echo "cd ../backend && python app.py"
    echo ""
    echo "Presiona cualquier tecla para continuar de todos modos..."
    read -n 1
fi

echo ""
echo "🌐 Iniciando servidor de desarrollo..."
echo "📱 Frontend disponible en: http://localhost:5173"
echo ""
echo "Controles:"
echo "  - Usa los sliders para modificar elementos orbitales"
echo "  - Prueba los presets (ISS, Molniya, CRASH)"
echo "  - Controla la animación con Play/Pause/Reset"
echo "  - Ajusta la velocidad de animación"
echo ""

# Iniciar el servidor de desarrollo
npm run dev