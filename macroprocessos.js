(function () {
  'use strict';
  var video = document.getElementById('resoluta-macroprocessos-video');
  if (!video) return;
  var root = document.documentElement;
  var figure = document.getElementById('resoluta-macroprocessos');
  var points = Array.prototype.map.call(figure.querySelectorAll('[data-entrega-x]'), function (element) {
    var x = Number(element.getAttribute('data-entrega-x'));
    element.style.left = (x / 960 * 100) + '%';
    return { element: element, x: x };
  });
  // The video has four evenly spaced robots on a 720px straight and 38.5px turns.
  var trackLength = 1440 + 77 * Math.PI;
  var frame = null;

  function reducedMotion() {
    return root.getAttribute('data-reduce-motion') === 'true';
  }

  function hidePoints() {
    points.forEach(function (point) { point.element.style.opacity = '0'; });
  }

  function drawPoints() {
    if (video.paused || video.ended || video.seeking || reducedMotion() || video.readyState < 2) {
      hidePoints();
      return;
    }
    var duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 12;
    var interval = duration / 4;
    var lifetime = Math.min(1.15, interval * .45);
    var scale = video.clientWidth / 960;

    points.forEach(function (point) {
      var arrival = ((point.x - 120) / trackLength * duration) % interval;
      var age = ((video.currentTime - arrival) % interval + interval) % interval;
      if (age >= lifetime) {
        point.element.style.opacity = '0';
        return;
      }
      var progress = age / lifetime;
      var opacity = Math.min(1, age / .12, (lifetime - age) / .3);
      var lift = 20 * scale * progress;
      var size = .85 + .15 * Math.min(1, age / .16);
      point.element.style.opacity = String(opacity);
      point.element.style.transform = 'translate(-50%, calc(-50% - ' + lift + 'px)) scale(' + size + ')';
    });
  }

  function tick() {
    frame = null;
    drawPoints();
    if (!video.paused && !video.ended && !reducedMotion()) {
      frame = requestAnimationFrame(tick);
    }
  }

  function startPoints() {
    if (frame === null) tick();
  }

  function stopPoints() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    hidePoints();
  }

  function syncMotion() {
    if (reducedMotion()) {
      video.pause();
      stopPoints();
    } else {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
      startPoints();
    }
  }

  video.muted = true;
  video.addEventListener('playing', startPoints);
  video.addEventListener('pause', stopPoints);
  video.addEventListener('ended', stopPoints);
  video.addEventListener('timeupdate', function () {
    drawPoints();
    if (!video.paused && !reducedMotion()) startPoints();
  });
  video.addEventListener('seeking', hidePoints);
  video.addEventListener('seeked', function () {
    drawPoints();
    if (!video.paused) startPoints();
  });
  new MutationObserver(syncMotion).observe(root, {
    attributes: true,
    attributeFilter: ['data-reduce-motion']
  });
  syncMotion();
}());
