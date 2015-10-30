'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from '../lib/core/GraphicContainer';
import Spark from '../lib/gx/Spark';
import {hsvToRgb} from '../lib/core/util/Color';
import GraphicRendererEvents from '../lib/core/events/GraphicRendererEvents';
import GraphicEvents from '../lib/core/events/GraphicEvents';

/*============================================*\
 * Constants
\*============================================*/
const SPARK_COUNT = 75;                // Maximum number of sparks to display simultaneously
const SPARK_MAX_SIZE = 3.4;
const SPARK_MIN_SIZE = 1;
const SPARK_MAX_VELOCITY = 70;
const SPARK_MIN_VELOCITY = 20;
const SPARK_SOURCE_RADIUS = 40;        // Spark source radius in pixels
const CHANGE_DIR_TIME_MAX_MS = 5000;   // The maximum time to wait between changing directions
const SPARK_MAX_SEGMENTS = 8;          // The number of tail segments of the spark.
const SPARK_MAX_TAIL_LENGTH = 20;
const SPARK_MAX_LIFE_S = 10;
const SPARK_EDGE_BOTTOM_OFFSET = 200;  // Offset for bottom edge of spark source when target is off screen.

/*============================================*\
 * Functions
\*============================================*/
/**
 * Internal callback for each ember that updates the position and values.
 *
 * @param {Embers} embers The parent Embers instance.
 */
function sparkOnFrame(embers) {
  var r = embers.renderer;

  // Note 'this' is the Spark itself.
  var ran = (Math.random() * CHANGE_DIR_TIME_MAX_MS) + (r.lastTime - this.options.lastAngleChangeTime);

  if (ran > CHANGE_DIR_TIME_MAX_MS) {
    var angle = (Math.random() * (Math.PI / 3)) - (Math.PI / 6);
    var matrix = mat2.create();

    mat2.rotate(matrix, matrix, angle);
    vec2.transformMat2(this.options.vel, this.options.vel, matrix);
    vec2.scale(this.options.vel, this.options.vel, 1 - (Math.random() * r.elapsed * 0.2));

    this.options.lastAngleChangeTime = r.lastTime;
  }

  this.options.heatCurrent += (Math.random());
  this.options.life -= r.elapsed;
  var sinGlow = ((Math.sin(this.options.life * this.options.glowFlickerSpeed) + 1.5) * 0.5);
  this.options.glowFlickerSpeed += Math.random() * r.elapsed;
  this.options.color.l = (this.options.life / this.options.lifeTotal) * this.options.glow * sinGlow;
  this.options.lifeRatio = this.options.life / this.options.lifeTotal;

  var elapsedScale = r.elapsed * r.scaleX;
  var nextPos = vec2.scaleAndAdd(vec2.create(), this.pos, this.options.vel, elapsedScale);
  this.next(nextPos);

  if (this.options.life < 0 ||
    nextPos[1] > r.height + this.options.sparkEdgeBottomOffset ||
    nextPos[0] < 0 ||
    nextPos[1] < 0 ||
    nextPos[0] > r.width) {
    this.reset();
  }
}

/*============================================*\
 * Class
\*============================================*/
/**
 * The embers class display photo-realistic sparks rising as if from a fire.
 */
class Embers extends GraphicContainer {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Embers is a digital effect to display sparks on the screen.
   *
   * @param {Object} options The options for this special effect.
   * @param {String} id
   */
  constructor(options, id) {
    super(options, id || 'embers');

    var o = this.options;

    o.sparkCount = o.sparkCount || SPARK_COUNT;
    o.maxSparkSize = o.maxSparkSize || SPARK_MAX_SIZE;
    o.minSparkSize = o.minSparkSize || SPARK_MIN_SIZE;
    o.maxSparkVelocity = o.maxSparkVelocity || SPARK_MAX_VELOCITY;
    o.minSparkVelocity = o.minSparkVelocity || SPARK_MIN_VELOCITY;
    o.maxTailLength = o.maxTailLength || SPARK_MAX_TAIL_LENGTH;
    o.sparkCount = o.sparkCount || SPARK_COUNT;
    o.maxSparkLife = o.maxSparkLife || SPARK_MAX_LIFE_S;
    o.sparkEdgeBottomOffset = o.sparkEdgeBottomOffset || SPARK_EDGE_BOTTOM_OFFSET;
    o.scrollRatio = o.scrollRatio || 1;

    this.sparkSource = this.options.sparkSource ? this.options.sparkSource : new vec2.fromValues(this.width / 2, this.height / 5);

    this.sparks = [];

    var rs = this.redrawSegment.bind(this);

    for (var i = 0; i < this.options.sparkCount; i++) {
      this.sparks.push(new Spark({
        redrawSegment: rs,
        sparkResolution: 4
      }));
    }

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  /**
   * Redraws a single segment of an ember.
   *
   * @param {Spark} spark The Spark object.
   * @param {vec2} start The start of the segment.
   * @param {vec2} end The end of the segment.
   * @param {Number} curLen The length from the start of the ember to this current segment start.
   * @param {Number} ratio The ratio of curLen out of the full length of the Spark.
   * @param {Number} elapsed The elapsed time in seconds since the last render.
   * @param {RenderingContext} context The DOM canvas rendering context on which to draw.
   */
  redrawSegment(spark, start, end, curLen, ratio, elapsed, context) {
    ratio = 1 - (curLen / this.options.maxTailLength);

    var rgb = hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ',' + (ratio * spark.options.lifeRatio) + ')';
    context.lineWidth = spark.options.size * ratio * this.renderer.scaleX;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  /**
   * Start a new spark.
   *
   * @param {Spark} spark
   */
  startSpark(spark) {
    var velAngle = Math.random() - .5 - (Math.PI / 2);
    var sourceAngle = Math.random() * Math.PI * 2;
    var sourceDistance = Math.random() * SPARK_SOURCE_RADIUS;
    var life = (Math.random() * this.options.maxSparkLife / 2) + this.options.maxSparkLife / 2;
    var source = this.sparkSource;

    if (source.target) {
      var boundingRect = source.target.getBoundingClientRect(); // Get rect ya'll
      var xOffset = 0;
      var yOffset = 0;

      if (source.offset && source.offset.x) {
        xOffset = source.offset.x.indexOf('%') != -1 ? source.target[source.widthProp] * (parseFloat(source.offset.x) / 100) : source.offset.x;
      }
      if (source.offset && source.offset.y) {
        yOffset = source.offset.y.indexOf('%') != -1 ? source.target[source.heightProp] * (parseFloat(source.offset.y) / 100) : source.offset.y;
      }

      source = vec2.fromValues(xOffset, Math.min(yOffset + boundingRect.top, window.innerHeight + this.options.sparkEdgeBottomOffset));
    } else {
      throw 'Please provide a valid target type to Embers object.';
    }

    var options = {
        type: 2,
        sparkResolution: SPARK_MAX_SEGMENTS,
        size: (Math.random() * (this.options.maxSparkSize - this.options.minSparkSize)) + this.options.minSparkSize,
        color: {
          h: Math.random() * 28 + 15,
          s: Math.random() * 0.4 + 0.6,
          l: 1
        },
        pos: vec2.add(vec2.create(), source, vec2.fromValues(Math.cos(sourceAngle) * sourceDistance, Math.sin(sourceAngle) * sourceDistance)),
        vel: vec2.scale(vec2.create(), vec2.fromValues(Math.cos(velAngle), Math.sin(velAngle)), Math.random() * (this.options.maxSparkVelocity - this.options.minSparkVelocity) + this.options.minSparkVelocity),
        heatCurrent: 0,
        lastAngleChangeTime: 0,
        glow: (Math.random() * 0.6) + 0.4,
        glowFlickerSpeed: (Math.random() * 5) + 2,
        life: life,
        lifeTotal: this.options.maxSparkLife
      };
    spark.spark(options);
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  addedHandler() {
    this.renderer.addListener(GraphicRendererEvents.WINDOW_SCROLL, this.windowScrollHandler.bind(this));
  }

  windowScrollHandler(event) {
    let deltaY = event.properties.deltaY;

    var trans = vec2.fromValues(0, -deltaY * this.options.scrollRatio);
    this.sparks.forEach(spark => {
      if (spark.sparking) {
        spark.points = spark.points.map(p => vec2.add(vec2.create(), p, trans));

        vec2.add(spark.pos, spark.pos, trans);
      }
    });
  }

  /**
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    this.sparks.forEach(spark => {
      if (!spark.sparking) {
        if (Math.random() > 1 - elapsed) {
          this.startSpark(spark);
        } else return;
      }

      sparkOnFrame.call(spark, this);

      spark.onFrameHandler(this.elapsed, this.renderer.ctx);
    });
  }
}

export default Embers;
