import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Función para registrar un observador de animaciones y aplicar clases cuando los elementos entran en la pantalla
const registerAnimationObserver = () => {
  // Solo aplicar en navegadores que soporten IntersectionObserver
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Desobservar después de aplicar la animación (para evitar repetir)
          if (entry.target.dataset.once !== 'false') {
            animationObserver.unobserve(entry.target);
          }
        } else if (entry.target.dataset.once === 'false') {
          // Si se configura para repetir la animación, eliminar la clase
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    // Seleccionar todos los elementos con la clase animate-on-scroll
    document.addEventListener('DOMContentLoaded', () => {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => animationObserver.observe(el));
    });
  }
};

// Optimizaciones para carga inicial
const optimizeInitialLoad = () => {
  // Marcar el tiempo de carga
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Registrar métrica de rendimiento
      if (window.performance && window.performance.mark) {
        window.performance.mark('app-loaded');
      }
    }, 0);
  });
};

// Inicializar optimizaciones
registerAnimationObserver();
optimizeInitialLoad();

// React Router warning dapat diabaikan karena hanya peringatan untuk versi mendatang

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render without StrictMode to prevent double renders
root.render(<App />);

// Register service worker with better error handling
/* Temporarily disabled to troubleshoot refresh issues
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js', {
      scope: '/'
    }).then(registration => {
      console.log('SW registered: ', registration);
    }).catch(error => {
      console.log('SW registration failed: ', error);
    });
  });
} else {
  console.log('Service workers are not supported in this browser');
}
*/
