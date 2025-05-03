// This is the service worker for the math education platform
const CACHE_NAME = 'math-app-v1';

// Resources to cache initially
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Install the service worker and cache initial resources
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Clean up old caches when a new service worker activates
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  // Claim clients to control all open windows immediately
  event.waitUntil(self.clients.claim());
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Only handle same-origin requests to avoid CORS issues
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API requests to prevent caching dynamic data
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase') || 
      event.request.url.includes('rest')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache responses that aren't successful
        if (!response || response.status !== 200) {
          return response;
        }

        // Don't cache if the response has a no-cache header
        const cacheControl = response.headers.get('Cache-Control');
        if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('no-store'))) {
          return response;
        }

        // Clone the response before consuming it
        const responseToCache = response.clone();

        // Store in cache
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          })
          .catch(error => {
            console.error('Cache update failed:', error);
          });

        return response;
      })
      .catch(() => {
        // When network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
}); 