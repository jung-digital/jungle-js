'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Dispatcher from '../lib/core/util/Dispatcher';
import Event from '../lib/core/util/Event';

/*============================================*\
 * Class
 \*============================================*/
/**
 * A configurable menu.
 */
class SlideSwipe extends Dispatcher {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Menu.
   */
  constructor() {
    super();
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
}

window.Jungle = window.Jungle || {};
window.Jungle.SlideSwipe = SlideSwipe;

export default SlideSwipe;
