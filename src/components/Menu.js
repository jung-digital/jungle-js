'use strict';

/*============================================*\
 * Imports
\*============================================*/

/*============================================*\
 * Class
\*============================================*/
/**
 * A layer that launches fireworks as directed.
 */
class Menu {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Menu.
   *
   * @param {DOMElement} container
   * @param {Object} options
   */
  constructor(container, $) {

    $(container).find(".item").on("click", function() {
        $(this).toggleClass("open")
    });

  }
  
}

if (typeof window.Menu === "undefined") {
  window.Menu = Menu;
}

export default Menu;
