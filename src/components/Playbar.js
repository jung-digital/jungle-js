'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Lib from '../lib/Lib';
import GraphicComponent from '../lib/core/GraphicComponent';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import {ran} from '../lib/core/util/Number';
import GraphicEvents from '../lib/core/GraphicEvents';
import GraphicRendererEvents from '../lib/core/GraphicRendererEvents';
import Rect from '../lib/core/util/Rect';

/*============================================*\
 * Constants
 \*============================================*/

/*============================================*\
 * Class
 \*============================================*/
/**
 * The Playbar class displays uniformly random stars that twinkle occasionally.
 */
class Playbar extends GraphicComponent {
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
    super(options, id || 'starfield');

    let o = this.options;

    o.playedColor = o.playedColor || '#6666FF';

    this.total = o.total || 100;
    this.current = o.current || 0;
    this.bounds = o.bounds || new Rect(0,0, 100, 10);

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }
  //---------------------------------------------
  // Properties
  //---------------------------------------------
  /**
   * The total time.
   */
  get total() {
    return this._total;
  }

  set total(value) {
    this._total = value;
  }

  /**
   * The current time.
   */
  get current() {
    return this._total;
  }

  set current(value) {
    this._total = value;
  }

  /**
   * The Rect component boundaries on the canvas (left, right, top, bottom).
   */
  get bounds() {
    return this._bounds;
  }

  set bounds(value) {
    this._bounds = value;
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  addedHandler() {
    let o = this.options;

    this.renderer.addListener(GraphicRendererEvents.CANVAS_RESIZE, this.canvasResizedHandler.bind(this));
  }

  canvasResizedHandler(event) {

  }

  /**
   * Render every single star that is within the viewport.
   *
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    let o = this.options;
    let ctx = this.renderer.ctx;
    let b = this.bounds;

    this.renderBackground();

    let ratio = this.current / this.total;
    ctx.fillStyle = o.playedColor;
    ctx.fillRect(b.left, b.top, b.width * ratio, b.height);
  }
}

if (window) {
  window.Playbar = Playbar;
  window.Lib = Lib;
}

export default Playbar;
