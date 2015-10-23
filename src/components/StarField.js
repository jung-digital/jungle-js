'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from '../lib/core/GraphicContainer';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import {ran} from '../lib/core/util/Number';
import GraphicEvents from '../lib/core/GraphicEvents';
import {PythagoreanCache} from '../lib/core/util/Trig';
import GraphicRendererEvents from '../lib/core/GraphicRendererEvents';
import Rect from '../lib/core/util/Rect';

/*============================================*\
 * Constants
\*============================================*/
const STAR_DENSITY = 2;         // Stars per 10000 pixels (100 x 100)

const STAR_MAX_SIZE = 5.0;       // Ideally star max size is an odd number
const STAR_MIN_SIZE = 1.2;

const STAR_MAX_INTENSITY = 5.0;       
const STAR_MIN_INTENSITY = 1.2;

const STAR_MIN_SATURATION = 0.0;
const STAR_MAX_SATURATION = 0.25;

const STAR_MIN_HUE = 0;
const STAR_MAX_HUE = 360;

const STAR_MIN_VALUE = 0.5;
const STAR_MAX_VALUE = 1.0;

const STAR_VIEW_WIDTH = 1920;
const STAR_VIEW_HEIGHT = 1080;

const STAR_VIEW_SCROLL_RATIO = 1.0;

const STAR_TWINKLE_TIME = 1.0;
const STAR_TWINKLE_RATE = 0.01;
const STAR_TEMPLATE_255 = new Uint8ClampedArray([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x18, 0x4a, 0x66, 0x4a, 0x18, 0x00, 0x00,
                                                0x00, 0x18, 0x4a, 0x80, 0x99, 0x80, 0x4a, 0x18, 0x00,
                                                0x00, 0x18, 0x66, 0x99, 0xff, 0x99, 0x66, 0x18, 0x00,
                                                0x00, 0x18, 0x4a, 0x80, 0x99, 0x80, 0x4a, 0x18, 0x00,
                                                0x00, 0x00, 0x18, 0x4a, 0x66, 0x4a, 0x18, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x18, 0x18, 0x18, 0x00, 0x00, 0x00,
                                                0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
const STAR_TEMPLATE = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                      0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0,
                      0.0, 0.0, 0.1, 0.3, 0.4, 0.3, 0.1, 0.0, 0.0,
                      0.0, 0.1, 0.3, 0.5, 0.6, 0.5, 0.3, 0.1, 0.0,
                      0.0, 0.1, 0.4, 0.6, 1.0, 0.6, 0.4, 0.1, 0.0,
                      0.0, 0.1, 0.3, 0.5, 0.6, 0.5, 0.3, 0.1, 0.0,
                      0.0, 0.0, 0.1, 0.3, 0.4, 0.3, 0.1, 0.0, 0.0,
                      0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0,
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

    o.starTwinkleTime = o.starTwinkleTime || STAR_TWINKLE_TIME;
    o.starTwinkleRate = o.starTwinkleRate || STAR_TWINKLE_RATE;

    o.starViewScrollRatio = o.starViewScrollRatio || STAR_VIEW_SCROLL_RATIO;

    o.scrollRatio = o.scrollRatio || 1;

    o.fill = o.fill !== undefined ? o.fill : true;

    this.stars = [];

    this.pc = new PythagoreanCache(o.starMaxSize);

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

    // Star is Array: [X, Y, Diameter, 32-bit color]
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
      return s.g[0] >= left && s.g[0] <= left + width &&
        s.g[1] >= top && s.g[1] <= top + height;
    });

    this.stars.forEach(s => {
      s.p = vec2.fromValues(s.g[0] - left, s.g[1] - top);
    });

    console.log('Viewing ' + this.stars.length + '/' + this.allStars.length, left, top, width, height);
  }

  _rebuildImageDataCache() {
    console.log('rebuilding image data cache.');
    let w = this.renderer.canvas.width;
    let h = this.renderer.canvas.height;

    this.cacheImDa = this.renderer.ctx.createImageData(w, h);
    var tmp = this.renderer.ctx.getImageData(0, 0, w, h);
    this.cacheImDa.data.set(tmp.data);

    this.imda = this.renderer.ctx.createImageData(w, h);
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
    this.renderer.addListener(GraphicRendererEvents.WINDOW_SCROLL, this.windowScrollHandler.bind(this));

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
    let d32 = new Uint32Array(this.imda.data.buffer);
    //let d = this.imda.data;
    let x = 0;
    let y = 0;
    let i = 0;
    let cxy = Math.floor(this.wh / 2);
    let ix = 0;
    let wh = this.wh;
    let templateSize = STAR_TWINKLE_TEMPLATE.length;
    let tempWidth = Math.round(Math.sqrt(templateSize));

    let crap = [];
    var starDraw = function(star) {
      if (star.p[0] >= 0 && star.p[0] <= w &&
          star.p[1] >= 0 && star.p[1] <= h) {
        let red = star.c.r * 255;
        let green = star.c.g * 255;
        let blue = star.c.b * 255;

        // if (star.t || Math.random() < (o.starTwinkleRate * elapsed)) {
        //   star.t = star.t || 0.00001;
        //   star.t += elapsed;
        //   let intensity = Math.sin((star.t / o.starTwinkleTime) * Math.PI);
        //   for (i = 0; i < templateSize; i++) {
        //     y = Math.floor(i / tempWidth);
        //     x = i % tempWidth;

        //     let base = (STAR_TEMPLATE[i] / (star.d / 2)) * (1 - intensity);
        //     let a = ((STAR_TWINKLE_TEMPLATE[i] * intensity) + base);
        //     let ia = 1 - a;

        //     ix = Math.round((((y + star.p[1]) * w) + (x + star.p[0])) * 4);

        //     d[ix + 0] = (red);
        //     d[ix + 1] = (green);
        //     d[ix + 2] = (blue);
        //     d[ix + 3] = Math.max(d[ix + 3], a * 255);
        //   }
        //   if (star.t > o.starTwinkleTime) {
        //     star.t = 0;
        //   }
        // } else {
        // Draw each pixel of the star.
        let pos = 0;
        let posY = star.p[1];
        let posX = star.p[0];
        let M = Math.max;
        let ST = STAR_TEMPLATE_255;
        let sD = (star.d / 2);
        let bgr = (blue << 16) | (green << 8) | red;

        pos = (0 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[0] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[1] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[2] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[3] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[4] / sD) << 24) | bgr;
        d32[(pos + 5)] = ((ST[5] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[6] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[7] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[8] / sD) << 24) | bgr;

        pos = (1 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[9] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[10] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[11] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[12] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[13] / sD) << 24) | bgr;
        d32[(pos + 5)] = ((ST[14] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[15] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[16] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[17] / sD) << 24) | bgr;

        pos = (2 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[18] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[19] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[20] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[21] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[22] / sD) << 24) | bgr;
        d32[(pos + 5)] = ((ST[23] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[24] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[25] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[26] / sD) << 24) | bgr;

        pos = (3 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[27] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[28] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[29] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[30] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[31] / sD) << 24) | bgr;
        d32[(pos + 5)] = ((ST[32] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[33] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[34] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[35] / sD) << 24) | bgr;

        pos = (4 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[36] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[37] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[38] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[39] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[40] / sD) << 24) | bgr;
        // if (((ST[40] / sD) << 24) | bgr < 0) {
        //   console.log((ST[40] / sD) << 24);
        // }
        d32[(pos + 5)] = ((ST[41] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[42] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[43] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[44] / sD) << 24) | bgr;

        pos = (5 + posY) * w + posX;
        d32[(pos + 0)] = ((ST[45] / sD) << 24) | bgr;
        d32[(pos + 1)] = ((ST[46] / sD) << 24) | bgr;
        d32[(pos + 2)] = ((ST[47] / sD) << 24) | bgr;
        d32[(pos + 3)] = ((ST[48] / sD) << 24) | bgr;
        d32[(pos + 4)] = ((ST[49] / sD) << 24) | bgr;
        d32[(pos + 5)] = ((ST[50] / sD) << 24) | bgr;
        d32[(pos + 6)] = ((ST[51] / sD) << 24) | bgr;
        d32[(pos + 7)] = ((ST[52] / sD) << 24) | bgr;
        d32[(pos + 8)] = ((ST[53] / sD) << 24) | bgr;

        pos = (6 + posY) * w + posX;
        d32[(pos + 0)] = ((~~(ST[54] / sD)) << 24) | bgr;
        d32[(pos + 1)] = ((~~(ST[55] / sD)) << 24) | bgr;
        d32[(pos + 2)] = ((~~(ST[56] / sD)) << 24) | bgr;
        d32[(pos + 3)] = ((~~(ST[57] / sD)) << 24) | bgr;
        d32[(pos + 4)] = ((~~(ST[58] / sD)) << 24) | bgr;
        d32[(pos + 5)] = ((~~(ST[59] / sD)) << 24) | bgr;
        d32[(pos + 6)] = ((~~(ST[60] / sD)) << 24) | bgr;
        d32[(pos + 7)] = ((~~(ST[61] / sD)) << 24) | bgr;
        d32[(pos + 8)] = ((~~(ST[62] / sD)) << 24) | bgr;

        pos = (7 + posY) * w + posX;
        d32[(pos + 0)] = ((~~(ST[63] / sD)) << 24) | bgr;
        d32[(pos + 1)] = ((~~(ST[64] / sD)) << 24) | bgr;
        d32[(pos + 2)] = ((~~(ST[65] / sD)) << 24) | bgr;
        d32[(pos + 3)] = ((~~(ST[66] / sD)) << 24) | bgr;
        d32[(pos + 4)] = ((~~(ST[67] / sD)) << 24) | bgr;
        d32[(pos + 5)] = ((~~(ST[68] / sD)) << 24) | bgr;
        d32[(pos + 6)] = ((~~(ST[69] / sD)) << 24) | bgr;
        d32[(pos + 7)] = ((~~(ST[70] / sD)) << 24) | bgr;
        d32[(pos + 8)] = ((~~(ST[71] / sD)) << 24) | bgr;

        pos = (8 + posY) * w + posX;
        d32[(pos + 0)] = ((~~(ST[72] / sD)) << 24) | bgr;
        d32[(pos + 1)] = ((~~(ST[73] / sD)) << 24) | bgr;
        d32[(pos + 2)] = ((~~(ST[74] / sD)) << 24) | bgr;
        d32[(pos + 3)] = ((~~(ST[75] / sD)) << 24) | bgr;
        d32[(pos + 4)] = ((~~(ST[76] / sD)) << 24) | bgr;
        d32[(pos + 5)] = ((~~(ST[77] / sD)) << 24) | bgr;
        d32[(pos + 6)] = ((~~(ST[78] / sD)) << 24) | bgr;
        d32[(pos + 7)] = ((~~(ST[79] / sD)) << 24) | bgr;
        d32[(pos + 8)] = ((~~(ST[80] / sD)) << 24) | bgr;
        // }
      }
    };
    this.stars.forEach(starDraw);
    //console.log(crap);
    // Render stars to canvas
    this.imda.data.set(new Uint8ClampedArray(d32.buffer));
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
