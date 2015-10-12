'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Graphic from '../util/Graphic';

/*============================================*\
 * Class
\*============================================*/
/**
 * Base of a single component that can be added to a Canvas.
 */
class GraphicContainer extends Graphic {
  //---------------------------------------------
  // Constructor
  //---------------------------------------------
  /**
   * A GraphicContainer represents the root of a single special effect to be displayed on a canvas.
   *
   * @param canvas The canvas on which to render the layer.
   * @param options The options with which to initialize the layer.
   * @param id The ID of this layer.
   */
  constructor(options, id) {
    this.ctx = canvas.getContext('2d');

    this.options = options || {};
    this.id = id;

    this.renderer = undefined;
    this.parent = undefined;
    this.children = [];

    this.visible = true;
  }

  //---------------------------------------------
  // Methods
  //---------------------------------------------
  /**
   * Add a child to this GraphicContainer.
   *
   * @param {GraphicContainer} child The child layer to add.
   */
  addChild(child) {
    this.addChildAt(child, this.children.length);
  }

  /**
   * Add a child at the specified index.
   *
   * @param {GraphicContainer} child The child layer to add.
   * @param {Number} index The index at which to add the child.
   */
  addChildAt(child, index) {
    this.splice(index, 0, child);
  }

  /**
   * Remove the provided child from the GraphicContainer.
   *
   * @param {GraphicContainer} child The child to remove.
   */
  removeChild(child) {
    var ix = this.children.indexOf(child);
    if (ix != -1)
    {
      this.removeChildAt(ix);
    }
  }

  /**
   * Remove the child at the provided index.
   *
   * @param {Number} index
   */
  removeChildAt(index) {
    if (ix < 0 || ix > this.children.length) {
      throw 'Child index out of bounds: ' + ix;
    }

    this.children.splice(ix, 1);
  }

  //---------------------------------------------
  // Events Handlers
  //---------------------------------------------
  /**
   * Called every time the
   * @param {Number} elapsed Number of seconds that have elapsed since last render.
   */
  _onFrameHandler(elapsed) {
    if (visible) {
      this.onFrameHandler(elapsed);
      this.children.forEach(c => c._onFrameHandler());
    }
  }

  /**
   * Designed to be overridden by sub-class.
   *
   * @param {Number} elapsed Number of seconds that have elapsed since last render.
   */
  onFrameHandler(elapsed) {
    // noop
  }
}

export default Canvas;
