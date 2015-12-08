'use strict';

/*============================================*\
 * Imports
\*============================================*/
import EventDispatcher from '../lib/core/util/Dispatcher';
import Event from '../lib/core/util/Event';

/*============================================*\
 * Class
\*============================================*/
/**
 * A configurable menu.
 */
class Menu extends EventDispatcher {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Menu.
   *
   * @param {DOMElement} container
   * @param {String} filenameOrConfig
   */
  constructor(container, filenameOrConfig) {
    super();

    var _this = this;
    this.$container = $(container);

    if (typeof filenameOrConfig === 'string') {
      $.get(filenameOrConfig, initialize);
    } else {
      initialize(filenameOrConfig);
    }

    function initialize(config) {
      _this.config = config;
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
    this.dispatch(new Event(Menu.LOAD_COMPLETE));

    var renderTemplateWith = _.template($('#menuTemplate').html());

    this.$container.html(renderTemplateWith(this.config));
    this.bindDOMElements();

    this.dispatch(new Event(Menu.RENDERED));
  }

  /**
   * Handle jquery event when a user clicks on a menu item.
   */
  onMenuItemClick(e) {
    var $el = $(e.currentTarget);

    if (this.config && (typeof this.config.clickCallback === 'function')) {
      this.config.clickCallback($el);
    }

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
