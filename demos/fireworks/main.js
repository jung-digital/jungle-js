console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true
});

window.starField = new StarField({
  starDensity: 10
}, 'starfield');

renderer.addChild(starField);

window.fireworks = new Fireworks({
}, 'fireworks');
