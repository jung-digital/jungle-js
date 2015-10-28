"use strict";

console.log('its working');

var canvas = $('#canvas')[0];

window.renderer = new Jungle.GraphicRenderer(canvas, {
  debug: true,
  fillRenderer: false,
  adjustSizeToCSS: true
});

window.playbar = new Playbar({
  total: 100,
  current: 0,
  boundsPercent: new Jungle.util.Rect(0.0, 0.4, 1.0, NaN),
  bounds: new Jungle.util.Rect(0, 0, 0, 20),
  chapters: [{
    position: 2,
    text: '2nd percentile.'
  },{
    position: 25,
    text: '25th percentile.'
  },{
    position: 50,
    text: '50th percentile. Super long text!'
  },{
    position: 75,
    text: '75th percentile.'
  },{
    position: 98,
    text: '98th percentile.'
  }],
  shadow: {

  }
}, 'playbar');

console.log('adding playbar');
renderer.addChild(playbar);

setInterval(function () {
  playbar.current = playbar.current > 100 ? 1 : playbar.current + 0.1;
}, 50);
