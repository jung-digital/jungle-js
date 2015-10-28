'use strict';

/*============================================*\
 * Imports
 \*============================================*/
import Lib from '../lib/Jungle';
import GraphicComponent from '../lib/core/GraphicComponent';
import {hsvToRgb, rgbToFloat32, colorToHex, red, green, blue} from '../lib/core/util/Color';
import {ran} from '../lib/core/util/Number';
import {fit} from '../lib/core/util/Graphics';
import GraphicEvents from '../lib/core/events/GraphicEvents';
import GraphicRendererEvents from '../lib/core/events/GraphicRendererEvents';
import Rect from '../lib/core/util/Rect';
import PlaybarEvents from './events/PlaybarEvents';
import Callout from './Callout';
import MouseEvents from '../lib/core/events/MouseEvents';
import Event from '../lib/core/util/Event';

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
    this.default('clip', true);

    super(options, id || 'starfield');

    let o = this.options;

    o.bgColor = '#dddddd';
    o.playedColor = o.playedColor || '#5dbf36';
    o.chapterRadius = o.chapterRadius || 4;
    o.chapterFillColor = o.chapterFillColor || '#5dbf36';
    o.chapterFillColorPlayed = o.chapterFillColorPlayed || 'white';
    o.playPointRadius = o.playPointRadius || 9;
    o.playPointWidth = o.playPointWidth || 6;
    o.playPointBorderColor = o.playPointBorderColor || '#5dbf36';
    o.playPointFillColor = o.playPointFillColor || 'white';
    o.clickToAdvance = o.clickToAdvance === false ? false : true;
    o.calloutEnabled = o.calloutEnabled === false ? false : true;
    o.chapterHoverDistance = o.chapterHoverDistance || 20;

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
    let o = this.options;

    if (localVec2[0] >= 0 && localVec2[0] <= this.width) {
      this.current = (localVec2[0] / this.width) * this.total;
    }

    this.dispatch(new Event(PlaybarEvents.CHANGE, {
      current: this.current,
      total: this.total
    }));
  }

  /**
   * Called whenever the mouse is moved to display a callout on the screen.
   *
   * @param {vec2} localVec2
   * @private
   */
  _mouseMove(localVec2) {
    let o = this.options;

    if (o.calloutEnabled) {
      let closestChapter = undefined;
      let closestDis = Number.MAX_SAFE_INTEGER;
      let w = this.width;

      this.chapters.forEach(c => {
        let dis = Math.abs(localVec2[0] - (this.globalX + (c.position / this.total) * w));
        if (dis < closestDis) {
          closestChapter = c;
          closestDis = dis;
        }
      });

      if (closestChapter && closestDis <= o.chapterHoverDistance) {
        if (this._callout) {
          this.renderer.removeChild(this._callout);
        }

        let chapterX = (closestChapter.position / this.total) * w;

        let r = new Rect(this.globalX + chapterX - 100, this.globalY - 45, 110, 40);
        let v = fit(r, this.renderer.bounds);
        r.left = v[0];
        r.top = v[1];

        console.log(r);

        this._callout = new Callout({
            text: closestChapter.text || 'Chapter text undefined.',
            bounds: r,
            color: 'white',
            font: '12px Georgia',
            bgColor: 'black',
            padding: new Rect(10),
            cornerRadius: 5,
            tailLength: 10,
            tailGirth: 5,
            autoWidth: true,
            target: vec2.fromValues(this.globalX + chapterX, 0)
          });

        this.renderer.addChild(this._callout);
      } else {
        if (this._callout) {
          this.renderer.removeChild(this._callout);
        }
      }
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
      this.renderer.addListener(MouseEvents.MOUSE_OUT, this.canvasMouseOutHandler.bind(this));
    }
  }

  canvasMouseOutHandler(event) {
    this.mouseDown = false;

    if (this._callout) {
      this.renderer.removeChild(this._callout);
    }
  }

  canvasMouseDownHandler(event) {
    console.log('Mouse Down!', event);
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

    if (this.globalInBounds(event.properties.canvasX, event.properties.canvasY)) {
      this._mouseMove(this.mouseLoc);
    } else {
      this.mouseDown = false;

      if (this._callout) {
        this.renderer.removeChild(this._callout);
      }
    }

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
        ctx.fillStyle = chapter.position < this.current ? o.chapterFillColorPlayed : o.chapterFillColor;
        ctx.beginPath();
        ctx.arc(this.globalX + this.width * (chapter.position / this.total), this.globalY + this.height / 2, o.chapterRadius, 0, Math.PI * 2);
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

    this.renderAfterEffects();
  }
}

if (window) {
  window.PlaybarEvents = PlaybarEvents;
  window.Playbar = Playbar;
  window.Lib = Lib;
}

export default Playbar;
