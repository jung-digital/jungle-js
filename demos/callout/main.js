'use strict';

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true
});

window.calloutBottom = new   Callout({
  bounds: new Jungle.util.Rect(10, 10, 100, 100)
}, 'callout');

window.calloutBottom2 = new Callout({
  bounds: new Jungle.util.Rect(200, 10, 300, 100)
}, 'callout');

window.calloutBottom3 = new Callout({
  bounds: new Jungle.util.Rect(10, 100, 300, 100)
}, 'callout');

renderer.addChild(calloutBottom);
renderer.addChild(calloutBottom2);
renderer.addChild(calloutBottom3);

renderer.addListener(Jungle.events.MouseEvents.MOUSE_MOVE, function (event) {
  calloutBottom3.target = calloutBottom2.target = calloutBottom.target = vec2.fromValues(event.properties.canvasX, event.properties.canvasY);
});
