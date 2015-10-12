/*============================================*\
 * Imports
\*============================================*/
import Object2D from '../physics/Object2D';
import Spark from './Spark';
import hsvToRgb from '../util/Color';
import ran from '../util/Number';

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

    this.options = options;

    this.options.minSparks = options.minSparks || 30;
    this.options.maxSparks = options.maxSparks || 50;
    this.options.gravity = options.gravity || vec2.create(0, 50);

    this.forces = [this.options.gravity];

    this.sparks = [];
    this.tail = new Spark({
      type: 1,
      redrawSegment: this.renderSmokeTrailSegment.bind(this),
      color: {
        h: 1,
        s: 1,
        l: 1
      }
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
    super.reset();
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
    ratio = 1 - (curLen / this.options.maxTailLength);

    var rgb = hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ',' + (ratio * spark.options.lifeRatio) + ')';
    context.lineWidth = spark.options.size * ratio * this.scaleX;

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
    console.log('drawing');
    ratio = 1 - (curLen / this.options.maxTailLength);

    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    context.lineWidth = spark.options.size * ratio * this.scaleX;

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
    this.vel = vel;
    this.pos = this.tail.pos = vec2.clone(start);
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
      console.log(this.pos, this.vel);
      super.onFrame(elapsed, context);

      this.tail.next(this.pos);

      this.launchTime += elapsed;

      if (this.launchTime > this.duration) {
        this.burst();
      }

      this.tail.onFrame(elapsed, context);
    }
  }
}

export default Firework;
