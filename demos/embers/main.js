console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  canvasAutoClear: true,
  resizeToCanvas: true
});

window.embers = new Embers({
  sparkCount: 90,
  maxSparkSize: 2.5,
  minSparkSize: 1.0,
  maxSparkVelocity: 120,
  minSparkVelocity: 50,
  maxSparkLife: 25,
  maxTailLength: 18,
  sparkSource: {
    target: document.getElementById('canvasWrapperSky'),
    widthProp: 'clientWidth',
    heightProp: 'clientHeight',
    offset: {
      x: '50%',
      y: '45%'
    }
  },
});
renderer.addChild(embers);
