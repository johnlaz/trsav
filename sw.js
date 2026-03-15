// TRSAV Service Worker v1.0.0 — GitHub Pages build (base: /trsav/)
// Strategy: Cache-first for assets, network-first for HTML, offline fallback

const CACHE_NAME = 'trsav-v1';
const BASE = '/trsav';
const OFFLINE_URL = BASE + '/offline.html';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/offline.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192x192.png',
  BASE + '/icons/icon-512x512.png',
  BASE + '/icons/apple-touch-icon.png'
];

// External resources to cache when first fetched
const CACHE_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /images\.unsplash\.com/
];

// ── Install: pre-cache critical assets ─────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: smart caching strategy ──────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and browser-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // HTML pages: Network-first, fallback to cache, then offline page
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // External fonts & images: Cache-first, fetch and store on miss
  const isExternal = CACHE_PATTERNS.some(p => p.test(url.href));
  if (isExternal) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Local assets (icons, etc): Cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
  }
});

// ── Background Sync: queue failed quote form submissions ───────
self.addEventListener('sync', event => {
  if (event.tag === 'quote-form-sync') {
    event.waitUntil(syncPendingForms());
  }
});

async function syncPendingForms() {
  // When implementing: retrieve pending submissions from IndexedDB
  // and POST them to your backend when connectivity is restored.
  console.log('[TRSAV SW] Background sync: quote forms');
}

// ── Push Notifications (ready for future use) ──────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'TRSAV', {
      body: data.body || 'You have a new update from Total Rental Solutions.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
