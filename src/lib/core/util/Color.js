'use strict';

export function hsvToRgb(h, s, v) {
  var i;
  var f;
  var p;
  var q;
  var t;
  var r;
  var g;
  var b;
  if (s == 0) {
    // achromatic (grey)
    r = g = b = v;
  } else {
    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));
    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      default:
        r = v;
        g = p;
        b = q;
        break;
    }
  }

  return {
    r: r,
    g: g,
    b: b
  };
}

export default {
  hsvToRgb: hsvToRgb
};
