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
  }

  //---------------------------------------------
  // onFrameHandler
  //   Extends ComponentBase::onFrameHandler
  //---------------------------------------------
  onFrameHandler(elapsed) {
  }
}

export default Fireworks;
