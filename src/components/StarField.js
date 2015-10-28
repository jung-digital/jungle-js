'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from '../lib/core/GraphicContainer';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import {ran} from '../lib/core/util/Number';
import GraphicEvents from '../lib/core/events/GraphicEvents';
import {PythagoreanCache} from '../lib/core/util/Trig';
import GraphicRendererEvents from '../lib/core/events/GraphicRendererEvents';
import Rect from '../lib/core/util/Rect';

/*============================================*\
 * Constants
\*============================================*/
const STAR_DENSITY = 2;         // Stars per 10000 pixels (100 x 100)

const STAR_MAX_SIZE = 5.0;       // Ideally star max size is an odd number
const STAR_MIN_SIZE = 1.2;

const STAR_MIN_SATURATION = 0.0;
const STAR_MAX_SATURATION = 0.25;

const STAR_MIN_HUE = 0;
const STAR_MAX_HUE = 360;

const STAR_MIN_VALUE = 0.5;
const STAR_MAX_VALUE = 1.0;

const STAR_VIEW_WIDTH = 1920;
const STAR_VIEW_HEIGHT = 1080;

const STAR_VIEW_SCROLL_RATIO = 0.0;

const STAR_TWINKLE_TIME_MIN = 0.6;
const STAR_TWINKLE_TIME_MAX = 1.2;

const STAR_TWINKLE_RATE = 0.01;
const STAR_TEMPLATE = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.1, 0.2, 0.1, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.1, 0.4, 0.5, 0.4, 0.1, 0.0, 0.0,
                        0.0, 0.0, 0.2, 0.5, 1.0, 0.5, 0.2, 0.0, 0.0,
                        0.0, 0.0, 0.1, 0.4, 0.5, 0.4, 0.1, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.1, 0.2, 0.1, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];

const STAR_TWINKLE_TEMPLATE = [0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0,
                                0.0, 0.0, 0.0, 0.1, 0.7, 0.1, 0.0, 0.0, 0.0,
                                0.0, 0.0, 0.5, 0.1, 0.8, 0.1, 0.5, 0.0, 0.0,
                                0.0, 0.1, 0.1, 0.7, 0.9, 0.7, 0.1, 0.1, 0.0,
                                0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6,
                                0.0, 0.1, 0.1, 0.7, 0.9, 0.7, 0.1, 0.1, 0.0,
                                0.0, 0.0, 0.5, 0.1, 0.8, 0.1, 0.5, 0.0, 0.0,
                                0.0, 0.0, 0.0, 0.1, 0.7, 0.1, 0.0, 0.0, 0.0,
                                0.0, 0.0, 0.0, 0.0, 0.6, 0.0, 0.0, 0.0, 0.0];

/*============================================*\
 * Class
\*============================================*/
/**
 * The StarField class displays uniformly random stars that twinkle occasionally.
 */
class StarField extends GraphicContainer {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * StarField is a digital effect to display stars on the screen in a way that
   * respects scrolling.
   *
   * @param {Object} options The options for this special effect.
   * @param {String} id
   */
  constructor(options, id) {
    super(options, id || 'starfield');

    var o = this.options;

    o.starDensity = o.starDensity || STAR_DENSITY;
    o.starMaxSize = o.starMaxSize || STAR_MAX_SIZE;
    o.starMinSize = o.starMinSize || STAR_MIN_SIZE;

    o.starMaxSaturation = o.starMaxSaturation || STAR_MAX_SATURATION;
    o.starMinSaturation = o.starMinSaturation || STAR_MIN_SATURATION;

    o.starMaxHue = o.starMaxHue || STAR_MAX_HUE;
    o.starMinHue = o.starMinHue || STAR_MIN_HUE;

    o.starMaxValue = o.starMaxValue || STAR_MAX_VALUE;
    o.starMinValue = o.starMinValue || STAR_MIN_VALUE;

    o.starViewWidth = o.starViewWidth || STAR_VIEW_WIDTH;
    o.starViewHeight = o.starViewHeight || STAR_VIEW_HEIGHT;

    o.starTwinkleTimeMin = o.starTwinkleTimeMin || STAR_TWINKLE_TIME_MIN;
    o.starTwinkleTimeMax = o.starTwinkleTimeMax || STAR_TWINKLE_TIME_MAX;

    o.starTwinkleRate = o.starTwinkleRate || STAR_TWINKLE_RATE;

    o.starViewScrollRatio = o.starViewScrollRatio || STAR_VIEW_SCROLL_RATIO;

    o.scrollRatio = o.scrollRatio || 1;

    o.fill = o.fill !== undefined ? o.fill : true;

    this.stars = [];

    this.buildStars();

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  buildStars() {
    let o = this.options;
    let relativeHeight = (o.starViewHeight * o.starViewScrollRatio) + 1200;
    let pixels = o.starViewWidth * relativeHeight;

    o.starCount = (pixels / 10000) * o.starDensity;
    this.allStars = [];

    console.log('Building ' + o.starCount + ' stars.');

    for (var i = 0; i < o.starCount; i++) {
      let star = {
        g: vec2.fromValues(Math.round(ran(0, o.starViewWidth)), Math.round(ran(0, relativeHeight))),
        d: ran(o.starMinSize, o.starMaxSize),
        c: hsvToRgb(ran(o.starMinHue, o.starMaxHue), ran(o.starMinSaturation, o.starMaxSaturation), ran(o.starMinValue, o.starMaxValue)),
        t: 0,
        p: 0
      };

      this.allStars.push(star);
    }
  }

  viewStars(left, top) {
    let o = this.options;
    let width = this.renderer.canvas.width;
    let height = this.renderer.canvas.height;

    left = Math.round(left);
    top = Math.round(top * o.starViewScrollRatio);

    this.stars = this.allStars.filter(s => {
      if (s.g[1] >= top && s.g[1] <= top + height &&
        s.g[0] >= left && s.g[0] <= left + width) {
        s.p = vec2.fromValues(s.g[0] - left, s.g[1] - top);
        return true;
      }
      return false;
    });
  }

  _rebuildImageDataCache() {
    console.log('rebuilding image data cache.');

    if (this.renderer && this.renderer.ctx) {
      let w = this.renderer.canvas.width;
      let h = this.renderer.canvas.height;

      this.cacheImDa = this.renderer.ctx.createImageData(w, h);
      var tmp = this.renderer.ctx.getImageData(0, 0, w, h);
      this.cacheImDa.data.set(tmp.data);

      this.imda = this.renderer.ctx.createImageData(w, h);
    }
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  addedHandler() {
    let o = this.options;

    if (o.fill) {
      o.fieldWidth = this.renderer.canvas.width;
      o.fieldHeight = this.renderer.canvas.height;
    }

    let wh = Math.ceil(o.starMaxSize);

    this.wh = wh;

    this.renderer.addListener(GraphicRendererEvents.CANVAS_RESIZE, this.canvasResizedHandler.bind(this));

    if (o.starViewScrollRatio) {
      this.renderer.addListener(GraphicRendererEvents.WINDOW_SCROLL, this.windowScrollHandler.bind(this));
    }

    this.viewStars(0, window.scrollY);
  }

  canvasResizedHandler(event) {
    let w = this.renderer.canvas.width;
    let h = this.renderer.canvas.height;
    let o = this.options;

    if (o.fill) {
      o.fieldWidth = w;
      o.fieldHeight = h;
    }

    this._rebuildImageDataCache();

    this.viewStars(0, window.scrollY);
  }

  /**
   * Render every single star that is within the viewport.
   *
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    let ctx = this.renderer.ctx;
    let w = this.renderer.canvas.width;
    let h = this.renderer.canvas.height;
    let o = this.options;

    if (!this.cacheImDa) {
      this._rebuildImageDataCache();
    }

    this.imda.data.set(this.cacheImDa.data);

    let d = this.imda.data;
    let x = 0;
    let y = 0;
    let i = 0;
    let cxy = Math.floor(this.wh / 2);
    let ix = 0;
    let wh = this.wh;
    let templateSize = STAR_TWINKLE_TEMPLATE.length;
    let tempWidth = Math.round(Math.sqrt(templateSize));

    var starDraw = function(star) {
      let red = star.c.r * 255;
      let green = star.c.g * 255;
      let blue = star.c.b * 255;

      if (star.t || Math.random() < (o.starTwinkleRate * elapsed)) {
        star.totTime = star.totTime || ran(o.starTwinkleTimeMin, o.starTwinkleTimeMax);
        star.t = star.t + elapsed || elapsed;

        let intensity = Math.sin((star.t / star.totTime) * Math.PI);
        let sd2 = star.d / 2;
        let sp1 = star.p[1];
        let sp0 = star.p[0];
        let base = undefined;
        let a = undefined;
        let ia = undefined;

        for (i = 0; i < templateSize; i++) {
          if (STAR_TEMPLATE[i] === 0 && STAR_TWINKLE_TEMPLATE[i] === 0) {
            continue;
          }
          y = Math.floor(i / tempWidth);
          x = i % tempWidth;

          base = (STAR_TEMPLATE[i] / sd2) * (1 - intensity);
          a = ((STAR_TWINKLE_TEMPLATE[i] * intensity) + base);
          ia = 1 - a;

          ix = Math.round((((y + sp1) * w) + (x + sp0)) * 4);

          d[ix] = (red);
          d[ix + 1] = (green);
          d[ix + 2] = (blue);
          d[ix + 3] = Math.max(d[ix + 3], a * 255);
        }

        if (star.t > star.totTime) {
          star.t = 0;
          star.totTime = undefined;
        }
      } else {
        // Draw each pixel of the star.
        for (i = 0; i < templateSize; i++) {
          y = Math.floor(i / tempWidth);
          x = i % tempWidth;
          // Calculate the alpha value based on the distance of the pixel from
          // the center of the star.

          let a = (STAR_TEMPLATE[i] / (star.d / 2));
          let ia = 1 - a;

          ix = Math.round((((y + star.p[1]) * w) + (x + star.p[0])) * 4);

          d[ix + 0] = (red);
          d[ix + 1] = (green);
          d[ix + 2] = (blue);
          d[ix + 3] = Math.max(d[ix + 3], a * 255);
        }
      }
    };
    this.stars.forEach(starDraw);

    // Render stars to canvas
    ctx.putImageData(this.imda, 0.5, 0.5);
  }

  /**
   * @param {Number} event The event containing information on the scroll position.
   */
  windowScrollHandler(event) {
    let o = this.options;
    this.viewStars(0, window.scrollY);
  }
}

export default StarField;
