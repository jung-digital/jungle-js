/**
 * Returns true if p2 is above p1.
 *
 * @param v1 gl-matrix vec2
 * @param v2 gl-matrix vec2
 * @returns {boolean}
 */
export function isAbove(v1, v2) {
  return v1[1] < v2[1];
}

/**
 * Returns true if v2 is below v1.
 *
 * @param v1 gl-matrix vec2
 * @param v2 gl-matrix vec2
 * @returns {boolean}
 */
export function isBelow(v1, v2) {
  return v1[1] > v2[1];
}

/**
 * Returns true if v2 is left of v1.
 *
 * @param v1 Point
 * @param v2 Point
 * @returns {boolean}
 */
export function isLeft(v1, v2) {
  return v1[0] < v2[0];
}

/**
 * Returns true if v2 is right of v1.
 *
 * @param v1 Point
 * @param v2 Point
 * @returns {boolean}
 */
export function isRight(v1, v2) {
  return v1[0] > v2[0];
}
