'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from '../lib/core/GraphicContainer';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import {ran} from '../lib/core/util/Number';
import GraphicEvents from '../lib/core/GraphicEvents';
import {PythagoreanCache} from '../lib/core/util/Trig';

/*============================================*\
 * Constants
\*============================================*/
const STAR_DENSITY = 20;         // Stars per 10000 pixels (100 x 100)

const STAR_MAX_SIZE = 5.0;       // Ideally star max size is an odd number
const STAR_MIN_SIZE = 1.2;

const STAR_MIN_SATURATION = 0.0;
const STAR_MAX_SATURATION = 0.15;

const STAR_MIN_HUE = 0;
const STAR_MAX_HUE = 360;

const STAR_MIN_VALUE = 0.1;
const STAR_MAX_VALUE = 1.0;

/*============================================*\
 * Class
\*============================================*/
/**
 * The embers class display photo-realistic sparks rising as if from a fire.
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

    o.scrollRatio = o.scrollRatio || 1;

    this.stars = [];

    this.pc = new PythagoreanCache(o.starMaxSize);

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  updateStars() {
    let o = this.options;
    let pixels = this.renderer.canvas.width * this.renderer.canvas.height;

    this.options.starCount = (pixels / 10000) * this.options.starDensity;

    // Star is [X, Y, Diameter, 32-bit color]
    for (var i = 0; i < this.options.starCount; i++) {
      let star = {
        p: vec2.fromValues(Math.round(Math.random() * o.fieldWidth), Math.round(Math.random() * o.fieldHeight)),
        d: ran(o.starMinSize, o.starMaxSize),
        c: hsvToRgb(ran(o.starMinHue, o.starMaxHue), ran(o.starMinSaturation, o.starMaxSaturation), ran(o.starMinValue, o.starMaxValue))
      };

      this.stars.push(star);
    }
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  addedHandler() {
    var o = this.options;

    o.fieldWidth = o.fieldWidth || this.renderer.canvas.width;
    o.fieldHeight = o.fieldHeight || this.renderer.canvas.height;

    var wh = Math.ceil(o.starMaxSize);

    this.wh = wh;

    this.updateStars();
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
    let imda = this.renderer.ctx.getImageData(0, 0, w, h);
    let d = imda.data;
    let x = 0;
    let y = 0;
    let cxy = Math.round(this.wh / 2);
    let ix = 0;
    let wh = this.wh;

    this.stars.forEach(star => {
      if (star.p[0] >= 0 && star.p[0] <= w &&
          star.p[1] >= 0 && star.p[1] <= h) {

        // Draw each pixel of the star.
        for (x = 0; x < wh; x++) {
          for (y = 0; y < wh; y++) {
            // Calculate the alpha value based on the distance of the pixel from
            // the center of the star.

            let a = 1 - this.pc.calc(x - cxy, y - cxy) / (star.d / 2);
            let ia = 1 - a;

            ix = Math.round((((y + star.p[1]) * w) + (x + star.p[0])) * 4);

            d[ix + 0] = (d[ix + 0] * ia) + (star.c.r * a * 255);
            d[ix + 1] = (d[ix + 1] * ia) + (star.c.g * a * 255);
            d[ix + 2] = (d[ix + 2] * ia) + (star.c.b * a * 255);
            d[ix + 3] = 255; //Math.round(a * 255);
          }
        }
      }
    });

    // Render stars to canvas
    ctx.putImageData(imda, 0, 0);
  }

  /**
   * @param {Number} deltaY The change in scroll position.
   */
  scrollHandler(deltaY) {
    var trans = vec2.fromValues(0, -deltaY * this.options.scrollRatio);
    this.sparks.forEach(spark => {
      if (spark.sparking) {
        spark.points = spark.points.map(p => vec2.add(vec2.create(), p, trans));

        vec2.add(spark.pos, spark.pos, trans);
      }
    });
  }
}

export default StarField;
