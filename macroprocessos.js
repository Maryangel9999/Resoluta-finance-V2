(function () {
  'use strict';
  var video = document.getElementById('resoluta-macroprocessos-video');
  if (!video) return;
  var root = document.documentElement;

  function syncMotion() {
    if (root.getAttribute('data-reduce-motion') === 'true') {
      video.pause();
    } else {
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
    }
  }

  video.muted = true;
  new MutationObserver(syncMotion).observe(root, {
    attributes: true,
    attributeFilter: ['data-reduce-motion']
  });
  syncMotion();
}());
