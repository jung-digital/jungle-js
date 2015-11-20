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

        this.$container.find(".item").on("click", this.onMenuItemClick.bind(this));
        this.$container.find(".submenu").on("click", this.onSubMenuContainerClick.bind(this));
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
    onMenuItemClick(e) {

        var $el = $(e.currentTarget);

        this.$container.find(".item").removeClass("active");
        this.$container.find(".submenu").closest(".item").removeClass("open");

        $el.addClass("active");
        
        if ($el.find(".submenu").length > 0) {    
            $el.toggleClass("open");
        }

    }
    /**
     * Handle jquery event when a user clicks on a submenu container.
     */
    onSubMenuContainerClick(e) {
         e.stopPropagation();
    }

}
    
window.Jungle = window.Jungle || {};
window.Jungle.Menu = Menu;

export default Menu;
