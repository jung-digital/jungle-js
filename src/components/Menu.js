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
class Menu extends Dispatcher {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Menu.
   *

   * @param {DOMElement} container
   * @param {String} filenameOrConfig
   */
  constructor(options) {

    super();

    var defaults = {
      $container: 'jungle-menu',
      isSticky: false,
      config: []
    };

    this.settings = _.extend({}, defaults, options);

    var _this = this;
    this.$container = $(this.settings.container);

    if (typeof this.settings.config === 'string') {
      $.get(this.settings.config, initialize);
    } else {
      initialize(this.settings.config);
    }

    function initialize(config) {
      if (typeof config === 'string') {
        config = JSON.parse(config);
      }
      _this.config = _.extend({}, config, {settings: _this.settings});
      $(document).ready(_this.onRenderReady.bind(_this));
    }
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  get configData() {
    return this.config;
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  /**
   * bind all event handlers needed.
   */
  bindDOMElements() {
    this.$container.find('.item').on('click', this.onMenuItemClick.bind(this));
    this.$container.find('.submenu').on('click', this.onSubMenuContainerClick.bind(this));
  }

  /**
   * Handler when all render dependencies have loaded
   */
  onRenderReady() {
    // this.prepareHrefs();
    this.dispatch(new Event(Menu.LOAD_COMPLETE));

    var renderTemplateWith = _.template($('#menuTemplate').html());

    this.$container.html(renderTemplateWith(this.config));
    this.bindDOMElements();

    if (this.settings.isSticky) {
      $(document).scroll(_.throttle(function() {

        var $menu = $('.menu');
        var $menuAnchor = $('.menu-anchor');

        if ($menu.length > 0 && $menuAnchor.length > 0) {

          var menuHeightToTopOfWindow = $menuAnchor.offset().top;
          var documentscrollTop = $(document).scrollTop();

          if (documentscrollTop >= menuHeightToTopOfWindow) {
            $menu.addClass('isFloating');
            $menuAnchor.css({'height': $menu.height() + 'px'});
          } else {
            $menu.removeClass('isFloating');
            $menuAnchor.css({'height': '0'});
          }
        }

      }, 10));

    }

    this.dispatch(new Event(Menu.RENDERED));
  }

  /**
   * Handle jquery event when a user clicks on a menu item.
   */
  onMenuItemClick(e) {
    var $el = $(e.currentTarget);

    this.$container.find('.item').removeClass('active');
    this.$container.find('.submenu').closest('.item').removeClass('open');

    $el.addClass('active');

    if ($el.find('.submenu').length > 0) {
      $el.toggleClass('open');
    }
  }

  /**
   * Handle jquery event when a user clicks on a submenu container.
   */
  onSubMenuContainerClick(e) {
    e.stopPropagation();
  }

  getParameterByName(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
}

Menu.LOAD_COMPLETE = Event.generateType('LOAD_COMPLETE', 'Dispatched when the menu has initially been rendered');
Menu.RENDERED = Event.generateType('RENDERED', 'Dispatched once the menu has been renderered');

window.Jungle = window.Jungle || {};
window.Jungle.Menu = Menu;

export default Menu;
