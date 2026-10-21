/* ==========================================================================
   Resoluta Finance — PWA (Progressive Web App)
   Registro do Service Worker e prompt de instalação.
   ========================================================================== */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('Service Worker não registrado:', err);
      });
    });
  }

  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  function showInstallButton() {
    if (document.getElementById('pwaInstallBtn')) return;
    var btn = document.createElement('button');
    btn.id = 'pwaInstallBtn';
    btn.className = 'btn btn-primary btn-sm';
    btn.type = 'button';
    btn.innerHTML = '<i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i> Instalar app';
    btn.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:1400;box-shadow:0 10px 30px rgba(0,0,0,.25);';
    btn.addEventListener('click', async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      var choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') btn.remove();
      deferredPrompt = null;
    });
    document.body.appendChild(btn);
  }

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('pwaInstallBtn');
    if (b) b.remove();
  });
})();
