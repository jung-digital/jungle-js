'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicComponent from './GraphicComponent';
import GraphicRendererEvents from './events/GraphicRendererEvents';
import MouseEvents from './events/MouseEvents';
import Event from './util/Event';
import Rect from './util/Rect';

/*============================================*\
 * Constants
\*============================================*/
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 800 / 1.618;  // Golden Ratio

/*============================================*\
 * Class
\*============================================*/
/**
 * GraphicRenderer is a Class that manages rendering onto a single canvas. Each canvas
 * should have a single GraphicRenderer.
 *
 * Each GraphicRenderer has one or more components that are stacked on top of each other.
 *
 * The GraphicRenderer is responsible for:
 *
 * - Keeping track of elapsed time
 * - Clearing the canvas
 * - Organizing the components so they draw themselves at the proper times and in
 *   the proper order.
 */
class GraphicRenderer extends GraphicComponent {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a GraphicRenderer for one canvas.
   *
   * @param {HTMLCanvasElement} canvas The HTMLCanvasElement upon which to render.
   * @param {Object} options The options for this renderer.
   * @param {String} id The id of this renderer.
   */
  constructor(canvas, options, id) {
    if (!canvas) {
      throw 'Please provide a canvas to GraphicRenderer. Thank you and have a nice day.';
    }
    super(options, id);

    this.canvas = canvas;

    let o = this.options = options || {};
    o.canvasAutoClear = o.canvasAutoClear !== undefined ? o.canvasAutoClear : true;
    o.fillWindowWidth = o.fillWindowWidth === true ? true : false;
    o.stretchToCanvas = o.stretchToCanvas === true ? true : false;
    o.adjustSizeToCSS = o.adjustSizeToCSS === true ? true : false;
    o.aspectRatio = o.aspectRatio;

    o.debugPosX = o.debugPosX || 10;
    o.debugPosY = o.debugPosY || 50;

    this.fps = 0;

    // lastTime is the previous time that the render loop was called
    this.lastTime = 0;

    if (!o.fillWindowWidth) {
      this.canvasTargetWidth = this.width = (o.width || DEFAULT_WIDTH);
      this.canvasTargetHeight = this.height = (o.height || DEFAULT_HEIGHT);
    }

    setTimeout(this._resizeHandler.bind(this), 1);

    window.addEventListener('resize', this._resizeHandler.bind(this));
    this.lastScrollTop = window.pageYOffset;

    window.addEventListener('scroll', this._scrollHandler.bind(this));

    if (o.mouseEnabled !== false) {
      canvas.addEventListener('mousemove', this._canvasOnMouseMoveHandler.bind(this));
      canvas.addEventListener('mouseout', this._canvasOnMouseOutHandler.bind(this));
      canvas.addEventListener('click', this._canvasOnMouseClickHandler.bind(this));
      canvas.addEventListener('mousedown', this._canvasOnMouseDownHandler.bind(this));
      canvas.addEventListener('mouseup', this._canvasOnMouseUpHandler.bind(this));
    }

    if (o.touchEnabled !== false) {
      canvas.addEventListener('touchstart', this._canvasOnTouchStartHandler.bind(this));
      canvas.addEventListener('touchmove', this._canvasOnTouchMoveHandler.bind(this));
    }

    if (id) {
      canvas.setAttribute('id', id);
      window.jd = window.jd || {};
      window.jd[id] = this;
    }

    // GraphicComponent properties
    this.renderer = this;
    this.parent = undefined;

    // Set up our render loop
    window.requestAnimationFrame(this._onFrameFirstHandler.bind(this));
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  /**
   * Text to display in the upper-left of the canvas when debug is true.
   *
   * @returns {String} The debug text to display.
   */
  get debugText() {
    let fpsNow = Math.round(1 / this.elapsed);
    this.fps = Math.ceil(this.fps * 0.90 + fpsNow * 0.10);
    return this.canvas.width + ', ' +
           this.canvas.height + ' FPS: ' +
           this.fps + (this.options.debugText ? this.options.debugText : '') +
           ' ' + this.options.canvasAutoClear;
  }

  /**
   * Formats and then send the args to the console.
   *
   * @param {Object} args The arguments in order to send to the console.
   */
  debug(...args) {
    if (this.debug) {
      console.log.apply(console, args);
    }
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  /**
   * Internal resize handler called when the browser window is resized.
   *
   * @param {Event} event
   */
  _resizeHandler(event) {
    let prevWidth = this.canvas.width;
    let prevHeight = this.canvas.height;

    if (this.options.adjustSizeToCSS) {

      this.canvasTargetWidth = parseFloat(this.canvas.clientWidth);
      this.canvasTargetHeight = parseFloat(this.canvas.clientHeight);

      this.canvas.setAttribute('width', this.canvasTargetWidth);
      this.canvas.setAttribute('height', this.canvasTargetHeight);
    } else if (this.options.fillWindowWidth) {
      var w = window.innerWidth;
      var h = this.options.aspectRatio ? w / this.options.aspectRatio : window.innerHeight;

      this.canvasTargetWidth = this.width = w;
      this.canvasTargetHeight = this.height = h;

      this.canvas.setAttribute('width', this.canvasTargetWidth);
      this.canvas.setAttribute('height', this.canvasTargetHeight);

      if (this.options.stretchToCanvas) {
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
      }
    } else {

      this.canvas.setAttribute('width', this.canvasTargetWidth);
      this.canvas.setAttribute('height', this.canvasTargetHeight);

      if (!this.options.stretchToCanvas) {
        this.canvas.style.width = this.canvasTargetWidth + 'px';
        this.canvas.style.height = this.canvasTargetHeight + 'px';
      }
    }

    this.scaleX = this.canvas.width / parseFloat(this.canvas.style.width);
    this.scaleY = this.canvas.height / parseFloat(this.canvas.style.height);

    this.bounds.width = this.canvas.width;
    this.bounds.height = this.canvas.height;

    if (prevWidth != this.canvas.width || prevHeight != this.canvas.height) {
      this.dispatch(new Event(GraphicRendererEvents.CANVAS_RESIZE));
    }

    this.dispatch(new Event(GraphicRendererEvents.WINDOW_RESIZE));

    this.resizeHandler();
  }

  /**
   * Resize handler to be overridden by a sub-class.
   */
  resizeHandler() {
    this.debug('Resized!', this.canvasTargetWidth, this.canvasTargetHeight);
  }

  processMouseEvent(event) {
    var rect = this.canvas.getBoundingClientRect();

    return {
      event: event,
      canvasX: event.clientX - rect.left,
      canvasY: event.clientY - rect.top
    };
  }

  /**
   * Internal response to a browser scroll.
   *
   * @param {Event} event The scroll event.
   * @private
   */
  _scrollHandler(event) {
    var deltaY = window.pageYOffset - this.lastScrollTop;
    this.lastScrollTop = window.pageYOffset;

    this.dispatch(new Event(GraphicRendererEvents.WINDOW_SCROLL, {
      deltaY: deltaY,
      scrollTop: window.pageYOffset,
      originalEvent: event
    }));

    this.scrollHandler(deltaY, event);
  }

  /**
   * Scroll handler to be overridden by a sub-class.
   *
   * @param {Number} deltaY The change in scroll Y
   */
  scrollHandler(deltaY) {
    // noop
  }

  /**
   * Called when the canvas is clicked by the mouse.
   *
   * Not called when options.mouseEnabled is false.
   */
  _canvasOnMouseClickHandler(event) {
    this.dispatch(new Event(MouseEvents.CLICK, this.processMouseEvent(event)));
  }

  /**
   * Called when the canvas has a mouse down.
   *
   * Not called when options.mouseEnabled is false.
   */
  _canvasOnMouseDownHandler(event) {
    this.dispatch(new Event(MouseEvents.MOUSE_DOWN, this.processMouseEvent(event)));
  }

  /**
   * Called when the canvas has a mouse up.
   *
   * Not called when options.mouseEnabled is false.
   */
  _canvasOnMouseUpHandler(event) {
    this.dispatch(new Event(MouseEvents.MOUSE_UP, this.processMouseEvent(event)));
  }

  /**
   * Called when the mouse moves over the canvas.
   *
   * Not called when options.mouseEnabled is false.
   */
  _canvasOnMouseMoveHandler(event) {
    this.dispatch(new Event(MouseEvents.MOUSE_MOVE, this.processMouseEvent(event)));
  }

  /**
   * Called when the mouse leaves the canvas.
   *
   * Not called when options.mouseEnabled is false.
   */
  _canvasOnMouseOutHandler(event) {
    this.dispatch(new Event(MouseEvents.MOUSE_OUT, this.processMouseEvent(event)));
  }

  /**
   * Called when a finger touches the canvas.
   *
   * Not called when options.touchEnabled is false.
   */
  _canvasOnTouchStartHandler() {
    // noop
  }

  /**
   * Called when a finger moves on the canvas.
   *
   * Not called when options.touchEnabled is false.
   */
  _canvasOnTouchMoveHandler() {
    // noop
  }

  /**
   * This method is only called once to setup the lastTime and begin
   * the render loop.
   *
   * @param {Number} timestamp The high-resolution timestamp provided by the browser.
   * @private
   */
  _onFrameFirstHandler(timestamp) {
    this.lastTime = timestamp;
    window.requestAnimationFrame(this._onFrameHandler.bind(this));
  }

  /**
   * Internal render frame handler. Called every frame after the first frame
   * call to _onFrameFirstHandler.
   *
   * @param {DOMHighResTimestamp} timestamp The high-resolution timestamp provided by the browser.
   * @private
   */
  _onFrameHandler(timestamp) {
    this.ctx = this.ctx || canvas.getContext('2d');

    window.requestAnimationFrame(this._onFrameHandler.bind(this));

    if (this.options.canvasAutoClear !== undefined) {
      if (this.options.canvasAutoClear !== true) {
        this.ctx.fillStyle = this.options.canvasAutoClear;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    this.elapsed = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    super._onFrameHandler(this.elapsed);

    if (this.options.debug) {
      this.ctx.font = '12px Georgia white';
      this.ctx.fillStyle = 'orange';
      this.ctx.fillText(this.debugText, this.options.debugPosX, this.options.debugPosY);
    }
  }
}

export default GraphicRenderer;
