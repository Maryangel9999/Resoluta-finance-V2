/* ==========================================================================
   Resoluta Finance — Service Worker (PWA)
   v10 — CORREÇÃO CRÍTICA DE CACHE
   --------------------------------------------------------------------------
   PROBLEMA CORRIGIDO:
   A versão anterior usava estratégia "cache-first" para TODOS os assets,
   incluindo style.css, app.css e a11y.js. Como o nome do cache nunca era
   versionado, o navegador servia o CSS ANTIGO para sempre — alterações de
   tema/contraste nunca chegavam ao usuário.

   NOVA ESTRATÉGIA:
   - HTML, CSS e JS  -> NETWORK-FIRST (sempre busca a versão nova; cache
     serve apenas como fallback offline). Alterações passam a valer no
     primeiro carregamento.
   - Imagens, fontes, ícones -> CACHE-FIRST (raramente mudam, ganho de
     performance).
   ========================================================================== */

var CACHE = 'resoluta-v10';

var ASSETS = [
  './',
  './index.html',
  './app.html',
  './aprenda.html',
  './privacidade.html',
  './termos.html',
  './style.css?v=20261024a',
  './app.css?v=20261024a',
  './a11y.js?v=20261024a',
  './finance.js',
  './store.js',
  './supabase.js',
  './auth.js?v=20261022c',
  './script.js',
  './app.js',
  './aprenda.js',
  './pwa.js',
  './manifest.webmanifest',
  './assets/logo-resoluta.png',
  './assets/equipe-resoluta-senac.jpg?v=20261022',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon-32.png'
];

/* Assets que devem SEMPRE ser revalidados na rede */
function isCodeOrDocument(url, req) {
  if (req.mode === 'navigate') return true;
  return /\.(html|css|js|json|webmanifest)$/i.test(url.pathname);
}

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(
        ASSETS.map(function (a) {
          return c.add(a).catch(function () { /* ignora itens externos/ausentes */ });
        })
      );
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* Permite que a página peça ativação imediata da nova versão */
self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|vlibras\.gov\.br/.test(url.host)) return;

  /* ---------- NETWORK-FIRST: HTML, CSS, JS ---------- */
  if (isCodeOrDocument(url, req)) {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (r) {
            return r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined);
          });
        })
    );
    return;
  }

  /* ---------- CACHE-FIRST: imagens, fontes, ícones ---------- */
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req)
        .then(function (res) {
          if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () { return cached; });
    })
  );
});
