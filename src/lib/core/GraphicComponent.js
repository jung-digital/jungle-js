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
  renderBackground() {
    let ctx = this.renderer.ctx;
    let o = this.options;

    ctx.fillStyle = o.bgColor;

    console.log('filling', this.globalX, this.globalY, this.width, this.height);
    ctx.fillRect(this.globalX, this.globalY, this.width, this.height);
  }
}

export default GraphicComponent;
