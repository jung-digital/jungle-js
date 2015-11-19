'use strict';

/*============================================*\
 * Imports
\*============================================*/

/*============================================*\
 * Class
\*============================================*/
/**
 * A configurable menu.
 */
class Menu {
    //---------------------------------------------
    // Constructor
    //---------------------------------------------
    /**
     * Build a new Menu.
     *
     * @param {DOMElement} container
     * @param {string} configFile
     */
    constructor(container, configFile) {

        var _this = this;
        this.$container = $(container);
        
        $.get(configFile, function(data) {
            _this.menuConfigData = data;
            $(document).ready(_this.onRenderReady.bind(_this));
        });

    }
    
    //---------------------------------------------
    // Event Handlers
    //---------------------------------------------
        
    /**
     * bind all event handlers needed.
     */
    bindDOMElements() {
        this.$container.find(".item").on("click", this.onMenuItemClick);
        this.$container.find(".submenu").on("click", this.onSubMenuContainerClick);
    }
    
    /**
     * Handler when all render dependencies have loaded
     */
    onRenderReady() {

        var renderTemplateWith = _.template($("#menuTemplate").html());
        this.$container.html(renderTemplateWith(this.menuConfigData));
        this.bindDOMElements();

    }
    /**
     * Handle jquery event when a user clicks on a menu item.
     */
    onMenuItemClick() {

        var $this = $(this);

        if ($this.find(".submenu").length > 0) {
            $this.toggleClass("open");
        }

    }
    /**
     * Handle jquery event when a user clicks on a submenu container.
     */
    onSubMenuContainerClick(e) {
         e.stopPropagation();
    }

}

if (typeof window.Menu === "undefined") {
    window.Menu = Menu;
}

export default Menu;
