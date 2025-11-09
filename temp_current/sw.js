// Service Worker for GreenoFig
// Provides offline support and faster loading

const CACHE_NAME = 'greenofig-v2025-11-04-0230'; // Updated version to force cache refresh
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated with cache:', CACHE_NAME);
      return self.clients.claim();
    }).then(() => {
      // Force all clients to reload
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'CACHE_UPDATED' }));
      });
    })
  );
});

// Fetch event - Network-first for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Supabase API calls (always fetch fresh)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Skip OAuth callbacks
  if (event.request.url.includes('code=')) {
    return;
  }

  // Network-first strategy for HTML (always get fresh content)
  if (event.request.destination === 'document' || event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store',  // Force bypass browser cache on mobile
        headers: new Headers({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        })
      })
        .then((response) => {
          // Don't cache HTML anymore - always fetch fresh
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Network-first for JS files with hash (these change with each build)
  if (event.request.url.match(/\.(js)$/) && event.request.url.match(/\-[a-zA-Z0-9_-]{8,}\./)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the new version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for static assets (JS, CSS, images)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache static assets (JS, CSS, images)
          if (event.request.url.match(/\.(js|css|png|jpg|jpeg|svg|webp|gif|woff|woff2)$/)) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
