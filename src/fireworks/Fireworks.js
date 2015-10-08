/*---------------------------------------------------------------------------*\
 * Imports
\*---------------------------------------------------------------------------*/
import Lib from '../lib/Lib.js';
import ComponentBase from '../lib/core/ComponentBase.js';
import Firework from '../lib/gx/Firework.js';
import util from '../lib/util/util.js';

/*---------------------------------------------------------------------------*\
 * Constants
\*---------------------------------------------------------------------------*/

/*---------------------------------------------------------------------------*\
 * Fireworks Component
\*---------------------------------------------------------------------------*/
class Fireworks extends ComponentBase {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  constructor(canvas, options, id) {
    options.canvasAutoClear = 'black';
    super(canvas, options, id || 'fireworks');

    this.fireworks = [];
    this.launchPads = options.launchPads || [];
    this.gravity = options.gravity || 100;
    this.fireworkDuration = options.fireworkDuration || 5;
    this.duration = options.duration || 3;

    if (!this.launchPads.length) {
      this.launchPads.push(vec2.create(canvas.width / 2, canvas.height));
    }
  }

  //---------------------------------------------
  // canvasOnMouseClickHandler
  //   Extends ComponentBase::canvasOnMouseClickHandler
  //---------------------------------------------
  canvasOnMouseClickHandler(event) {
    var self = this;

    console.log('Launching', this.launchPads);

    // Launch a firework from each launchpad
    this.launchPads.forEach(lp => {
      var dX = (event.clientX - lp[0]);
      var vX = dX / self.duration;  
      var vY = 100;

      var firework = new Firework({});

      self.fireworks.push(firework);

      firework.launch(vec2.fromValues(lp[0], lp[1]),
                      vec2.fromValues(vX, vY));
    });
  }

  //---------------------------------------------
  // onFrameHandler
  //   Extends ComponentBase::onFrameHandler
  //---------------------------------------------
  onFrameHandler(elapsed) {
    this.fireworks.forEach(function(fw) {
      fw.onFrame(elapsed);
    });
  }
}

export default Fireworks;
