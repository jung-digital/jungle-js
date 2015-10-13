/*============================================*\
 * Imports
\*============================================*/
import Wire from '../lib/gx/Wire';
import Spark from '../lib/gx/Spark';
import GraphicContainer from '../lib/core/GraphicContainer';

/*============================================*\
 * Constants
\*============================================*/
const WIRES = 50;              // Total wires to generate for sparks to run along
const SPARKS = 30;             // Maximum sparks to run at a time
const SPARK_VEL = 1000;        // Velocity of each spark
const SPARK_PROB_SECOND = 0.3; // Probability of a spark per second
const WIDTH = 800;             // Width of canvas
const HEIGHT = 800 / 1.61;     // Height of canvas

/*============================================*\
 * Surge
\*============================================*/
/**
 * The Surge Effect is a full canvas effect of sparks criss-crossing across
 * wires randomly on the screen.
 */
class Surge extends GraphicContainer {
  /**
   * Build a Surge Canvas object.
   *
   * @param {Object} options The properties for the Surge object.
   */
  constructor(options) {
    super(options);

    this.wires = [];
    this.sparks = [];

    for (var i = 0; i < WIRES; i++) {
      this.wires.push(new Wire({
        type: 0,
        bounds: {left: -50, right: WIDTH + 100, top: -50, bottom: HEIGHT + 50},
        path: new paper.Path({
          strokeColor: 'blue',
          strokeWidth: 0
        }),
        detail: 500,
        autoGen: true
      }));
    }

    for (var i = 0; i < SPARKS; i++) {
      this.sparks.push(new Spark({
        type: 1,
        color: new paper.Color(Math.random(), Math.random(), Math.random(), 1),
        pathRedraw: this.pathRedraw,
        sparkLength: Math.random() * 500 + 300,
        sparkResolution: 50
      }));
    }
  }

  /**
   * Called once per render loop.
   *
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    this.sparks.forEach(s => {
      if (s.sparking) return;

      let prob = SPARK_PROB_SECOND * event.delta;
      let shouldSpark = Math.random() < prob;

      if (shouldSpark) {
        var wire = util.ranItem(this.wires);

        s.spark({
          followPath: wire.path,
          velocity: SPARK_VEL
        });
      }

      s.onFrame(event);
    });
  };

  pathRedraw(spark, path, ratio) {
    ratio = (1.0 - (Math.abs(ratio - 0.5) * 2)) * 0.5;

    paper.project.activeLayer.addChild(path);

    path.strokeColor = spark.options.color.clone();
    path.strokeColor.alpha = ratio * 0.5;
    path.strokeWidth = 6 * ratio;
    path.strokeCap = 'butt';
  }
}

export default Surge;
