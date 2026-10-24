/* ==========================================================================
   Resoluta Finance — Acessibilidade
   Temas (claro/escuro/alto contraste), tamanho de fonte, redução de movimento
   e leitura em voz alta (Text-to-Speech) com play/pause/stop.
   ========================================================================== */
(function (global) {
  'use strict';
  var KEY = 'resoluta.a11y.v1';

  /* Escala global de fonte: A- = 90% | A = 100% | A+ = 120% */
  var FONT_STEPS = [0.9, 1, 1.2];

  var prefs = { theme: 'light', fontScale: 1, reduceMotion: false };

  function snapFont(v) {
    var n = Number(v);
    if (!isFinite(n) || n <= 0) return 1;
    var best = FONT_STEPS[0], diff = Infinity;
    FONT_STEPS.forEach(function (s) {
      var d = Math.abs(s - n);
      if (d < diff) { diff = d; best = s; }
    });
    return best;
  }

  function load() {
    try { Object.assign(prefs, JSON.parse(global.localStorage.getItem(KEY) || '{}')); } catch (e) {}
    var prefersDark = global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches;
    var prefersReduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!global.localStorage.getItem(KEY) && prefersDark) prefs.theme = 'dark';
    if (prefersReduce) prefs.reduceMotion = true;
  }
  function persist() { try { global.localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }

  function apply() {
    var root = document.documentElement;
    prefs.fontScale = snapFont(prefs.fontScale);
    root.setAttribute('data-theme', prefs.theme);
    root.style.setProperty('--font-scale', String(prefs.fontScale));
    root.setAttribute('data-font-scale', String(Math.round(prefs.fontScale * 100)));
    root.setAttribute('data-reduce-motion', prefs.reduceMotion ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', prefs.theme === 'light' ? '#3a0b17' : (prefs.theme === 'contrast' ? '#000000' : '#16100f'));
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-theme-btn') === prefs.theme);
    });
    document.querySelectorAll('[data-font]').forEach(function (b) {
      var key = b.getAttribute('data-font');
      var target = key === 'up' ? 1.2 : (key === 'down' ? 0.9 : 1);
      var on = Math.abs(prefs.fontScale - target) < 0.001;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setTheme(t) { prefs.theme = t; persist(); apply(); }
  function setFontScale(s) { prefs.fontScale = snapFont(s); persist(); apply(); }
  function bumpFont(dir) {
    if (dir === 'up') setFontScale(1.2);
    else if (dir === 'down') setFontScale(0.9);
    else setFontScale(1);
  }
  function setReduceMotion(v) { prefs.reduceMotion = !!v; persist(); apply(); }

  /* ---------- Text-to-Speech ---------- */
  var tts = {
    supported: 'speechSynthesis' in global,
    enabled: false,
    utterance: null,
    chunks: [],
    index: 0,
    speaking: false,
    paused: false
  };

  function collectText() {
    var main = document.querySelector('main') || document.body;
    var clone = main.cloneNode(true);
    clone.querySelectorAll('script, style, noscript, [aria-hidden="true"], .no-tts, [vw], .a11y-bar, .cookie-banner').forEach(function (n) { n.remove(); });
    var text = (clone.innerText || clone.textContent || '').replace(/\s+/g, ' ').trim();
    // divide em blocos de ~220 caracteres respeitando fim de frase
    var parts = text.match(/[^.!?]+[.!?]*/g) || [text];
    var chunks = [], cur = '';
    parts.forEach(function (p) {
      if ((cur + p).length > 220) { if (cur.trim()) chunks.push(cur.trim()); cur = p; }
      else cur += p;
    });
    if (cur.trim()) chunks.push(cur.trim());
    return chunks;
  }

  function speakFrom(i) {
    if (!tts.supported) return;
    global.speechSynthesis.cancel();
    tts.index = i;
    if (tts.index >= tts.chunks.length) { tts.speaking = false; updateControls(); return; }
    var u = new SpeechSynthesisUtterance(tts.chunks[tts.index]);
    u.lang = 'pt-BR';
    u.rate = 1; u.pitch = 1;
    u.onend = function () {
      if (!tts.speaking) return;
      tts.index++;
      if (tts.index < tts.chunks.length) speakFrom(tts.index);
      else { tts.speaking = false; updateControls(); }
    };
    tts.utterance = u;
    tts.speaking = true;
    tts.paused = false;
    global.speechSynthesis.speak(u);
    updateControls();
  }

  function ttsPlay() {
    if (!tts.supported) { alert('Seu navegador não oferece suporte à leitura em voz alta.'); return; }
    if (tts.paused) { global.speechSynthesis.resume(); tts.paused = false; updateControls(); return; }
    tts.chunks = collectText();
    speakFrom(0);
  }
  function ttsPause() {
    if (!tts.supported) return;
    if (global.speechSynthesis.speaking && !global.speechSynthesis.paused) {
      global.speechSynthesis.pause(); tts.paused = true; updateControls();
    }
  }
  function ttsStop() {
    if (!tts.supported) return;
    tts.speaking = false; tts.paused = false;
    global.speechSynthesis.cancel();
    updateControls();
  }
  function ttsToggle(on) {
    tts.enabled = !!on;
    var controls = document.getElementById('ttsControls');
    if (controls) controls.hidden = !on;
    if (!on) ttsStop();
    else ttsPlay();
  }
  function updateControls() {
    var play = document.getElementById('ttsPlay');
    var pause = document.getElementById('ttsPause');
    if (play) play.classList.toggle('active', tts.speaking && !tts.paused);
    if (pause) pause.classList.toggle('active', tts.paused);
  }

  /* ---------- Inicialização ---------- */
  function init() {
    load();
    apply();

    var toggle = document.getElementById('a11yToggle');
    var panel = document.getElementById('a11yPanel');

    /* Estado inicial: painel SEMPRE fechado. Só o botão flutuante aparece. */
    if (panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'false');

    function openPanel() {
      if (!panel) return;
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector('.a11y-close, button');
      if (first) first.focus({ preventScroll: true });
    }
    function closePanel(restoreFocus) {
      if (!panel) return;
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    }

    /* Botão de fechar injetado (mantém o HTML das 5 páginas idêntico) */
    if (panel && !panel.querySelector('.a11y-close')) {
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'a11y-close';
      closeBtn.setAttribute('aria-label', 'Fechar opções de acessibilidade');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      closeBtn.addEventListener('click', function () { closePanel(true); });
      panel.appendChild(closeBtn);
    }

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        if (panel.classList.contains('open')) closePanel(false);
        else openPanel();
      });
      document.addEventListener('click', function (e) {
        if (!panel.contains(e.target) && !toggle.contains(e.target) && panel.classList.contains('open')) {
          closePanel(false);
        }
      });
    }
    document.querySelectorAll('[data-a11y-open]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });
    });
    document.querySelectorAll('[data-theme-btn]').forEach(function (b) {
      b.addEventListener('click', function () { setTheme(b.getAttribute('data-theme-btn')); });
    });
    document.querySelectorAll('[data-font]').forEach(function (b) {
      b.addEventListener('click', function () { bumpFont(b.getAttribute('data-font')); });
    });
    var ttsToggleEl = document.getElementById('ttsToggle');
    if (ttsToggleEl) {
      if (!tts.supported) { ttsToggleEl.disabled = true; }
      ttsToggleEl.addEventListener('change', function () { ttsToggle(ttsToggleEl.checked); });
    }
    var play = document.getElementById('ttsPlay'), pause = document.getElementById('ttsPause'), stop = document.getElementById('ttsStop');
    if (play) play.addEventListener('click', ttsPlay);
    if (pause) pause.addEventListener('click', ttsPause);
    if (stop) stop.addEventListener('click', ttsStop);

    var motion = document.getElementById('motionToggle');
    if (motion) {
      motion.checked = prefs.reduceMotion;
      motion.addEventListener('change', function () { setReduceMotion(motion.checked); });
    }
    // Atalho de teclado: Alt+A abre acessibilidade
    document.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (panel && panel.classList.contains('open')) closePanel(true);
        else openPanel();
      }
      if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
        closePanel(true);
      }
    });
  }

  global.ResolutaA11y = {
    init: init, apply: apply, setTheme: setTheme, setFontScale: setFontScale,
    ttsPlay: ttsPlay, ttsPause: ttsPause, ttsStop: ttsStop, prefs: prefs
  };
})(typeof window !== 'undefined' ? window : this);
