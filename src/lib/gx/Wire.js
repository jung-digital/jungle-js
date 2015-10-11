'use strict';

/*============================================*\
 * Imports
\*============================================*/
import Rect from '../util/Rect';
import {toward, reverseOf, vecFor} from '../util/Sides';
import ran from '../util/Number';
import ranItem from '../util/Array';

/*============================================*\
 * Constants
\*============================================*/
export const WireTypes = {
  CURVED: 0,
  STRAIGHT: 1
};

/*============================================
 * Class
 *============================================*/
/**
 * A Wire is a randomly generated sequence of points between two sides of a Rect.
 */
class Wire {
  //------------------------------------
  // Constructor
  //------------------------------------
  /**
   * Constructs a Wire object given the options you provide.
   *
   * @param options All the options associated with a Wire object.
   */
  constructor(options) {
    options = options || {};

    this.detail = options.detail || 180;

    this.type = options.type === undefined ? 1 : options.type;
    this.bounds = options.bounds; // Paper.js View object
    this.path = options.path; // Paper.js Path object
    this.debugStartEnd = options.debugStartEnd;

    this.points = [];

    if (options.autoGen) this.generate(ranItem([1,2,3,4]), ranItem([1,2,3,4]), this.detail, this.bounds);
  }

  //------------------------------------
  // Methods
  //------------------------------------
  /**
   * Generate a wire.
   *
   * @param startSide The side of the Sides enum on which to start.
   * @param endSide The sdie of the Sides enum on which to end.
   * @param detail The maximum length of a segment of the wire.
   * @param rect The rect within which to build the wire.
   */
  generate(startSide, endSide, detail, rect) {
    let start = rect.getRandomPointFor(startSide);
    let end = rect.getRandomPointFor(endSide);
    let cur = start;
    let lastDir = 0;

    if (this.debugStartEnd)
    {
      var scircle = new paper.Path.Circle(start, 5);
      scircle.fillColor = 'green';

      var ecircle = new paper.Path.Circle(end, 5);
      ecircle.fillColor = 'red';
    }

    while (true)
    {
      // Generate a direction for the wire to go, giving preference to directions toward the end
      // and ensuring the same direction is never repeated twice in a row
      let dirs = [1,2,3,4];
      let sidesToward = toward(cur, end); // All directions that get us closer to destination.

      sidesToward.forEach(s => dirs.push(s, s, s, s));   // Duplicate the sides that move toward the destination

      // Filter out the last direction used so we don't do it twice.
      dirs = dirs.filter(d => {
        return d != lastDir && d != reverseOf(lastDir);
      });

      this.points.push(cur);

      let next = vec2.create();
      let disToEnd = vec2.len(vec2.sub(vec2.create(), end, cur));

      if (disToEnd < detail)
      {
        // Just link the two together by two pieces. We should have 1 or 2 sidesToward. Just make a segment for each.
        if (end.x - cur.x) {
          vec2.add(cur, cur, vec2.fromValues(end.x - cur.x, 0));
          this.points.push(cur);
        }
        if (end.y - cur.y) {
          vec2.add(cur, cur, vec2.fromValues(0, end.y - cur.y));
          this.points.push(cur);
        }
        break;
      }
      else {
        let dir;
        let moveDis;
        let dirVec;

        do {
          moveDis = Math.round(ran(detail / 2, detail));
          dir = ranItem(dirs);
          dirVec = vec2.mul(vec2.create(), vecFor(dir), moveDis);

          vec2.add(next, cur, dirVec);
        } while (!bounds.isBounding(next));

        lastDir = dir;

        cur = next;
      }
    }

    this.buildPath();
  }

  /**
   * Build a paper.js Path for the wire.
   */
  buildPath() {
    function vec2ToPoint(v) {
      return new paper.Point(v[0], v[1]);
    }

    this.path.moveTo(vec2ToPoint(this.points[0]));

    this.points.forEach(v => {
      this.path.lineTo(vec2ToPoint(v));
    });

    if (this.type === WireTypes.CURVED)
      this.path.smooth();
  }
}

export default Wire;
