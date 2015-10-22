console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  canvasAutoClear: '#000000'
});

window.starField = new StarField();
renderer.addChild(starField);
