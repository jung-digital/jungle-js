console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Lib.GraphicRenderer(canvas, {
  debug: true,
  fillRenderer: false
});

window.playbar = new Playbar({
  total: 100,
  current: 0,
  boundsPercent: new Lib.util.Rect(0.1, 0.1, 0.8, 0.8)
}, 'playbar');

renderer.addChild(playbar);
