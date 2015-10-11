'use strict';

import {ran} from './Number';
import {Sides} from './Sides';

/*---------------------------------------------------------------------------*\
 * Rect
 *
 * Define a rectangle with x, y, width, height
\*---------------------------------------------------------------------------*/
class Rect {
  //------------------------------------
  // Constructor
  //------------------------------------
  /**
   * Build a Rect object.
   * @param x Left
   * @param y Top
   * @param width Width of rectangle
   * @param height Height of rectangle
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  //------------------------------------
  // Properties
  //------------------------------------
  /**
   * Returns the right edge of the Rect.
   * @returns {Number}
   */
  get right() {
    return this.x + this.width;
  }

  /**
   * Returns the bottom edge of the Rect.
   * @returns {Number}
   */
  get bottom() {
    return this.y + this.height;
  }

  //------------------------------------
  // Methods
  //------------------------------------
  /**
   * Returns true if the provide x,y is within this Rect.
   * @param x
   * @param y
   * @returns {boolean}
   */
  isBounding(x, y) {
    return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
  }

  /**
   * Returns true if the provided gl-matrix vec2 object is within this Rect.
   * @param v A gl-matrix vec2 Object
   * @returns {boolean}
   */
  isBoundingVec2(v) {
    return v[0] >= this.x && v[1] >= this.y && v[0] <= this.x + this.width && v[1] <= this.y + this.height;
  }

  /**
   * Returns a random point along the given side given the provided Rect.
   * @param side
   * @param rect
   * @returns {paper.Point}
   */
  function getRanVec2For(side) {
    let x = 0;
    let y = 0;

    x = side == Sides.RIGHT ? this.right : x;
    x = side == Sides.TOP || side == Sides.BOTTOM ? ran(0, this.right) : x;

    y = side == Sides.BOTTOM ? rect.bottom : y;
    y = side == Sides.LEFT || side == Sides.RIGHT ? ran(0, this.bottom) : y;

    return vec2.fromValues(x, y);
  }
}

export default Rect;
