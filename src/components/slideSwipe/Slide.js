'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Dispatcher from '../../lib/core/util/Dispatcher';
import Event from '../../lib/core/util/Event';

/*============================================*\
 * Statics
\*============================================*/

/*============================================*\
 * Class
\*============================================*/
/**
 * A configurable menu.
 */
class Slide extends Dispatcher {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Menu.
   */
  constructor(properties) {
    super();

    for (var prop in properties) {
      this[prop] = properties[prop];
    }
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  center() {
    $(this.slide).css('top', this.getCenterTopPercent() + '%');
    $(this.slide).css('left', this.getCenterLeftPercent() + '%');
  }

  getCenterLeftPercent() {
    var q = $(this.element);
    var thisWidth = q.outerWidth();
    var baseWidth = this.base.innerWidth();
    var left = ((baseWidth - thisWidth) / 2) / baseWidth;
    return left * 100;
  }

  getCenterTopPercent() {
    var q = $(this.element);
    var thisHeight = q.outerHeight();
    var slideHeight = this.base.outerHeight();
    var top = ((slideHeight / 2) - (thisHeight / 2)) / slideHeight;
    return top * 100;
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
}

export default Slide;
