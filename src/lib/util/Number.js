'use strict';

/**
 * Returns a random number between min and max.
 *
 * @param {Number} min Minimum value of the random number.
 * @param {Number} max Maximum value of the random number.
 * @returns {Number}
 */
export function ran(min, max) {
  return Math.random() * (max - min) + min;
};
