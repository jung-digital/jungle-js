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
import PlaybarEvents from './events/PlaybarEvents';
import MouseEvents from '../lib/core/events/MouseEvents';

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

    o.bgColor = '#dddddd';
    o.playedColor = o.playedColor || '#365dbf';
    o.chapterRadius = o.chapterRadius || 10;
    o.chapterFillColor = o.chapterFillColor || 'white';
    o.playPointRadius = o.playPointRadius || 12;
    o.playPointWidth = o.playPointWidth || 5;
    o.playPointBorderColor = o.playPointBorderColor || '#365dbf';
    o.playPointFillColor = o.playPointFillColor || 'white';
    o.clickToAdvance = o.clickToAdvance === false ? false : true;

    this.total = o.total || 100;
    this.current = o.current || 0;
    this.bounds = o.bounds || new Rect(0,0, 100, 10);
    this._chapters = o.chapters || [];

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
    return this._current;
  }

  set current(value) {
    this._current = value;
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

  /**
   * The Rect component boundaries on the canvas (left, right, top, bottom).
   */
  get chapters() {
    return this._chapters;
  }

  set chapters(value) {
    this._chapters = value;
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  _updateFromMouse(localVec2) {
    if (localVec2[0] >= 0 && localVec2[0] <= this.width) {
      this.current = (localVec2[0] / this.width) * this.total;
    }
  }

  //---------------------------------------------
  // Event Handlers
  //---------------------------------------------
  addedHandler() {
    let o = this.options;

    if (o.clickToAdvance) {
      this.renderer.addListener(MouseEvents.MOUSE_DOWN, this.canvasMouseDownHandler.bind(this));
      this.renderer.addListener(MouseEvents.MOUSE_MOVE, this.canvasMouseMoveHandler.bind(this));
      this.renderer.addListener(MouseEvents.MOUSE_UP, this.canvasMouseUpHandler.bind(this));
    }
  }

  canvasMouseDownHandler(event) {
    if (this.globalInBounds(event.properties.canvasX, event.properties.canvasY)) {
      this.mouseDown = true;

      this._updateFromMouse(this.globalToLocal(event.properties.canvasX, event.properties.canvasY));
    }
  }

  canvasMouseUpHandler(event) {
    if (this.mouseDown) {
      this._updateFromMouse(this.globalToLocal(event.properties.canvasX, event.properties.canvasY));
      this.mouseDown = false;
    }
  }

  canvasMouseMoveHandler(event) {
    this.mouseLoc = vec2.fromValues(event.properties.canvasX, event.properties.canvasY);

    if (this.mouseDown) {
      this._updateFromMouse(this.globalToLocal(event.properties.canvasX, event.properties.canvasY));
    }
  }

  /**
   * Render the Playbar.
   *
   * @param {Number} elapsed
   */
  onFrameHandler(elapsed) {
    let o = this.options;
    let ctx = this.renderer.ctx;
    let b = this.bounds;

    this.beginClip();

    this.renderBackground();

    let ratio = this.current / this.total;
    ctx.fillStyle = o.playedColor;
    ctx.fillRect(this.globalX, this.globalY, this.width * ratio, this.height);

    if (this.chapters) {
      this.chapters.forEach(chapter => {
        ctx.fillStyle = o.chapterFillColor;
        ctx.beginPath();
        ctx.arc(this.globalX + this.width * (chapter / this.total), this.globalY + this.height / 2, o.chapterRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      });
    }

    ctx.fillStyle = o.playPointFillColor;
    ctx.strokeStyle = o.playPointBorderColor;
    ctx.lineWidth = o.playPointWidth;
    ctx.beginPath();
    ctx.arc(this.globalX + this.width * ratio, this.globalY + this.height / 2, o.playPointRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

    ctx.fill();

    this.endClip();

    ctx.fillStyle = 'black';
    if (this.mouseLoc) {
      ctx.fillRect(this.mouseLoc[0], this.mouseLoc[1], 10, 10);
    }
  }
}

if (window) {
  window.Playbar = Playbar;
  window.Lib = Lib;
}

export default Playbar;
