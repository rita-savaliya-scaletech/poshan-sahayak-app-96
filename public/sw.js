// sw.js
const CACHE_VERSION = 'v2'; // bump this on each deploy (e.g. v3, v4...)
const CACHE_NAME = `poshan-tracker-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  // add any other static files you always want cached
];

self.addEventListener('install', (event) => {
  // Activate new SW as soon as it's installed
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  // Take control immediately and remove old caches
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // For navigation requests (HTML pages), try network first (get latest index.html)
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          // Only cache http(s) requests
          if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other GET requests (assets), try cache first, fallback to network and update cache
  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((networkRes) => {
            // Put a copy in cache for future
            if (networkRes && networkRes.status === 200) {
              const copy = networkRes.clone();
              // Only cache http(s) requests
              if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
              }
            }
            return networkRes;
          })
          .catch(() => cached); // if network fails and no cached, it will resolve to undefined
      })
    );
  }
});

// Optional: background sync handler (keep if you need it)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // handle background sync tasks
  return Promise.resolve();
}
