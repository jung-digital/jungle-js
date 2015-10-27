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
    this.gravity = options.gravity || 100;
    this.fireworkDuration = options.fireworkDuration || 5;
    this.duration = options.duration || 3;

    this.addListener(GraphicEvents.ADDED, this.addedHandler.bind(this));
  }

  //---------------------------------------------
  // Events
  //---------------------------------------------
  addedHandler() {
    this.renderer.addListener(MouseEvents.CLICK, this.canvasMouseClickHandler.bind(this));

    if (!this.launchPads.length) {
      this.launchPads.push(vec2.fromValues(this.renderer.canvas.width / 2, this.renderer.canvas.height));
    }
  }

  canvasMouseClickHandler(event) {
    console.log('Launching', this.launchPads);

    // Launch a firework from each launchpad
    this.launchPads.forEach(lp => {
      var dX = (event.properties.clientX - lp[0]);
      var vX = dX / this.duration;
      var vY = -200;

      var firework = new Firework({});

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
