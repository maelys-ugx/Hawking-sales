// /Hawking-sales/sw.js
const VERSION = 'v1.0.0';
const CACHE_NAME = `hawking-${VERSION}`;
const APP_SHELL = [
  '/Hawking-sales/field_assistant.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)));
});

// Nettoie les anciens caches quand la version change
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// Sert les fichiers du cache si possible, sinon va sur le réseau
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (req.method === 'GET' && res.ok && new URL(req.url).origin === location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Si hors-ligne et navigation, retombe sur la page principale
        if (req.mode === 'navigate') {
          return caches.match('/Hawking-sales/field_assistant.html');
        }
      });
    })
  );
});
