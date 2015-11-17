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
        
        var $this = $(this);

        if ($this.find(".submenu").length > 0) {
          $this.toggleClass("open");
        }
      
    });

  }
  
}

if (typeof window.Menu === "undefined") {
  window.Menu = Menu;
}

export default Menu;
