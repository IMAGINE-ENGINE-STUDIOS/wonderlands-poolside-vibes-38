// Service Worker for efficient caching
const CACHE_NAME = 'wonderlands-poolside-v1';
const STATIC_ASSETS = [
  // Images and media
  /.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  // JavaScript and CSS
  /.*\.(?:js|css)$/,
  // Fonts
  /.*\.(?:woff|woff2|eot|ttf|otf)$/
];

const LONG_CACHE_ASSETS = [
  // Lovable uploads (images that don't change often)
  /\/lovable-uploads\/.*/,
  // Bundled assets with hashes
  /\/assets\/.*/
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing caching service worker');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating caching service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Only cache GET requests for static assets
  if (method !== 'GET') return;
  
  const isStaticAsset = STATIC_ASSETS.some(pattern => pattern.test(url));
  const isLongCacheAsset = LONG_CACHE_ASSETS.some(pattern => pattern.test(url));
  
  if (!isStaticAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cached) => {
        if (cached) {
          // For long-cache assets, serve from cache immediately
          if (isLongCacheAsset) {
            return cached;
          }
          // For other assets, serve cached but update in background
          fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
          }).catch(() => {}); // Silently handle network errors
          return cached;
        }

        // Not in cache, fetch and cache
        return fetch(request).then((response) => {
          if (response.ok && response.status < 400) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch((error) => {
          console.log('Service Worker: Network error for', url, error);
          return new Response('Network error occurred', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      });
    })
  );
});