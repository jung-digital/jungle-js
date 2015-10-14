'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Graphic from './Graphic';
import GraphicEvents from './GraphicEvents';
import Event from './util/Event';

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
   * @param {Object} options The options with which to initialize the layer.
   * @param {Number} id The ID of this layer.
   */
  constructor(options, id) {
    super(options);

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
   * @param {Graphic} child The child graphic element to add.
   */
  addChild(child) {
    this.addChildAt(child, this.children.length);
  }

  /**
   * Add a child at the specified index.
   *
   * @param {Graphic} child The child layer to add.
   * @param {Number} index The index at which to add the child.
   */
  addChildAt(child, index) {
    this.children.splice(index, 0, child);
    child.parent = this;
    child.renderer = this.renderer;
    child.dispatch(new Event(GraphicEvents.ADDED));
    this.dispatch(new Event(GraphicEvents.CHILD_ADDED));
  }

  /**
   * Remove the provided child from the GraphicContainer.
   *
   * @param {Graphic} child The child to remove.
   */
  removeChild(child) {
    var ix = this.children.indexOf(child);
    if (ix != -1)  {
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

    var child = this.children.splice(ix, 1);

    child.renderer = undefined;
    child.parent = undefined;
    
    child.dispatch(new Event(GraphicEvents.REMOVED));
    this.dispatch(new Event(GraphicEvents.CHILD_REMOVED));
  }

  //---------------------------------------------
  // Events Handlers
  //---------------------------------------------
  /**
   * Called every render loop.
   *
   * @param {Number} elapsed Number of seconds that have elapsed since last render.
   */
  _onFrameHandler(elapsed) {
    if (this.visible) {
      this.onFrameHandler(elapsed);
      this.children.forEach(c => c._onFrameHandler(elapsed));
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

export default GraphicContainer;
