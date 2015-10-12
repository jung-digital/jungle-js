'use strict';

/*============================================*\
 * Class
\*============================================*/
class Graphic extends Dispatcher {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  Graphic() {

  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  /**
   * Designed to be overridden by sub-class.
   *
   * @param {Number} elapsed Number of seconds that have elapsed since last render.
   */
  onFrameHandler(elapsed) {
    // noop
  }
}

export default Graphic;
