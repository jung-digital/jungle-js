'use strict';

/**
 * Takes in Hue, Saturation, and Value and converts to a Red, Green, Blue object.
 *
 * @param {Number} h Hue from 0 to 360
 * @param {Number} s Saturation from 0 to 1
 * @param {Number} v Value from 0 to 1
 * @returns {{r: Number, g: Number, b: Number}}
 */
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

/**
 * Converts an Object with r, g, and b properties to a 32-bit float.
 *
 * @param {{r: Number, g: Number, b: Number}} rgb A Object with r, g, and b properties.
 * @returns {Number}
 */
export function rgbToFloat32(rgb) {
  return rgb.r + rgb.g * 256 + rgb.b * 65536;
}

export function colorToHex(v) {
  var s = v.toString(16);
  switch (s.length) {
    case 6: return '#' + s;
    case 5: return '#0' + s;
    case 4: return '#00' + s;
    case 3: return '#000' + s;
    case 2: return '#0000' + s;
    case 1: return '#00000' + s;
  }
  return '#000000';
}

export function red(f) {
  return (f & 0xFF0000) >> 16;
}

export function green(f) {
  return (f & 0x000FF00) >> 8;
}

export function blue(f) {
  return f & 0x00000FF;
}

export default {
  hsvToRgb: hsvToRgb,
  rgbToFloat32: rgbToFloat32,
  red: red,
  green: green,
  blue: blue
};
