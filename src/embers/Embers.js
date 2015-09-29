/*---------------------------------------------------------------------------*\
 * Imports
\*---------------------------------------------------------------------------*/
import Lib from '../lib/Lib.js';
import ComponentBase from '../lib/core/ComponentBase.js';
import Spark from '../lib/gx/Spark.js';
import util from '../lib/util/util.js';

/*---------------------------------------------------------------------------*\
 * Constants
\*---------------------------------------------------------------------------*/
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

/*---------------------------------------------------------------------------*\
 * Embers Component
\*---------------------------------------------------------------------------*/
class Embers extends ComponentBase {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  constructor(canvas, options) {
    super(canvas, options);

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

    this.sparkSource = this.options.sparkSource ? this.options.sparkSource : new vec2.fromValues(this.width / 2, this.height / 5);

    this.sparks = [];

    var rs = this.redrawSegment.bind(this);

    for (var i = 0; i < this.options.sparkCount; i++) {
      this.sparks.push(new Spark({
        redrawSegment: rs,
        sparkResolution: 4
      }));
    }
  }

  //---------------------------------------------
  // redrawSegment
  //   Redraws a single segment of a Spark
  //---------------------------------------------
  redrawSegment(spark, start, end, curLen, ratio, elapsed, context) {
    ratio = 1 - (curLen / this.options.maxTailLength);

    var rgb = util.hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ',' + (ratio * spark.options.lifeRatio) + ')';
    context.lineWidth = spark.options.size * ratio;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  //---------------------------------------------
  // onFrameHandler
  //   Extends ComponentBase::onFrameHandler
  //---------------------------------------------
  onFrameHandler(elapsed) {
    this.sparks.forEach(spark => {
      if (!spark.sparking) {
        if (Math.random() > 1 - (elapsed * 1 / 5)) {
          this.startSpark(spark);
        } else return;
      }

      this.sparkOnFrame.call(spark, this);

      spark.onFrame(this.elapsed, this.ctx);
    });
  }

  //---------------------------------------------
  // scrollHandler
  //---------------------------------------------
  scrollHandler(deltaY) {
    var trans = vec2.fromValues(0, -deltaY);
    this.sparks.forEach(spark => {
      if (spark.sparking) {
        spark.points = spark.points.map(p => vec2.add(vec2.create(), p, trans));

        vec2.add(spark.position, spark.position, trans);
      }
    });
  }

  //---------------------------------------------
  // startSpark
  //---------------------------------------------
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

    spark.spark({
      type: 2,
      sparkResolution: SPARK_MAX_SEGMENTS,
      size: (Math.random() * (this.options.maxSparkSize - this.options.minSparkSize)) + this.options.minSparkSize,
      color: {
        h: Math.random() * 28 + 20,
        s: Math.random() * 0.4 + 0.6,
        l: 1
      },
      position: vec2.add(vec2.create(), source, vec2.fromValues(Math.cos(sourceAngle) * sourceDistance, Math.sin(sourceAngle) * sourceDistance)),
      velocity: vec2.scale(vec2.create(), vec2.fromValues(Math.cos(velAngle), Math.sin(velAngle)), Math.random() * (this.options.maxSparkVelocity - this.options.minSparkVelocity) + this.options.minSparkVelocity),
      heatCurrent: 0,
      lastAngleChangeTime: 0,
      glow: (Math.random() * 0.8) + 0.2,
      glowFlickerSpeed: (Math.random() * 5) + 2,
      life: life,
      lifeTotal: this.options.maxSparkLife
    });
  }

  //---------------------------------------------
  // Spark::sparkOnFrame
  // 'this' will be the Spark object itself.
  //---------------------------------------------
  sparkOnFrame(embers) {
    var ran = (Math.random() * CHANGE_DIR_TIME_MAX_MS) + (embers.lastTime - this.options.lastAngleChangeTime);

    if (ran > CHANGE_DIR_TIME_MAX_MS) {
      var angle = (Math.random() * (Math.PI / 3)) - (Math.PI / 6);
      var matrix = mat2.create();
      mat2.rotate(matrix, matrix, angle);
      vec2.transformMat2(this.options.velocity, this.options.velocity, matrix);
      vec2.scale(this.options.velocity, this.options.velocity, 1 - (Math.random() * embers.elapsed * 0.2));

      this.options.lastAngleChangeTime = embers.lastTime;
    }

    this.options.heatCurrent += (Math.random());
    this.options.life -= embers.elapsed;
    var sinGlow = ((Math.sin(this.options.life * this.options.glowFlickerSpeed) + 1.5) * 0.5);
    this.options.glowFlickerSpeed += Math.random() * embers.elapsed;
    this.options.color.l = (this.options.life / this.options.lifeTotal) * this.options.glow * sinGlow;
    this.options.lifeRatio = this.options.life / this.options.lifeTotal;

    var nextPos = vec2.scaleAndAdd(vec2.create(), this.position, this.options.velocity, embers.elapsed);
    this.next(nextPos);

    if (this.options.life < 0 ||
        nextPos[1] > embers.canvas.height + this.options.sparkEdgeBottomOffset ||
        nextPos[0] < 0 ||
        nextPos[1] < 0 ||
        nextPos[0] > embers.canvas.width) {
      this.reset();
    }
  }
}

export default Embers;
