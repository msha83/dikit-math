#!/bin/bash

# Script de despliegue para la aplicación de Educación Matemática
# Este script compila la aplicación para producción y la prepara para el hosting

echo "🚀 Iniciando despliegue para producción..."

# Verificar si el directorio de trabajo es correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: El script debe ejecutarse desde el directorio raíz del proyecto!"
  exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Limpiar directorios de compilación previos
echo "🧹 Limpiando compilaciones previas..."
rm -rf dist

# Compilar para producción
echo "🏗️ Compilando para producción..."
npm run build

# Verificar si la compilación fue exitosa
if [ ! -d "dist" ]; then
  echo "❌ Error: La compilación falló!"
  exit 1
fi

# Optimizar imágenes si las herramientas están disponibles
if command -v imagemin &> /dev/null; then
  echo "🖼️ Optimizando imágenes..."
  find dist -type f -name "*.png" -exec imagemin {} --out-dir={} \;
  find dist -type f -name "*.jpg" -exec imagemin {} --out-dir={} \;
  find dist -type f -name "*.jpeg" -exec imagemin {} --out-dir={} \;
fi

# Crear el archivo _redirects para Netlify (si se usa Netlify)
echo "↪️ Configurando redirecciones para SPA..."
echo "/* /index.html 200" > dist/_redirects

# Crear archivo robots.txt si no existe
if [ ! -f "dist/robots.txt" ]; then
  echo "🤖 Creando robots.txt..."
  echo "User-agent: *" > dist/robots.txt
  echo "Allow: /" >> dist/robots.txt
  echo "Sitemap: https://mathedu-app.com/sitemap.xml" >> dist/robots.txt
fi

# Calcular el tamaño total de la compilación
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "📊 Tamaño total de la compilación: $TOTAL_SIZE"

# Comprimir archivos para hosting si está disponible el comando gzip
if command -v gzip &> /dev/null; then
  echo "🗜️ Comprimiendo archivos estáticos..."
  find dist -type f -name "*.js" -exec gzip -9 -k {} \;
  find dist -type f -name "*.css" -exec gzip -9 -k {} \;
  find dist -type f -name "*.html" -exec gzip -9 -k {} \;
fi

echo "✅ ¡Compilación para producción completada y optimizada!"
echo "📂 Los archivos listos para despliegue están en el directorio 'dist'"
echo "🌐 Para probar localmente: npm run preview"
echo ""
echo "Para desplegar en hosting:"
echo "- Netlify: netlify deploy --prod"
echo "- Vercel: vercel --prod"
echo "- Firebase: firebase deploy --only hosting"
echo "- Servidor propio: Copie el contenido del directorio 'dist' a su servidor web"

# Hacer el archivo ejecutable
chmod +x deploy.sh 