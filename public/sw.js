// NotariaPrime - Service Worker (mode hors-ligne)
// Stratégie : network-first pour HTML, cache-first pour assets statiques.

const CACHE_NAME = 'notariaprime-v2-doc-support';
const CORE_ASSETS = [
  '/',
  '/pretaxe',
  '/plusvalue',
  '/donation',
  '/sci',
  '/lmnp',
  '/ifi',
  '/viager',
  '/revenus-fonciers',
  '/investissement-locatif',
  '/plusvalue-pro',
  '/statut-juridique',
  '/holding',
  '/retraite',
  '/assurance-vie',
  '/pret',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first pour les navigations HTML, fallback cache
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Pour /_next/static (fichiers hashés, immuables) : cache-first OK
  // car le hash change à chaque build, donc pas de risque de stale code.
  // Pour les autres assets (images, polices, /sw.js, /pdf.worker.min.mjs) :
  // network-first avec fallback cache, pour qu'un nouveau déploiement soit
  // toujours pris en compte sans devoir vider le cache manuellement.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      })
    );
    return;
  }

  if (/\.(png|jpg|jpeg|svg|webp|ico|woff2?|mjs|js)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || Response.error()))
    );
  }
});
