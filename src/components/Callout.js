'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Lib from '../lib/Lib';
import GraphicComponent from '../lib/core/GraphicComponent';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import GraphicEvents from '../lib/core/GraphicEvents';
import GraphicRendererEvents from '../lib/core/GraphicRendererEvents';
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
    o.calloutSide = o.calloutSide || 'bottom';
    o.calloutPointRatio = o.calloutPointRatio || 0.15;

    this._text = o.text || '[Callout:text not set]';

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

  //---------------------------------------------
  // Methods
  //---------------------------------------------
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

    fillCallout(ctx, this.globalX, this.globalY, this.width, this.height, o.cornerRadius, o.calloutPointRatio, o.calloutSide, true, true);
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

    this.beginClip();

    this.renderBackground();

    this.endClip();

    this.renderAfterEffects();
  }
}

if (window) {
  window.Callout = Callout;
  window.Jungle = Lib;
}

export default Callout;
