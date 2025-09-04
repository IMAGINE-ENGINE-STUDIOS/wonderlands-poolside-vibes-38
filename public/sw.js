const CACHE_NAME = 'wonderlands-cache-v6';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Assets to cache initially
const urlsToCache = [
  '/'
];

// Install event - cache initial assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
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

// Fetch event - network first for critical resources, cache for others
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Exclude source files from caching
  if (event.request.url.includes('/src/') || 
      event.request.url.includes('.tsx') || 
      event.request.url.includes('.ts') ||
      event.request.url.includes('main.tsx')) {
    return fetch(event.request);
  }

  // Network first strategy for HTML, JS, CSS
  if (event.request.url.match(/\.(html|js|css)$/) || 
      event.request.destination === 'document' ||
      event.request.url.includes('main.js') ||
      event.request.url.includes('index.js')) {
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first strategy for images and other static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Check if the cached response is still valid
          const cachedTime = response.headers.get('sw-cache-time');
          if (cachedTime) {
            const cacheAge = Date.now() - parseInt(cachedTime);
            if (cacheAge < CACHE_DURATION) {
              return response;
            }
          }
        }

        // Fetch from network
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          const modifiedResponse = new Response(responseToCache.body, {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: {
              ...Object.fromEntries(responseToCache.headers.entries()),
              'sw-cache-time': Date.now().toString()
            }
          });

          // Cache images and static assets
          if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ico)$/)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, modifiedResponse.clone());
              });
          }

          return response;
        }).catch(() => {
          return response || new Response('Network error occurred', { 
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});