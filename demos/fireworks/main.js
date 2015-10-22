console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  mouseEnabled: true
});

window.starField = new StarField({
  starDensity: 2
}, 'starfield');

//renderer.addChild(starField);

window.fireworks = new Fireworks({
}, 'fireworks');

renderer.addChild(fireworks);
