/* ==========================================================================
   Resoluta Finance — Service Worker (PWA)
   Cache do app shell + estratégia network-first para navegação.
   ========================================================================== */
var CACHE = 'resoluta-v4-supabase';
var ASSETS = [
  './',
  './index.html',
  './app.html',
  './aprenda.html',
  './privacidade.html',
  './termos.html',
  './style.css',
  './app.css',
  './finance.js',
  './store.js',
  './auth.js',
  './supabase.js',
  './a11y.js',
  './script.js',
  './app.js',
  './aprenda.js',
  './pwa.js',
  './manifest.webmanifest',
  './assets/logo-resoluta.png',
  './assets/equipe-resoluta.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(ASSETS.map(function (a) {
      return c.add(a).catch(function () { /* ignora itens externos/ausentes */ });
    }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|vlibras\.gov\.br/.test(url.host)) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match('./index.html'); }); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
