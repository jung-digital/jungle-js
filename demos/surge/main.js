console.log('its working');

var canvas = $('#canvas')[0];

window.fireworks = new Fireworks(canvas, {
  debug: true,
  aspectRatio: 1.61
}, 'fireworks');