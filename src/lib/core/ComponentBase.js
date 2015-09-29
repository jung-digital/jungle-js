/*---------------------------------------------------------------------------*\
 * Constants
\*---------------------------------------------------------------------------*/
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 800 / 1.618;  // Golden Ratio

/*---------------------------------------------------------------------------*\
 * ComponentBase
 *   Root of all graphical components.
\*---------------------------------------------------------------------------*/
class ComponentBase {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  constructor(canvas, options, id) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.options = options || {};
    this.options.canvasAutoClear = this.options.canvasAutoClear !== undefined ? this.options.canvasAutoClear : true;
    this.options.fillCanvas = this.options.fillCanvas === false ? false : true;
    this.lastTime = 0;

    if (!this.options.fillCanvas) {
      this.canvasTargetWidth = this.width = this.options.width || DEFAULT_WIDTH;
      this.canvasTargetHeight = this.height = this.options.width || DEFAULT_HEIGHT;
    } else {
      setTimeout(this.resizeHandler.bind(this), 250);
    }

    window.addEventListener('resize', this.resizeHandler.bind(this));
    this.lastScrollTop = window.scrollY;

    window.addEventListener('scroll', this._scrollHandler.bind(this));

    canvas.addEventListener('mousemove', this.canvasOnMouseMoveHandler.bind(this));
    canvas.addEventListener('mouseout', this.canvasOnMouseOutHandler.bind(this));
    canvas.addEventListener('touchstart', this.canvasOnTouchStartHandler.bind(this));
    canvas.addEventListener('touchmove', this.canvasOnTouchMoveHandler.bind(this));

    canvas.setAttribute('width', DEFAULT_WIDTH);
    canvas.setAttribute('height', DEFAULT_HEIGHT);

    if (id) {
      canvas.setAttribute('id', id);
      window.jd = window.jd || {};
      window.jd[id] = this;
    }

    window.requestAnimationFrame(this._onFrameFirstHandler.bind(this));
  }

  //---------------------------------------------
  // debugText
  //---------------------------------------------
  get debugText() {
    return this.canvas.width + ', ' + this.canvas.height + ' FPS: ' + Math.round(1 / this.elapsed);
  }

  //---------------------------------------------
  // debugText
  //---------------------------------------------
  debug(...args) {
    if (this.debug) {
      console.log.apply(console, args);
    }
  }

  //---------------------------------------------
  // resizeHandler
  //---------------------------------------------
  resizeHandler(event) {
    if (this.options.fillCanvas) {
      var w = window.innerWidth;
      var h = window.innerHeight;

      this.canvas.width = this.canvas.style.width = this.canvasTargetWidth = this.width = w;
      this.canvas.height = this.canvas.style.height = this.canvasTargetHeight = this.height = h;
    } else {
      var i = Math.min(800, window.innerWidth);

      this.canvas.style.width = this.canvasTargetWidth = i;
      this.canvas.style.height = this.canvasTargetHeight = i / 1.618;
    }

    this.scaleX = this.canvas.width / DEFAULT_WIDTH;
    this.scaleY = this.canvas.height / DEFAULT_WIDTH;

    this.resize();
  }

  //---------------------------------------------
  // _scrollHandler
  //---------------------------------------------
  _scrollHandler(event) {
    var deltaY = window.scrollY - this.lastScrollTop;
    this.lastScrollTop = window.scrollY;
    this.scrollHandler(deltaY);
  }

  //---------------------------------------------
  // scrollHandler
  //---------------------------------------------
  scrollHandler(deltaY) {
    // noop
  }

  //---------------------------------------------
  // resize
  //---------------------------------------------
  resize() {
    this.debug('Resized!', this.canvasTargetWidth, this.canvasTargetHeight);
  }

  //---------------------------------------------
  // canvasOnMouseMoveHandler
  //---------------------------------------------
  canvasOnMouseMoveHandler() {
    // noop
  }

  //---------------------------------------------
  // canvasOnMouseOutHandler
  //---------------------------------------------
  canvasOnMouseOutHandler() {
    // noop
  }

  //---------------------------------------------
  // canvasOnTouchStartHandler
  //---------------------------------------------
  canvasOnTouchStartHandler() {
    // noop
  }

  //---------------------------------------------
  // canvasOnTouchMoveHandler
  //---------------------------------------------
  canvasOnTouchMoveHandler() {
    // noop
  }

  //---------------------------------------------
  // _onFrameFirstHandler
  //---------------------------------------------
  _onFrameFirstHandler(timestamp) {
    this.lastTime = timestamp;
    window.requestAnimationFrame(this._onFrameHandler.bind(this));
  }

  //---------------------------------------------
  // _onFrameHandler
  //---------------------------------------------
  _onFrameHandler(timestamp) {
    window.requestAnimationFrame(this._onFrameHandler.bind(this));

    if (this.options.canvasAutoClear) {
      if (this.options.canvasAutoClear === true) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      } else {
        this.ctx.fillStyle = this.options.canvasAutoClear;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    this.elapsed = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.onFrameHandler(this.elapsed);

    if (this.options.debug) {
      this.ctx.font = '12px Georgia white';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.debugText, 10, 50);
    }
  }

  //---------------------------------------------
  // onFrameHandler
  //---------------------------------------------
  onFrameHandler(elapsed) {
    // Override
  }
}

export default ComponentBase;
