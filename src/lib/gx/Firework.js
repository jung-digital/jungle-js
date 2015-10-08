import Physical2D from '../physics/Physical2D';
import Spark from './Spark';
import util from '../util/util';

/*============================================
 * A firework is the digital representation of
 * a real firework including launch and explosion
 *============================================*/
class Firework extends Physical2D {
  reset() {
    super.reset();
  }

  get launched() {
    return vec2.length(this.vel) != 0;
  }

  renderSparkSegment(spark, start, end, curLen, ratio, elapsed, context) {
    ratio = 1 - (curLen / this.options.maxTailLength);

    var rgb = util.hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

    context.strokeStyle = 'rgba(' + ~~(rgb.r * 256) + ',' + ~~(rgb.g * 256) + ',' + ~~(rgb.b) * 256 + ',' + (ratio * spark.options.lifeRatio) + ')';
    context.lineWidth = spark.options.size * ratio * this.scaleX;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  burst() {
    var sparkCount = util.ran(this.options.minSparks, this.options.maxSparks);
    var rs = this.renderSparkSegment.bind(this);

    for (var i = 0; i < sparkCount; i++) {
      this.sparks.push(new Spark({
        redrawSegment: rs,
        sparkResolution: this.options.sparkResolution || 4
      }));
    }
  }

  launch(start, vel) {
    if (this.launched) {
      this.reset();
    }

    this.launchTime = 0;
    this.start = vec2.clone(start);
    this.vel = vel;
    this.pos = this.tail.pos = vec2.clone(start);
  }

  onFrame(elapsed, context) {
    //console.log(this.vel);

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

  redrawTailSegment(spark, start, end, curLen, ratio, elapsed, context) {
    console.log('drawing');
    ratio = 1 - (curLen / this.options.maxTailLength);

    context.strokeStyle = 'rgba(255, 255, 255, 1)';
    context.lineWidth = spark.options.size * ratio * this.scaleX;

    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  }

  // Firework()
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
      redrawSegment: this.redrawTailSegment.bind(this),
      color: {
        h: 1,
        s: 1,
        l: 1
      }
    });
  }
}

export default Firework;
