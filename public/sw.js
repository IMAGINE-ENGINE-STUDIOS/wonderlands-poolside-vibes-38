const CACHE_NAME = 'wonderlands-cache-v3';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Assets to cache
const urlsToCache = [
  '/',
  '/assets/',
  '/lovable-uploads/',
];

// Install event - cache initial resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache will be populated as resources are requested
        return cache;
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only cache GET requests for static assets
  if (request.method !== 'GET') return;
  
  // Never cache source files
  if (url.pathname.startsWith('/src/') || url.pathname.endsWith('.tsx')) return;
  
  // Cache static assets (images, CSS, JS)
  if (
    url.pathname.startsWith('/lovable-uploads/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            // Check if cached response is still valid (within cache duration)
            const cachedDate = new Date(response.headers.get('sw-cached-date') || 0);
            const now = new Date();
            
            if (now - cachedDate < CACHE_DURATION) {
              return response;
            }
          }
          
          // Fetch from network and cache the response
          return fetch(request).then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              
              // Add timestamp header for cache validation
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-date', new Date().toISOString());
              
              const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              });
              
              cache.put(request, cachedResponse);
            }
            
            return networkResponse;
          });
        });
      })
    );
  }
});