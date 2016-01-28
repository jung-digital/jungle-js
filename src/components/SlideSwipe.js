'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Dispatcher from '../lib/core/util/Dispatcher';
import Event from '../lib/core/util/Event';

/*============================================*\
 * Statics
\*============================================*/
var slideswipeIndex = 0;

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
  constructor(options) {
    super();

    var defaults = {};

    this.options = _.extend({}, defaults, options);

    this.options.baseSelector = this.options.baseSelector || document.body;
    this.options.direction = this.options.direction || 'vertical';
    this.options.basePosition = this.options.basePosition || 'relative';
    this.options.startIndex = this.options.startIndex ? this.options.startIndex : 0;
    this.options.autoSize = this.options.autoSize === false ? false : true;
    this.options.transitionSpeed = this.options.transitionSpeed || 0.5;

    // Any scroll speed over 500 px / sec will trigger a slide change.
    this.options.mouseWheelThreshold = this.options.mouseWheelThreshold || 200;

    this.base = $(this.options.baseSelector);

    if (this.base.length != 1) {
      throw Error('SlideSwipe: The selector you provided \'' + this.options.baseSelector + '\' returned ' + this.base.length + ' elements. It should only return 1.');
    }

    this.hammer = new Hammer(this.base[0]);
    this.hammer.get('swipe').set({direction: this.options.direction === 'vertical' ? Hammer.DIRECTION_VERTICAL : Hammer.DIRECTION_HORIZONTAL });

    var _this = this;

    this.slides = [];
    this.idToSlideIx = {};

    this.curSlideIx = 0;

    setTimeout(function () {
      this._setupBase();
      this.hammer.on('swipe', this.swipeHandler);

      this.base.on('mousewheel DOMMouseWheel', this.wheelHandler.bind(this));
    }.bind(this), 1);
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  addSlides(selector) {
    var o = this.options;
    var elements = $(selector).toArray();

    elements.forEach(function (element) {
      this._addElementAsSlide(element);
    }.bind(this));

    if (o.startIndex < this.slides.length) {
      this._setupStartSlide();
    }
  }

  _setupStartSlide() {
    var o = this.options;
    var startSlide = this.slides[o.startIndex];

    this.curSlideIx = o.startIndex;
    this.curSlide = this.slides[this.curSlideIx];

    this.slides.forEach(function (slide, ix) {
      if (o.direction === 'vertical') {
        if (ix < o.startIndex) {
          slide.slide.css('top', '-100%');
        } else if (ix === o.startIndex) {
          slide.slide.css('top', '0%');
        } else {
          slide.slide.css('top', '100%');
        }
      }
    });
  }

  _addElementAsSlide(elem) {
    if (elem.getAttribute('id') == '') {
      elem.setAttribute('id', 'slide-child-' + slideswipeIndex++);
    }

    var id = elem.getAttribute('id');

    this.slides.push({
      child: elem
    });

    this.idToSlideIx[id] = this.slides.length-1;

    this._wrapElementInSlide(elem);
  }

  /**
   * Wrap a single jquery selecter element in a parent slide.
   *
   * @param item
   * @private
   */
  _wrapElementInSlide(element) {
    var ix = this.idToSlideIx[element.getAttribute('id')];

    $(element).wrap("<div class='slideswipe-slide' id='slide-" + ix + "'></div>");

    this.slides[ix].slide = $('#slide-' + ix);
  }

  _setupBase() {
    this.base.css('overflow-x', 'hidden');
    this.base.css('overflow-y', 'hidden');
    this.base.css('position', this.options.basePosition);
  }

  gotoSlide(ix) {
    var o = this.options;
    var _this = this;

    this.deltaX = this.deltaY = undefined;

    console.log('Goto slide!', ix);

    if (ix < 0 || ix > this.slides.length - 1 || ix == this.curSlideIx) {
      return;
    }

    this.ignoreWheel = true;

    var nextSlide = this.slides[ix];

    TweenLite.to(nextSlide.slide[0], o.transitionSpeed, {
      top: '0%',
      onComplete: function () {
        setTimeout(function () {
          _this.ignoreWheel = false;
        }, 100);
      }
    });

    if (ix < this.curSlideIx) {
      TweenLite.to(this.curSlide.slide[0], o.transitionSpeed, {
        top: '100%'
      });
    } else {
      TweenLite.to(this.curSlide.slide[0], o.transitionSpeed, {
        top: '-100%'
      });
    }

    this.curSlide = nextSlide;
    this.curSlideIx = ix;
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  swipeHandler(event) {
    console.log(event);
  }

  wheelHandler(event) {
    if (this.ignoreWheel) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    var o = this.options;
    var allowPropagation = false;

    // 100 ms threshold sensitivity
    if (this.startScrollTime && this.startScrollTime > new Date().getTime() - 200) {
      if (Math.abs(this.deltaY) >= o.mouseWheelThreshold) {
        if (this.deltaY < 0) {
          if (this.curSlideIx > 0) {
            this.gotoSlide(this.curSlideIx - 1);
          } else {
            allowPropagation = true;
          }
        } else {
          if (this.curSlideIx < this.slides.length - 1) {
            this.gotoSlide(this.curSlideIx + 1);
          } else {
            allowPropagation = true;
          }
        }
      }
    } else {
      this.startScrollTime = undefined;
      this.deltaY = this.deltaX = 0;
    }

    this.startScrollTime = this.startScrollTime || new Date().getTime();

    this.deltaY += !isNaN(event.originalEvent.deltaY) ? event.originalEvent.deltaY : 0;
    this.deltaX += !isNaN(event.originalEvent.deltaX) ? event.originalEvent.deltaX : 0;

    if (!allowPropagation) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
}

window.Jungle = window.Jungle || {};
window.Jungle.SlideSwipe = SlideSwipe;

export default SlideSwipe;
