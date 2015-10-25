"use strict";

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  fillRenderer: false,
  adjustSizeToCSS: true
});

window.callout = new Callout({
  bounds: new Jungle.util.Rect(10, 10, 100, 100)
}, 'callout');

renderer.addChild(callout);
