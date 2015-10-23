'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import GraphicContainer from './GraphicContainer';
import GraphicEvents from './GraphicEvents';
import Event from './util/Event';
import Rect from './util/Rect';

/*============================================*\
 * Class
 \*============================================*/
/**
 * Base of a single component that can be added to a Canvas.
 */
class GraphicComponent extends GraphicContainer {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * A GraphicContainer represents the root of a single special effect to be displayed on a canvas.
   *
   * @param {Object} options The options with which to initialize the layer.
   * @param {Number} id The ID of this layer.
   */
  constructor(options, id) {
    super(options, id);

    let o = this.options;

    o.bgColor = o.bgColor || '#AAAAAA';

    this.bounds = o.bounds || new Rect(0,0,0,0);
    this.boundsPercent = o.boundsPercent || new Rect(NaN, NaN, NaN, NaN);
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  get x() {
    return isNaN(this.boundsPercent.x) ? this.bounds.x : this.boundsPercent.x * this.parent.width;
  }

  get y() {
    return isNaN(this.boundsPercent.y) ? this.bounds.y : this.boundsPercent.y * this.parent.height;
  }

  get globalX() {
    return this.parent ? this.parent.globalX + this.x : this.x;
  }

  get globalY() {
    return this.parent ? this.parent.globalY + this.y : this.y;
  }

  get width() {
    return isNaN(this.boundsPercent.width) ? this.bounds.width : this.boundsPercent.width * this.parent.width;
  }

  set width(value) {
    this.bounds.width = value;
  }

  get height() {
    return isNaN(this.boundsPercent.height) ? this.bounds.height : this.boundsPercent.height * this.parent.height;
  }

  set height(value) {
    this.bounds.height = value;
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  /**
   * Converts global coordinates of the canvas into local coordinates of this component.
   *
   * @param {Number} x The global canvas x position.
   * @param {Number} y The global canvas y position.
   * @returns {vec2}
   */
  globalToLocal(x, y) {
    return vec2.fromValues(x - this.globalX, y - this.globalY);
  }

  globalInBounds(x, y) {
    return x >= this.globalX && x <= this.globalX + this.width &&
        y >= this.globalY && y <= this.globalY + this.height;
  }

  beginClip() {
    let ctx = this.renderer.ctx;
    let x = this.globalX;
    let y = this.globalY;

    ctx.save();

    ctx.beginPath();
    ctx.rect(x, y, this.width, this.height);
    ctx.clip();
  }

  endClip() {
    let ctx = this.renderer.ctx;

    ctx.restore();
  }

  renderBackground() {
    let ctx = this.renderer.ctx;
    let o = this.options;

    ctx.fillStyle = o.bgColor;

    ctx.fillRect(this.globalX, this.globalY, this.width, this.height);
  }
}

export default GraphicComponent;
