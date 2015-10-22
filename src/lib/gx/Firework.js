/*============================================*\
 * Imports
\*============================================*/
import Object2D from '../physics/Object2D';
import Spark from './Spark';
import hsvToRgb from '../core/util/Color';
import ran from '../core/util/Number';

/*============================================*\
 * Class
\*============================================*/
/**
 * A single firework.
 */
class Firework extends Object2D {
  //------------------------------------
  // Constructor
  //------------------------------------
  /**
   * Construct a firework with the provided options.
   *
   * @param {Object} options
   */
  constructor(options) {
    super(options);

    let o = this.options = options;

    o.minSparks = o.minSparks || 30;
    o.maxSparks = o.maxSparks || 50;
    o.gravity = o.gravity || vec2.fromValues(0, 98);

    this.forces = [o.gravity];

    this.sparks = [];
    this.tail = new Spark({
      redrawSegment: this.renderSmokeTrailSegment.bind(this)
    });
  }

  //------------------------------------
  // Properties
  //------------------------------------
  /**
   * Returns true if the firework has been launched.
   *
   * @returns {Boolean}
   */
  get launched() {
    return vec2.length(this.vel) != 0;
  }

  //------------------------------------
  // Methods
  //------------------------------------
  /**
   * Reset all the firework properties immediately.
   */
  reset() {
    super.reset({
      forces: [this.options.gravity]
    });
  }

  /**
   * Internal render of a single spark segment for a firework.
   *
   * @param {Spark} spark The Spark object.
   * @param {vec2} start Start vec2
   * @param {vec2} end End vec2
   * @param {Number} curLen Length from the sparks start to the beginning of the current segment.
   * @param {Number} ratio Ratio of the current segments start to the total length.
   * @param {Number} elapsed Elapsed number of ms. since the last render loop.
   * @param {RenderingContext} context The Canvas context on which to render.
   */
  renderSparkSegment(spark, start, end, curLen, ratio, elapsed, context) {
    var rgb = hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ', 1)';
    context.lineWidth = spark.options.size * ratio;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  /**
   * Internal render of a single spark segment for a fireworks launch smoke trail.
   *
   * @param {Spark} spark The Spark object.
   * @param {vec2} start Start vec2
   * @param {vec2} end End vec2
   * @param {Number} curLen Length from the sparks start to the beginning of the current segment.
   * @param {Number} ratio Ratio of the current segments start to the total length.
   * @param {Number} elapsed Elapsed number of ms. since the last render loop.
   * @param {RenderingContext} context The Canvas context on which to render.
   */
  renderSmokeTrailSegment(spark, start, end, curLen, ratio, elapsed, context) {
    context.strokeStyle = 'rgba(255, 255, 255, ' + (1 - ratio) + ')';
    context.lineWidth = 2 * (1 - ratio);

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  /**
   * Tell the firework to explode.
   */
  burst() {
    var sparkCount = ran(this.options.minSparks, this.options.maxSparks);
    var rs = this.renderSparkSegment.bind(this);

    for (var i = 0; i < sparkCount; i++) {
      this.sparks.push(new Spark({
        redrawSegment: rs,
        sparkResolution: this.options.sparkResolution || 4
      }));
    }
  }

  /**
   * Launch the firework from start with vel.
   *
   * @param {vec2} start Start position
   * @param {vec2} vel Velocity
   */
  launch(start, vel) {
    if (this.launched) {
      this.reset();
    }

    this.launchTime = 0;
    this.start = vec2.clone(start);
    this.vel = vec2.clone(vel);
    this.pos = vec2.clone(start);

    this.tail.spark({
      color: {
        h: 1,
        s: 1,
        l: 1
      },
      pos: this.pos
    });
  }

  //------------------------------------
  // Event Handlers
  //------------------------------------
  /**
   * Called every render frame.
   *
   * @param {Number} elapsed Elapsed number of ms. since last render loop.
   * @param {RenderingContext} context The Canvas context on which to render.
   */
  onFrameHandler(elapsed, context) {
    if (this.launched) {
      super.onFrameHandler(elapsed, context);

      this.tail.next(vec2.clone(this.pos));

      this.launchTime += elapsed;

      if (this.launchTime > this.duration) {
        this.burst();
      }

      this.tail.onFrameHandler(elapsed, context);
    }
  }
}

export default Firework;
