import Lib from '../lib/Lib.js';
import ComponentBase from '../lib/core/ComponentBase.js';
import Spark from '../lib/gx/Spark.js';
import util from '../shared/util/util';

/*============================================
 * Constants
 *============================================*/
const SPARKS = 500;               // Maximum number of sparks to display simulataneously
const WIDTH = 800;                // Width of canvas
const HEIGHT = 800 / 1.61;        // Height of canvas,
const SPARK_SOURCE_RADIUS = 50;   // Spark source radius in pixels
const CHANGE_DIR_TIME_MAX = 5000; // The maximum time to wait between changing directions   

/*============================================
 * The demo JSX component
 *============================================*/
class Embers extends ComponentBase {
  constructor(canvas) {
    super(canvas);

    this.hue = 0;

    this.sparkSource = new gl.vec2.fromValues(WIDTH / 2, HEIGHT / 5);

    this.sparks = [];

    for (var i = 0; i < SPARKS; i++) {
      this.sparks.push(new Spark({
        pathRedraw: this.pathRedraw,
        sparkResolution: 4
      }));
    }
  }

  pathRedraw(spark, start, end, ratio, elapsed, context) {
    ratio = 1 - ratio;

    context.strokeStyle = 'rgba(' + ~~(spark.options.color.r * 256) + ',' + ~~(spark.options.color.g * 256) + ',' + ~~(spark.options.color.b) * 256 + ',' + ratio + ')';
    context.lineWidth = spark.options.size * ratio;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  onFrame(timestamp) {
    this.ctx.clearRect(0, 0, this.state.WIDTH, this.state.HEIGHT);
    this.elapsed = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.hue = Math.random() * Math.random() * 60;

    this.sparks.forEach(spark => {
      if (!spark.sparking) {
        this.startSpark(spark);
      }

      this.sparkOnFrame.call(spark, this);

      spark.onFrame(this.elapsed, this.ctx);
    });

    window.requestAnimationFrame(this.onFrame.bind(this));
  }

  startSpark(spark) {
    var velAngle = Math.random() - .5 - (Math.PI / 2);
    var sourceAngle = Math.random() * Math.PI * 2;
    var sourceDistance = Math.random() * SPARK_SOURCE_RADIUS;
    var rgb = util.hsvToRgb(this.hue, 1, 0.8);

    spark.spark({
      type: 2,
      size: (Math.random() * 2) + 1,
      color: rgb,
      position: gl.vec2.add(gl.vec2.create(), this.sparkSource, gl.vec2.fromValues(Math.cos(sourceAngle) * sourceDistance, Math.sin(sourceAngle) * sourceDistance)),
      velocity: gl.vec2.scale(gl.vec2.create(), gl.vec2.fromValues(Math.cos(velAngle), Math.sin(velAngle)), Math.random() * 150 + 20),
      heatCurrent: 0,
      lastAngleChangeTime: 0,
      life: (Math.random() * 4 + 2)
    });
  }

  // 'this' will be the Spark object itself.
  sparkOnFrame(demo) {
    var ran = (Math.random() * CHANGE_DIR_TIME_MAX) + (demo.lastTime - this.options.lastAngleChangeTime);

    if (ran > CHANGE_DIR_TIME_MAX) {
      var angle = (Math.random() * (3.141 / 3)) - (3.141 / 6);
      var matrix = gl.mat2.create();
      gl.mat2.rotate(matrix, matrix, angle);
      gl.vec2.transformMat2(this.options.velocity, this.options.velocity, matrix);
      this.options.lastAngleChangeTime = demo.lastTime;
    }

    this.options.heatCurrent += (Math.random());
    this.options.life -= demo.elapsed;

    var nextPos = gl.vec2.scaleAndAdd(gl.vec2.create(), this.position, this.options.velocity, demo.elapsed);
    this.next(nextPos);

    if (this.options.life < 0 || nextPos.y > HEIGHT + 50 || nextPos.x < -50 || nextPos.y < -50 || nextPos.x > WIDTH + 50) {
      this.reset();
    }
  }

  onMouseMoveHandler(event) {
    var rect = this.canvas.getBoundingClientRect();
    var scale = WIDTH / this.state.canvasTargetWidth;

    this.sparkSource = gl.vec2.fromValues((event.clientX - rect.left) * scale, (event.clientY - rect.top) * scale);
  }

  onTouchMoveHandler(event) {
    event.preventDefault();

    var rect = this.canvas.getBoundingClientRect();
    var scale = WIDTH / this.state.canvasTargetWidth;

    this.sparkSource = gl.vec2.fromValues((event.touches[0].clientX - rect.left) * scale, (event.touches[0].clientY - rect.top) * scale);
  }
}

export default Embers;
