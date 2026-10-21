/* ==========================================================================
   Resoluta Finance — Gráficos em Canvas (sem dependências externas)
   Barra, linha e rosca (donut), responsivos e acessíveis (com tabela de dados).
   ========================================================================== */
(function (global) {
  'use strict';

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function palette() {
    return {
      gold: cssVar('--gold', '#d4af37'),
      goldStrong: cssVar('--gold-strong', '#c29f31'),
      burgundy: cssVar('--burgundy', '#581124'),
      text: cssVar('--text', '#2c2224'),
      soft: cssVar('--text-soft', '#6b5b5e'),
      border: cssVar('--border', '#e6dcde'),
      success: cssVar('--success', '#1f7a4d'),
      danger: cssVar('--danger', '#b3261e'),
      surface: cssVar('--surface', '#fff')
    };
  }
  var SERIES_COLORS = ['#d4af37', '#581124', '#1f7a4d', '#2b5d8a', '#b06a00', '#7a2237', '#8a6d3b', '#3f9d5a'];

  function setupCanvas(canvas, height) {
    var dpr = global.devicePixelRatio || 1;
    var w = canvas.clientWidth || canvas.parentNode.clientWidth || 600;
    var h = height || 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function niceMax(v) {
    if (v <= 0) return 10;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / pow;
    var m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return m * pow;
  }

  function fmtShort(v) {
    var a = Math.abs(v);
    if (a >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (a >= 1000) return (v / 1000).toFixed(a >= 10000 ? 0 : 1) + 'k';
    return String(Math.round(v));
  }

  /* ---------- Gráfico de barras (agrupado) ---------- */
  function barChart(canvas, labels, series, opts) {
    opts = opts || {};
    var P = palette();
    var s = setupCanvas(canvas, opts.height || 280);
    var ctx = s.ctx, w = s.w, h = s.h;
    var padL = 52, padR = 16, padT = 18, padB = 40;
    var plotW = w - padL - padR, plotH = h - padT - padB;

    var max = 0;
    series.forEach(function (se) { se.data.forEach(function (v) { max = Math.max(max, v); }); });
    max = niceMax(max * 1.1) || 10;

    // grade
    ctx.strokeStyle = P.border; ctx.fillStyle = P.soft; ctx.font = '11px Plus Jakarta Sans, sans-serif';
    ctx.lineWidth = 1;
    var steps = 4;
    for (var i = 0; i <= steps; i++) {
      var y = padT + plotH - (plotH * i / steps);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(fmtShort(max * i / steps), padL - 8, y);
    }

    var groupW = plotW / labels.length;
    var barW = Math.min(38, (groupW * 0.7) / series.length);
    labels.forEach(function (lab, li) {
      var gx = padL + groupW * li + groupW / 2;
      var totalW = barW * series.length + 4 * (series.length - 1);
      var startX = gx - totalW / 2;
      series.forEach(function (se, si) {
        var v = se.data[li] || 0;
        var bh = Math.max(0, (v / max) * plotH);
        var x = startX + si * (barW + 4);
        var y = padT + plotH - bh;
        var grad = ctx.createLinearGradient(0, y, 0, padT + plotH);
        grad.addColorStop(0, se.color || SERIES_COLORS[si % SERIES_COLORS.length]);
        grad.addColorStop(1, hexA(se.color || SERIES_COLORS[si % SERIES_COLORS.length], 0.55));
        ctx.fillStyle = grad;
        roundRect(ctx, x, y, barW, bh, 4); ctx.fill();
      });
      ctx.fillStyle = P.soft; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(lab, gx, padT + plotH + 10);
    });
  }

  /* ---------- Gráfico de linha ---------- */
  function lineChart(canvas, labels, series, opts) {
    opts = opts || {};
    var P = palette();
    var s = setupCanvas(canvas, opts.height || 280);
    var ctx = s.ctx, w = s.w, h = s.h;
    var padL = 52, padR = 16, padT = 18, padB = 40;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var max = 0, min = 0;
    series.forEach(function (se) { se.data.forEach(function (v) { max = Math.max(max, v); min = Math.min(min, v); }); });
    if (max === min) max = min + 10;
    max = niceMax(max * 1.1);
    if (min < 0) min = -niceMax(Math.abs(min) * 1.1);
    var range = max - min;

    ctx.strokeStyle = P.border; ctx.fillStyle = P.soft; ctx.font = '11px Plus Jakarta Sans, sans-serif'; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var y = padT + plotH - (plotH * i / 4);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(fmtShort(min + range * i / 4), padL - 8, y);
    }

    var stepX = labels.length > 1 ? plotW / (labels.length - 1) : plotW;
    labels.forEach(function (lab, li) {
      ctx.fillStyle = P.soft; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(lab, padL + stepX * li, padT + plotH + 10);
    });

    series.forEach(function (se, si) {
      var color = se.color || SERIES_COLORS[si % SERIES_COLORS.length];
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath();
      se.data.forEach(function (v, li) {
        var x = padL + stepX * li;
        var y = padT + plotH - ((v - min) / range) * plotH;
        if (li === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      se.data.forEach(function (v, li) {
        var x = padL + stepX * li;
        var y = padT + plotH - ((v - min) / range) * plotH;
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.surface; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      });
    });
  }

  /* ---------- Rosca (donut) ---------- */
  function donutChart(canvas, items, opts) {
    opts = opts || {};
    var P = palette();
    var s = setupCanvas(canvas, opts.height || 260);
    var ctx = s.ctx, w = s.w, h = s.h;
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 14, inner = r * 0.62;
    var total = items.reduce(function (a, it) { return a + Math.abs(it.value); }, 0);
    if (total <= 0) {
      ctx.fillStyle = P.soft; ctx.font = '13px Plus Jakarta Sans, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Sem dados para exibir', cx, cy); return;
    }
    var start = -Math.PI / 2;
    items.forEach(function (it, i) {
      var ang = (Math.abs(it.value) / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + ang);
      ctx.closePath();
      ctx.fillStyle = it.color || SERIES_COLORS[i % SERIES_COLORS.length];
      ctx.fill();
      start += ang;
    });
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = P.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 16px Plus Jakarta Sans, sans-serif';
    ctx.fillText(opts.centerLabel || '', cx, cy - 8);
    ctx.font = '11px Plus Jakarta Sans, sans-serif'; ctx.fillStyle = P.soft;
    ctx.fillText(opts.centerSub || '', cx, cy + 12);
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (h < r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function hexA(hex, a) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(hex, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  global.Charts = { bar: barChart, line: lineChart, donut: donutChart, colors: SERIES_COLORS, palette: palette };
})(typeof window !== 'undefined' ? window : this);
