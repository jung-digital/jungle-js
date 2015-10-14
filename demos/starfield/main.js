console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  canvasAutoClear: 'rgba(0,0,0,1)'
});
window.starField = new StarField();
renderer.addChild(starField);
