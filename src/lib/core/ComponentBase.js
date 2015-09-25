const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 800 / 1.618;

class ComponentBase {
  constructor(canvas, options, id) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.options = options || {};

    this.lastTime = 0;

    this.canvasTargetWidth = this.width = this.options.width || DEFAULT_WIDTH;
    this.canvasTargetHeight = this.height = this.options.width || DEFAULT_HEIGHT;

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

    window.requestAnimationFrame(this.onFrameFirst.bind(this));
  }

  resizeHandler(event) {
    var i = Math.min(800, window.innerWidth);

    canvas.style.width = this.state.canvasTargetWidth = i;
    canvas.style.height = this.state.canvasTargetHeight = i / 1.618;

    this.resize();
  }

  resize() {
    console.log('Resized!', this.state.canvasTargetWidth, this.state.canvasTargetHeight);
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

  onFrameFirst(timestamp) {
    this.lastTime = timestamp;
    window.requestAnimationFrame(this.onFrame.bind(this));
  }

  onFrameHandler(timestamp) {
    if (!this.lastTime) {
      this.lastTime = timestamp;
      this.elapsed = 0.01;
    } else {
      this.elapsed = (timestamp - this.lastTime) / 1000;
    }
  }
}

export default ComponentBase;
