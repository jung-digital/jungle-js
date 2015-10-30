console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  canvasAutoClear: true,
  resizeToCanvas: true
});

window.starField = new StarField({
  starDensity: 2,
  starTwinkleRate: 0.01
});
renderer.addChild(starField);
