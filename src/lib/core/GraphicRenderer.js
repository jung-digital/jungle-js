/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from './GraphicContainer';

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
class GraphicRenderer extends GraphicContainer {
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
      throw 'Please provide a canvas to GraphicRenderer.';
    }
    super(options, id);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.options = options || {};
    this.options.canvasAutoClear = this.options.canvasAutoClear !== undefined ? this.options.canvasAutoClear : true;
    this.options.fillRenderer = this.options.fillRenderer === false ? false : true;
    this.options.aspectRatio = this.options.aspectRatio;

    // lastTime is the previous time that the render loop was called
    this.lastTime = 0;

    if (!this.options.fillRenderer) {
      this.canvasTargetWidth = this.width = this.options.width || DEFAULT_WIDTH;
      this.canvasTargetHeight = this.height = this.options.height || DEFAULT_HEIGHT;
    } else {
      setTimeout(this._resizeHandler.bind(this), 1);
    }

    canvas.setAttribute('width', DEFAULT_WIDTH);
    canvas.setAttribute('height', DEFAULT_HEIGHT);

    window.addEventListener('resize', this._resizeHandler.bind(this));
    this.lastScrollTop = window.scrollY;

    window.addEventListener('scroll', this._scrollHandler.bind(this));

    if (this.options.mouseEnabled !== false) {
      canvas.addEventListener('mousemove', this.canvasOnMouseMoveHandler.bind(this));
      canvas.addEventListener('mouseout', this.canvasOnMouseOutHandler.bind(this));
      canvas.addEventListener('click', this.canvasOnMouseClickHandler.bind(this));
    }
    if (this.options.touchEnabled !== false) {
      canvas.addEventListener('touchstart', this.canvasOnTouchStartHandler.bind(this));
      canvas.addEventListener('touchmove', this.canvasOnTouchMoveHandler.bind(this));
    }

    if (id) {
      canvas.setAttribute('id', id);
      window.jd = window.jd || {};
      window.jd[id] = this;
    }

    // GraphicContainer properties
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
    return this.canvas.width + ', ' + this.canvas.height + ' FPS: ' + Math.round(1 / this.elapsed) + (this.options.debugText ? this.options.debugText : '');
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
    if (this.options.fillRenderer) {
      var w = window.innerWidth;
      var h = this.options.aspectRatio ? w / this.options.aspectRatio : window.innerHeight;

      this.canvas.width = this.canvasTargetWidth = this.width = w;
      this.canvas.style.width = w + 'px';

      this.canvas.height = this.canvasTargetHeight = this.height = h;
      this.canvas.style.height = h + 'px';
    } else {
      var i = Math.min(800, window.innerWidth);

      this.canvas.style.width = this.canvasTargetWidth = i;
      this.canvas.style.height = this.canvasTargetHeight = i / 1.618;
    }

    this.scaleX = this.canvas.width / DEFAULT_WIDTH;
    this.scaleY = this.canvas.height / DEFAULT_WIDTH;

    this.resizeHandler();
  }

  /**
   * Resize handler to be overridden by a sub-class.
   */
  resizeHandler() {
    this.debug('Resized!', this.canvasTargetWidth, this.canvasTargetHeight);
  }

  /**
   * Internal response to a browser scroll.
   *
   * @param {Event} event The scroll event.
   * @private
   */
  _scrollHandler(event) {
    var deltaY = window.scrollY - this.lastScrollTop;
    this.lastScrollTop = window.scrollY;
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
  canvasOnMouseClickHandler() {
    // noop
  }

  /**
   * Called when the mouse moves over the canvas.
   *
   * Not called when options.mouseEnabled is false.
   */
  canvasOnMouseMoveHandler() {
    // noop
  }

  /**
   * Called when the mouse leaves the canvas.
   *
   * Not called when options.mouseEnabled is false.
   */
  canvasOnMouseOutHandler() {
    // noop
  }

  /**
   * Called when a finger touches the canvas.
   *
   * Not called when options.touchEnabled is false.
   */
  canvasOnTouchStartHandler() {
    // noop
  }

  /**
   * Called when a finger moves on the canvas.
   *
   * Not called when options.touchEnabled is false.
   */
  canvasOnTouchMoveHandler() {
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
      this.ctx.fillText(this.debugText, 10, 50);
    }
  }
}

export default GraphicRenderer;
