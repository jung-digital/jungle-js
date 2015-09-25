const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 800 / 1.618;

class ComponentBase {
  constructor(canvas, options, id) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.options = options || {};
    this.options.fillCanvas = this.options.fillCanvas === false ? false : true;
    this.lastTime = 0;

    if (!this.options.fillCanvas)
    {
      this.canvasTargetWidth = this.width = this.options.width || DEFAULT_WIDTH;
      this.canvasTargetHeight = this.height = this.options.width || DEFAULT_HEIGHT;
    }
    else 
    {
      this.resizeHandler();
    }

    window.addEventListener('resize', this.resizeHandler.bind(this));

    canvas.addEventListener('mousemove', this.onMouseMoveHandler.bind(this));
    canvas.addEventListener('mouseout', this.onMouseOutHandler.bind(this));
    canvas.addEventListener('touchstart', this.onTouchStartHandler.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMoveHandler.bind(this));

    canvas.setAttribute('width', DEFAULT_WIDTH);
    canvas.setAttribute('height', DEFAULT_HEIGHT);

    if (id) {
      canvas.setAttribute('id', id);
    }

    window.requestAnimationFrame(this._onFrameFirstHandler.bind(this));
  }

  resizeHandler(event) {
    if (this.options.fillCanvas) {
      var w = window.innerWidth;
      var h = window.innerHeight;

      console.log(this.canvas);
      this.canvas.width = this.canvas.style.width = this.canvasTargetWidth = this.width = w;
      this.canvas.height = this.canvas.style.height = this.canvasTargetHeight = this.height = h;
    }
    else {
      var i = Math.min(800, window.innerWidth);

      this.canvas.style.width = this.canvasTargetWidth = i;
      this.canvas.style.height = this.canvasTargetHeight = i / 1.618;
    }

    this.resize();
  }

  resize() {
    console.log('Resized!', this.canvasTargetWidth, this.canvasTargetHeight);
  }

  onMouseMoveHandler() {
    // noop
  }

  onMouseOutHandler() {
    // noop
  }

  onTouchStartHandler() {
    // noop
  }

  onTouchMoveHandler() {
    // noop
  }

  get debugText() {
    return this.canvas.width + ', ' + this.canvas.height + ' FPS: ' + Math.round(1 / this.elapsed);
  }

  _onFrameFirstHandler(timestamp) {
    this.lastTime = timestamp;
    window.requestAnimationFrame(this._onFrameHandler.bind(this));
  }

  _onFrameHandler(timestamp) {
    this.elapsed = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.onFrameHandler(this.elapsed);

    if (this.options.debug) {
      this.ctx.font = '12px Georgia white';
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(this.debugText, 10, 50);
    }

    window.requestAnimationFrame(this._onFrameHandler.bind(this));
  }
}

export default ComponentBase;
