import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Function to copy files during build
const copyServiceWorker = () => {
  return {
    name: 'copy-service-worker',
    closeBundle: async () => {
      // Copy service worker
      try {
        const swSource = resolve(__dirname, 'src/serviceWorker.js');
        const swDest = resolve(__dirname, 'dist/serviceWorker.js');
        
        fs.copyFileSync(swSource, swDest);
        console.log('✅ Service Worker copied successfully');
        
        // Copy 404.html and _redirects for SPA routing
        const redirectsSource = resolve(__dirname, 'public/_redirects');
        const redirectsDest = resolve(__dirname, 'dist/_redirects');
        fs.copyFileSync(redirectsSource, redirectsDest);
        console.log('✅ _redirects file copied successfully');
        
        const notFoundSource = resolve(__dirname, 'public/404.html');
        const notFoundDest = resolve(__dirname, 'dist/404.html');
        fs.copyFileSync(notFoundSource, notFoundDest);
        console.log('✅ 404.html file copied successfully');
      } catch (error) {
        console.error('❌ Error copying files:', error);
      }
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    copyServiceWorker()
  ],
  server: {
    port: 5173,
    // Handle client-side routing in development
    historyApiFallback: true,
    // Add strict cors to fix potential WebSocket issues
    cors: true,
    // Ensure middleware handles all routes properly
    middlewareMode: false,
    // Improve hot module replacement
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      overlay: true,
    },
  },
  preview: {
    port: 3000,
    // Also handle client-side routing in preview mode
    historyApiFallback: true,
  },
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database'],
          ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  // Asset optimization
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  // Enable debug logs if needed
  logLevel: process.env.VITE_DEBUG ? 'info' : 'warn',
});
