'use strict';

/*============================================*\
 * Imports
\*============================================*/
import GraphicContainer from '../lib/core/GraphicContainer.js';
import Firework from '../lib/gx/Firework.js';
import GraphicEvents from '../lib/core/events/GraphicEvents';
import MouseEvents from '../lib/core/events/MouseEvents';

/*============================================*\
 * Class
\*============================================*/
/**
 * A layer that launches fireworks as directed.
 */
class Fireworks extends GraphicContainer {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * Build a new Fireworks layer.
   *
   * @param {Object} options
   * @param {String} id
   */
  constructor(options, id) {
    super(options, id || 'fireworks');

    this.fireworks = [];
    this.launchPads = options.launchPads || [];
    this.gravity = options.gravity || 98;
    this.fireworkDuration = options.fireworkDuration || 5;
    this.duration = options.duration || 2;

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Events
  //---------------------------------------------
  addedHandler() {
    this.renderer.addListener(MouseEvents.CLICK, this.canvasMouseClickHandler.bind(this));

    if (!this.launchPads.length) {
      this.autoLaunchPad = true;
    }
  }

  canvasMouseClickHandler(event) {
    console.log('Launching', this.launchPads);

    if (this.autoLaunchPad) {
      this.launchPads = [vec2.fromValues(this.renderer.canvas.width / 2, this.renderer.canvas.height)];
    }

    // Launch a firework from each launchpad
    this.launchPads.forEach(lp => {
      var t = this.duration;
      var g = this.gravity;
      var dX = (event.properties.canvasX - lp[0]);
      var dY = (event.properties.canvasY - lp[1]);
      var vX = dX / t;
      var vY = (dY - 0.5 * g * t * t) / t;

      var firework = new Firework({
        gravity: vec2.fromValues(0, g),
        duration: this.duration,
        renderer: this.renderer
      });

      this.fireworks.push(firework);

      firework.launch(vec2.fromValues(lp[0], lp[1]),
        vec2.fromValues(vX, vY));
    });
  }

  /**
   * Called once per render loop.
   *
   * @param {Number} elapsed time in seconds
   */
  onFrameHandler(elapsed) {
    this.fireworks.forEach(fw => {
      fw.onFrameHandler(elapsed, this.renderer.ctx);
    });
  }
}

if (window) {
  window.Fireworks = Fireworks;
}

export default Fireworks;
