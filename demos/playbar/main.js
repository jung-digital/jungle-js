"use strict";

console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Lib.GraphicRenderer(canvas, {
  debug: true,
  fillRenderer: false
});

window.playbar = new Playbar({
  total: 100,
  current: 0,
  boundsPercent: new Lib.util.Rect(0.1, 0.1, 0.8, NaN),
  bounds: new Lib.util.Rect(0, 0, 0, 20),
  chapters: [25,50,75]
}, 'playbar');

renderer.addChild(playbar);

setInterval(function () {
  playbar.current = playbar.current > 100 ? 1 : playbar.current + 0.1;
}, 50);
