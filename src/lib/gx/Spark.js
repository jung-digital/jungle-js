'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Object2D from '../physics/Object2D';

/*============================================*\
 * Class
\*============================================*/
/**
 * A Spark is a particle effect that has a point and a tail.
 */
class Spark extends Object2D {
  //------------------------------------
  // Constructor
  //------------------------------------
  /**
   * Construct a spark based on the options specified.
   *
   * @param {Object} options Spark options.
   */
  constructor(options) {
    options = options || {};

    super(options);

    this.id = options.id || -1; // index of this spark
    this.redrawSegment = options.redrawSegment; // A function to call to redraw each segment as the spark moves.

    this.sparkResolution = options.sparkResolution || 100; // Resolution (number of segments) of the spark

    this.options = options;

    this.paths = []; // Paper.js Paths of this spark, one for each segment.

    this.sparking = false;
  }

  //------------------------------------
  // Methods
  //------------------------------------
  /**
   * Turn off the spark.
   */
  reset() {
    this.sparking = false;
  }

  /**
   * Turn the spark on.
   *
   * @param {Object} options
   */
  spark(options) {
    if (this.sparking) {
      return;
    }

    // Merge with current options
    for (var a in options) {
      this.options[a] = options[a];
    }

    // TODO do not duplicate variable names, reference via 'this.options.blah'
    this.onFrameCallback = options.onFrameCallback;
    this.vel = options.vel;

    this.sparking = true;
    this.pos = this.options.pos;

    this.points = this.options.pos ? [this.options.pos] : undefined; // Reset points for manual mode
  }

  /**
   * For manual mode only. Sets the next position of the spark. The tail of the spark will follow whatever
   * sequence of positions you provide.
   *
   * @param {vec2} pos The vec2 of the next position of the spark.
   */
  next(pos) {
    if (!pos) {
      return;
    }

    this.points = this.points || [];

    let delta = vec2.sub(vec2.create(), pos, this.pos);
    let deltaNorm = vec2.normalize(vec2.create(), delta);
    let len = vec2.len(delta);

    for (var i = 1; i < len; i += Math.min(1.0, len - i)) {
      let tmp = vec2.create();
      let p = vec2.add(tmp, vec2.scale(tmp, deltaNorm, i), this.pos);
      this.points.push(p);
    }

    this.points.push(pos);

    this.pos = pos;

    while (this.points.length > this.sparkResolution) {
      this.points.shift();
    }
  }
  /**
   * Renders the tail of the Spark.
   *
   * @param {Number} elapsed
   * @param {RenderingContext} context
   */
  renderTail(elapsed, context) {
    // Go backwards from the end, building up paths and letting the dev manually style them
    // ensuring that there are this.resolution # of paths.
    if (this.points.length > 1) {
      var curLen = 0;
      for (var i = 0; i < this.points.length - 1; i++) {
        var start = this.points[this.points.length - (i + 1)];
        var end = this.points[this.points.length - (i + 2)];

        curLen += vec2.len(vec2.sub(vec2.create(), end, start));

        // Let dev manually style points based on ratio of start to end
        this.redrawSegment(this, start, end, curLen, i / (this.sparkResolution - 1), elapsed, context);
      }
    }
  }

  //------------------------------------
  // Event Handlers
  //------------------------------------
  /**
   * Called once per render loop.
   *
   * @param {Number} elapsed The elapsed time in ms. since last render loop.
   * @param {RenderingContext} context The Canvas context on which to render.
   */
  onFrameHandler(elapsed, context) {
    if (this.sparking) {
      if (this.onFrameCallback) {
        this.onFrameCallback.call(this, elapsed, context);
      }

      this.renderTail(elapsed, context);
    }
  }
}

export default Spark;
