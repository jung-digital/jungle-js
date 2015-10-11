/*============================================*\
 * Imports
\*============================================*/
import Wire from '../gx/Wire';
import Spark from '../gx/Spark';
import util from '../shared/util/util';
import Dispatcher from '../../../core/Dispatcher';
import DemoBase from '../DemoBase';

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
class Surge extends Canvas {
  /**
   * Build a Surge Canvas object.
   *
   * @param props The properties for the Surge object.
   */
  constructor(props) {
    super(props);
  }

  /**
   * Called once per render loop.
   *
   * @param event
   */
  onFrameHandler(elapsed) {
    this.sparks.forEach(s => {
      if (s.sparking) return;

      var prob = SPARK_PROB_SECOND * event.delta,
        shouldSpark = Math.random() < prob;

      if (shouldSpark)
      {
        var wire = util.ranItem(this.wires);

        s.spark({
          followPath: wire.path,
          velocity: SPARK_VEL
        });
      }
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

  componentDidMount() {
    super.componentDidMount();

    // Get a reference to the canvas object
    var canvas = document.getElementById('digitalLinesCanvas');

    this.wires = [];
    this.sparks = [];

    // Create an empty project and a view for the canvas:
    paper.setup(canvas);

    for (var i = 0; i < WIRES; i++)
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

    for (var i = 0; i < SPARKS; i++)
      this.sparks.push(new Spark({
        type: 1,
        color: new paper.Color(Math.random(), Math.random(), Math.random(), 1),
        pathRedraw: this.pathRedraw,
        sparkLength: Math.random() * 500 + 300,
        sparkResolution: 50
      }));

    paper.view.onFrame = (event) => {
      this.onFrame(event);
      this.sparks.forEach(s => s.onFrame(event));

      paper.view.draw();
    }
  };

  render() {

    return <div className="DigitalLines">
      <div className="demo-container">
      {this.getBackButton()}
<div className="title">Wire Rush</div>
<div className="description"></div>
  <div className="source"><a target="_blank" href="https://github.com/jung-digital/jd-demos/blob/master/src/components/demos/DigitalLines/index.js">Source</a></div>
<div className="technologies">Uses: React Starter Kit, EcmaScript 7, WebPack, Paper.js, React.js, Algorithm to Improve Subpath Speed</div>
{this.getCanvasContainer(WIDTH, HEIGHT, 'digitalLinesCanvas')}
</div>
</div>;
}
}

export default {
  name: 'Wire Rush',
  key: 'digitalSparks',
  author: 'Josh',
  technologies: [],
  image: 'digitalspark.png',
  description: 'Light, Airy, and Customizable Background',
  component: DigitalSparkDemo
};
