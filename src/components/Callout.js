'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Lib from '../lib/Jungle';
import GraphicComponent from '../lib/core/GraphicComponent';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import GraphicEvents from '../lib/core/events/GraphicEvents';
import GraphicRendererEvents from '../lib/core/events/GraphicRendererEvents';
import Rect from '../lib/core/util/Rect';
import MouseEvents from '../lib/core/events/MouseEvents';
import Event from '../lib/core/util/Event';
import {fillCallout} from '../lib/core/util/Graphics';

/*============================================*\
 * Class
 \*============================================*/
/**
 * The Playbar class displays uniformly random stars that twinkle occasionally.
 */
class Callout extends GraphicComponent {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Playbar displays a video playback bar on the canvas.
   *
   * @param {Object} options The options for this playbar.
   * @param {String} id The id of the playbar.
   */
  constructor(options, id) {
    this.default('clip', true);

    super(options, id || 'starfield');

    let o = this.options;

    o.bgColor = o.bgColor || '#333333';
    o.strokeStyle = o.strokeStyle || '#555555';
    o.lineWidth = o.lineWidth || 2;
    o.cornerRadius = o.cornerRadius || 20;
    o.tailLength = o.tailLength || 20;
    o.tailGirth = o.tailGirth || 10;
    o.autoWidth = o.autoWidth || true;

    this.calloutSide = o.calloutSide || 'bottom';
    this.target = o.target || this._getDefaultTargetForSide(this.calloutSide);

    let cr2 = o.cornerRadius / 2;
    this.padding = options.padding || new Rect(cr2, cr2, cr2, cr2);

    this.text = o.text || '[Callout:text not set]';

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Properties
  //---------------------------------------------
  /**
   * The total time.
   */
  get text() {
    return this._text;
  }

  set text(value) {
    this._text = value;
  }

  /**
   * The side at which the tail of the callout points.
   *
   * @returns {String} 'top', 'bottom', 'right', or 'left'
   */
  get calloutSide() {
    return this._calloutSide;
  }

  set calloutSide(value) {
    this._calloutSide = value;
  }

  /**
   * The target vec2 at which to point the tail.
   *
   * @returns {vec2}
   */
  get target() {
    return this._target;
  }

  set target(value) {
    this._target = value;
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  /**
   * Returns a default target vec2 for the provided side.
   *
   * @param {String} side 'top', 'bottom', 'left', or 'right'
   * @returns {vec2} A vec2 of the target location.
   * @private
   */
  _getDefaultTargetForSide(side) {
    switch (side) {
      case 'bottom': return vec2.fromValues(this.globalX + this.width - this.options.cornerRadius, this.globalY + this.height);
    }

    return undefined;
  }

  /**
   * Render the background of the callout. This will include a point of origin and
   * rounded corners.
   */
  renderBackground() {
    let o = this.options;
    let ctx = this.renderer.ctx;

    ctx.fillStyle = o.bgColor;
    ctx.strokeStyle = o.strokeStyle;
    ctx.lineWidth = o.lineWidth * 0.75;

    fillCallout(ctx, this.globalX, this.globalY, this.width, this.height, this.target[0], this.target[1], o.cornerRadius, o.calloutSide, true, true, o.tailLength, o.tailGirth);
  }

  /**
   * Create a mask for the content to be drawn on the canvas that matches the edge of the Callout.
   */
  beginClip() {
    let o = this.options;
    let ctx = this.renderer.ctx;

    ctx.save();

    fillCallout(ctx, this.globalX, this.globalY, this.width, this.height, this.target[0], this.target[1], o.cornerRadius, o.calloutSide, false, false, o.tailLength, o.tailGirth);

    ctx.clip();
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  /**
   * Called when the Callout is added to a parent GraphicContainer.
   */
  addedHandler() {
    let o = this.options;

    if (o.clickToAdvance) {
      this.renderer.addListener(MouseEvents.MOUSE_DOWN, this.canvasMouseDownHandler.bind(this));
      this.renderer.addListener(MouseEvents.MOUSE_MOVE, this.canvasMouseMoveHandler.bind(this));
      this.renderer.addListener(MouseEvents.MOUSE_UP, this.canvasMouseUpHandler.bind(this));
    }

    if (this.options.autoWidth) {
      this.width = this.measureText(this._text).width + this.padding.left + this.padding.right - 9;
    }
  }

  /**
   * Render the Callout.
   *
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    let o = this.options;
    let ctx = this.renderer.ctx;
    let b = this.bounds;

    this.renderBackground();

    this.beginClip();

    this.renderText(this.padding.left, this.padding.top, this._text);

    this.endClip();

    this.renderAfterEffects();
  }
}

if (window) {
  window.Callout = Callout;
  window.Jungle = Lib;
}

export default Callout;
