import Lib from '../lib/Lib.js';
import ComponentBase from '../lib/core/ComponentBase.js';
import Spark from '../lib/gx/Spark.js';
import util from '../lib/util/util.js';

/*============================================
 * Constants
 *============================================*/
const SPARK_COUNT = 100;              // Maximum number of sparks to display simultaneously
const SPARK_MAX_SIZE = 3.4;
const SPARK_MIN_SIZE = 1;
const SPARK_MAX_VELOCITY = 70;
const SPARK_MIN_VELOCITY = 20;
const SPARK_SOURCE_RADIUS = 40;       // Spark source radius in pixels
const CHANGE_DIR_TIME_MAX = 5000;     // The maximum time to wait between changing directions
const SPARK_RESOLUTION = 10;          // The number of tail segments of the spark.
const SPARK_MAX_TAIL_LENGTH = 20;
const SPARK_MAX_LIFE_S = 10;

/*============================================
 * The demo JSX component
 *============================================*/
class Embers extends ComponentBase {
  constructor(canvas, options) {
    super(canvas, options);

    this.options.sparkCount = this.options.sparkCount || SPARK_COUNT;
    this.options.maxSparkSize = this.options.maxSparkSize || SPARK_MAX_SIZE;
    this.options.minSparkSize = this.options.minSparkSize || SPARK_MIN_SIZE;
    this.options.maxSparkVelocity = this.options.maxSparkVelocity || SPARK_MAX_VELOCITY;
    this.options.minSparkVelocity = this.options.minSparkVelocity || SPARK_MIN_VELOCITY;
    this.options.maxTailLength = this.options.maxTailLength || SPARK_MAX_TAIL_LENGTH;
    this.options.sparkCount = this.options.sparkCount || SPARK_COUNT;
    this.options.maxSparkLife = this.options.maxSparkLife || SPARK_MAX_LIFE_S;

    this.sparkSource = this.options.sparkSource ? this.options.sparkSource : new vec2.fromValues(this.width / 2, this.height / 5);

    this.sparks = [];

    for (var i = 0; i < this.options.sparkCount; i++) {
      this.sparks.push(new Spark({
        pathRedraw: this.pathRedraw.bind(this),
        sparkResolution: 4
      }));
    }
  }

  pathRedraw(spark, start, end, curLen, ratio, elapsed, context) {
    ratio =  1 - (curLen / this.options.maxTailLength);

    var rgb = util.hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ',' + (ratio * spark.options.lifeRatio) + ')';
    context.lineWidth = spark.options.size * ratio;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  onFrameHandler(elapsed) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.sparks.forEach(spark => {
      if (!spark.sparking) {
        if (Math.random() > 1 - (elapsed * 1/5))
        {
          this.startSpark(spark);
        }
        else return;
      }

      this.sparkOnFrame.call(spark, this);

      spark.onFrame(this.elapsed, this.ctx);
    });
  }

  scrollHandler(deltaY) {
    var trans = vec2.fromValues(0, -deltaY);
    this.sparks.forEach(spark => {
      if (spark.sparking) {
        spark.points = spark.points.map(p => vec2.add(vec2.create(), p, trans));

        vec2.add(spark.position, spark.position, trans);
      }
    });
  }

  startSpark(spark) {
    var velAngle = Math.random() - .5 - (Math.PI / 2);
    var sourceAngle = Math.random() * Math.PI * 2;
    var sourceDistance = Math.random() * SPARK_SOURCE_RADIUS;
    var life = (Math.random() * this.options.maxSparkLife/2) + this.options.maxSparkLife / 2;
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

      source = vec2.fromValues(xOffset, Math.min(yOffset + boundingRect.top, window.innerHeight));
    } else {
      throw 'Huge error';
    }

    spark.spark({
      type: 2,
      sparkResolution: SPARK_RESOLUTION,
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
      flickerSpeed: Math.random(),
      life: life,
      lifeTotal: this.options.maxSparkLife
    });
  }

  // 'this' will be the Spark object itself.
  sparkOnFrame(demo) {
    var ran = (Math.random() * CHANGE_DIR_TIME_MAX) + (demo.lastTime - this.options.lastAngleChangeTime);

    if (ran > CHANGE_DIR_TIME_MAX) {
      var angle = (Math.random() * (3.141 / 3)) - (3.141 / 6);
      var matrix = mat2.create();
      mat2.rotate(matrix, matrix, angle);
      vec2.transformMat2(this.options.velocity, this.options.velocity, matrix);
      this.options.lastAngleChangeTime = demo.lastTime;
    }

    this.options.heatCurrent += (Math.random());
    this.options.life -= demo.elapsed;
    this.options.color.l = (this.options.life / this.options.lifeTotal) * this.options.glow;
    this.options.lifeRatio = this.options.life / this.options.lifeTotal;

    var nextPos = vec2.scaleAndAdd(vec2.create(), this.position, this.options.velocity, demo.elapsed);
    this.next(nextPos);

    if (this.options.life < 0 ||
        nextPos[1] > demo.canvas.height ||
        nextPos[0] < 0 ||
        nextPos[1] < 0 ||
        nextPos[0] > demo.canvas.width) {
      console.log('Death of spark')
      this.reset();
    }
  }
}

export default Embers;
