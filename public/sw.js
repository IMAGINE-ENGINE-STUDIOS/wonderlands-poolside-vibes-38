// No-op service worker - passthrough to ensure fresh assets
console.log('Service Worker: No-op passthrough mode active');

// Install event - just skip waiting
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing (no-op mode)');
  self.skipWaiting();
});

// Activate event - clean up ALL old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating (no-op mode)');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - passthrough everything to network (no caching)
self.addEventListener('fetch', (event) => {
  // Simply pass through all requests to the network
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.log('Service Worker: Network error:', error);
      return new Response('Network error occurred', { 
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});