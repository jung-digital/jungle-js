'use strict';

/**
 * Returns a random number between min and max.
 *
 * @param min Minimum value of the random number.
 * @param max Maximum value of the random number.
 * @returns {Number}
 */
export function ran(min, max) {
  return Math.random() * (max - min) + min;
};
