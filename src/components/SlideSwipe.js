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
var instance = 0;

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

    this.instance = instance++;

    var defaults = {};

    this.options = _.extend({}, defaults, options);

    this.options.baseSelector = this.options.baseSelector || document.body;
    this.options.basePosition = this.options.basePosition || 'relative';
    this.options.startIndexX = this.options.startIndexX ? this.options.startIndexX : 0;
    this.options.startIndexY = this.options.startIndexY ? this.options.startIndexY : 0;
    this.options.autoSize = this.options.autoSize === false ? false : true;
    this.options.transitionSpeed = this.options.transitionSpeed || 0.5;

    this.options.direction = 'horizontal';

    this.base = $(this.options.baseSelector);

    if (this.base.length != 1) {
      throw Error('SlideSwipe: The selector you provided \'' + this.options.baseSelector + '\' returned ' + this.base.length + ' elements. It should only return 1.');
    }

    this.hammer = new Hammer(this.base[0]);
    this.hammer.get('swipe').set({direction: this.options.direction === 'vertical' ? Hammer.DIRECTION_VERTICAL : Hammer.DIRECTION_HORIZONTAL });

    var _this = this;

    this.slides = [];
    this.idToSlideIx = {};

    this.curSlideXIx = 0;
    this.curSlideYIx = 0;

    this.lastDeltaY = 0;
    this.lastWheelTime = new Date();

    setTimeout(function () {
      this._setupBase();
      this.hammer.on('swipe', this.swipeHandler.bind(this));

      this.base.on('wheel mousewheel DOMMouseWheel', this.wheelHandler.bind(this));
    }.bind(this), 1);
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  setSlides(selectorOrArray) {
    var o = this.options;
    var _this = this;

    // Array is assumed to be standard horizontal first (x), vertical second (y).
    if (Array.isArray(selectorOrArray)) {
      var hor = selectorOrArray;

      if (hor.length == 1 && typeof hor[0] === 'string') {
        this.direction = 'vertical';

        $(hor[0]).toArray().forEach(function (item, y) {
          _this._addElementAsSlideAt(item, 0, y);
        });
      } else {
        this.direction = "both";

        // Horizontal [0, 1, 2... X]
        hor.forEach(function (xItem, x) {
          // Vertical [0, 1, 2... Y]
          if (Array.isArray(xItem)) {
            var ver = xItem;
            ver.forEach(function (yItem, y) {
              _this._addElementAsSlideAt($(yItem)[0], x, y);
            });
          }
        });
      }
    } else if (typeof selectorOrArray === 'string') {
      $(selectorOrArray).toArray().forEach(function (item, x) {
        _this._addElementAsSlideAt(item, x, 0);
      });
    } else {
      throw Error('Please provide a single or double dimensioned array or a jQuery selector string to addSlides.');
    }

    this._setupStartSlide();
  }

  _addElementAsSlideAt(elem, x, y) {
    if (elem.getAttribute('id') == '') {
      elem.setAttribute('id', 'slide-child-' + slideswipeIndex++);
    }

    var id = elem.getAttribute('id');

    this.slides[x] = this.slides[x] || [];

    y = y === undefined ? 0 : y;

    this.slides[x][y] = {
      child: elem
    };

    this.idToSlideIx[id] = {
      x: x,
      y: y
    };

    console.log(x, y);
    this._wrapElementInSlide(elem);
  }

  _setupStartSlide() {
    var o = this.options;
    var startSlide = this.curSlide = this.slides[o.startIndexX][o.startIndexY];

    this.curSlideXIx = o.startIndexX;
    this.curSlideYIx = o.startIndexY;

    this.slides.forEach(function (ver, x) {
      ver.forEach(function (slide, y) {
        slide.slide.css('top', '-200%');
      });
    });

    startSlide.slide.css('top', '0%');
  }

  /**
   * Wrap a single jquery selecter element in a parent slide.
   *
   * @param item
   * @private
   */
  _wrapElementInSlide(element) {
    var pos = this.idToSlideIx[element.getAttribute('id')];

    $(element).wrap("<div class='slideswipe-slide' id='slide-" + this.instance + '' + pos.x + '' +  pos.y + "'></div>");

    this.slides[pos.x][pos.y].slide = $('#slide-' + this.instance + '' + pos.x + '' + pos.y);
  }

  _setupBase() {
    this.base.css('overflow-x', 'hidden');
    this.base.css('overflow-y', 'hidden');
    this.base.css('position', this.options.basePosition);
  }

  gotoSlide(x, y, callback) {
    var o = this.options;
    var _this = this;

    this.deltaX = this.deltaY = undefined;

    if (x < 0 || x > this.slides.length - 1 ||
        (x == this.curSlideXIx && y == this.curSlideYIx) ||
        y < 0 || y > this.slides[x].length - 1) {
      callback(false);
      return;
    }

    console.log('Goto slide!', x, y);

    var nextSlide = this.slides[x][y];

    if (x < this.curSlideXIx) { // Shift Right
      nextSlide.slide[0].style.top = '0%';

      TweenLite.fromTo(nextSlide.slide[0], o.transitionSpeed, {
        left: '-200%'
      }, {
        left: '0%',
        onComplete: callback
      });

      TweenLite.fromTo(this.curSlide.slide[0], o.transitionSpeed, {
        left: '0%'
      },{
        left: '200%'
      });
    } else if (x > this.curSlideXIx) { // Shift Left
      nextSlide.slide[0].style.top = '0%';

      TweenLite.fromTo(nextSlide.slide[0], o.transitionSpeed, {
        left: '200%'
      }, {
        left: '0%',
        onComplete: callback
      });

      TweenLite.fromTo(this.curSlide.slide[0], o.transitionSpeed, {
        left: '0%'
      },{
        left: '-200%'
      });
    } else if (y > this.curSlideYIx) { // Shift Down
      TweenLite.fromTo(nextSlide.slide[0], o.transitionSpeed, {
        top: '200%'
      }, {
        top: '0%',
        onComplete: callback
      });

      TweenLite.fromTo(this.curSlide.slide[0], o.transitionSpeed, {
        top: '0%'
      },{
        top: '-200%'
      });
    } else if (y < this.curSlideYIx) { // Shift Up
      TweenLite.fromTo(nextSlide.slide[0], o.transitionSpeed, {
        top: '-200%'
      }, {
        top: '0%',
        onComplete: callback
      });

      TweenLite.fromTo(this.curSlide.slide[0], o.transitionSpeed, {
        top: '0%'
      },{
        top: '200%'
      });
    }

    this.curSlide = nextSlide;
    this.curSlideXIx = x;
    this.curSlideYIx = y;
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  swipeHandler(event) {
    var deltaY = event.deltaY;

    if (deltaY !== 0) {
      var allowSwipe = !((deltaY > 0) ? this.curSlideIx <= 0 : (this.curSlideIx >= this.slides.length - 1));

      if (allowSwipe && this.options.direction === 'vertical') {
        this.ignoreWheel = true;

        this.gotoSlide(this.curSlideXIx, deltaY > 0 ? this.curSlideIx - 1 : this.curSlideIx + 1, function () {
          this.ignoreWheel = false;
        });
      }
    }
  }

  /**
   * Handles mouse wheel events. This is unfortunately complicated by the fact that everyone has their
   * mouse wheel settings set up differently.
   *
   * In addition, some browsers have a
   *
   * @param event
   */
  wheelHandler(event) {
    var _this = this;

    var o = this.options;
    var deltaX = !isNaN(event.originalEvent.deltaX) ? event.originalEvent.deltaX : 0;
    var deltaY = !isNaN(event.originalEvent.deltaY) ? event.originalEvent.deltaY : 0;

    if (this.ignoreWheel) {
      event.stopImmediatePropagation();
      event.preventDefault();

      this.lastWheelTime = new Date();
      this.lastDeltaX = deltaX;
      this.lastDeltaY = deltaY;

      return;
    }

    // We allow a 'swipe' gesture if:
    //
    // 1) There have been no scroll events in the last 100 ms. (this is for single click mouse wheels and no ease)
    // OR 2) A new scroll event has a delta with a opposite sign (-/+)
    // OR 3) A new scroll event in the same direction has a delta magnitude that is greater than the last one AND occurs
    //    at least 50 ms AFTER the last gesture has ended.

    var allowPropagation;
    var allowSwipe = !allowPropagation;

    console.log('Trying', deltaX, deltaY);

    if (deltaY !== 0) {
      allowPropagation = (deltaY < 0) ? _this.curSlideYIx <= 0 : (_this.curSlideYIx >= _this.slides[this.curSlideXIx].length - 1);

      var now = new Date().getTime();
      var magnitudeIncrease = Math.abs(deltaY) > Math.abs(this.lastDeltaY) * 2;
      var swipeGestureDetected = (now - this.lastWheelTime.getTime() > 200) ||
        (Math.sign(deltaY) != Math.sign(this.lastDeltaY)) ||
        magnitudeIncrease;


      if (allowSwipe && swipeGestureDetected) {
        this.ignoreWheel = true;

        _this.gotoSlide(this.curSlideXIx, deltaY < 0 ? _this.curSlideYIx - 1 : _this.curSlideYIx + 1, function () {
          _this.ignoreWheel = false;
        });
      }
    }

    if (deltaX !== 0) {
      allowPropagation = (deltaX < 0) ? _this.curSlideXIx <= 0 : (_this.curSlideXIx >= _this.slides.length - 1);
      allowSwipe = !allowPropagation;

      var now = new Date().getTime();
      var magnitudeIncrease = Math.abs(deltaX) > Math.abs(this.lastDeltaX) * 2;
      var swipeGestureDetected = (now - this.lastWheelTime.getTime() > 200) ||
        (Math.sign(deltaX) != Math.sign(this.lastDeltaX)) ||
        magnitudeIncrease;

      if (allowSwipe && swipeGestureDetected) {
        this.ignoreWheel = true;

        _this.gotoSlide(deltaX < 0 ? _this.curSlideXIx - 1 : _this.curSlideXIx + 1, this.curSlideYIx, function () {
          _this.ignoreWheel = false;
        });
      }
    }

    this.lastWheelTime = new Date();
    this.lastDeltaX = deltaX;
    this.lastDeltaY = deltaY;

    if (!allowPropagation) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
}

window.Jungle = window.Jungle || {};
window.Jungle.SlideSwipe = SlideSwipe;

export default SlideSwipe;
