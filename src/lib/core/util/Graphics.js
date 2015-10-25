'use strict';

/**
 * Renders a rectangle with a single corner radius for all corners.
 *
 * @param {CanvasRenderingContext2D} ctx The context on which to render.
 * @param {Number} x X coordinate of the rectangle (global).
 * @param {Number} y Y coordinate of the rectangle (global).
 * @param {Number} w Width of the rectangle.
 * @param {Number} h Height of the rectangle.
 * @param {Number} radius Radius of the rectangle.
 * @param {Boolean} autoStroke True if you want stroke() called. Default is true.
 * @param {Boolean} autoFill True if you want fill() called. Default is true.
 */
export function fillRectRadius(ctx, x, y, w, h, radius, autoStroke, autoFill) {
  autoStroke = autoStroke === undefined ? true : autoStroke;
  autoFill = autoFill === undefined ? true : autoFill;

  let cr = radius;

  ctx.beginPath();
  ctx.moveTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  // Top Line
  ctx.lineTo(x + w - cr, y);          // Upper right, UL of curve
  // Right Line
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h - cr);  // Lower right, UL of curve
  // Bottom Line
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  ctx.lineTo(x + cr, y + h);  // Lower left, LR of curve
  // Left Line
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
  ctx.lineTo(x, y + cr);              // Upper left, LL of curve

  ctx.closePath();

  if (autoStroke) {
    ctx.stroke();
  }
  if (autoFill) {
    ctx.fill();
  }
};

/**
 * Render a callout background similar to a comic-book style text box. Assumes that you
 * have manually set the context fill and stroke styles before being called.
 *
 * @param {CanvasRenderingContext2D} ctx The context on which to render.
 * @param {Number} x The global x coordinate on the canvas.
 * @param {Number} y The global y coordinate on the canvas.
 * @param {Number} w The width of the entire callout.
 * @param {Number} h The height of the entire callout. Includes the callout point.
 * @param {Number} radius The radius of the corners of the callout.
 * @param {Number} calloutRatio The ratio of the callout point's width / height to the width/height of the callout.
 * @param {String} calloutSide Under construction, but right now can only be 'bottom'.
 * @param {Boolean} autoStroke True if you want stroke() called. Default is true.
 * @param {Boolean} autoFill True if you want fill() called. Default is true.
 */
export function fillCallout(ctx, x, y, w, h, radius, calloutRatio, calloutSide, autoStroke, autoFill) {
  autoStroke = autoStroke === undefined ? true : autoStroke;
  autoFill = autoFill === undefined ? true : autoFill;

  calloutSide = calloutSide || 'bottom';
  calloutRatio = calloutRatio || 0.15;
  radius = radius || 10;

  let cr = radius;
  let wcr = w - (cr * 2);
  let pr = calloutRatio;

  h = h - (h * pr);

  ctx.beginPath();
  ctx.moveTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  // Top Line
  ctx.lineTo(x + w - cr, y);          // Upper right, UL of curve
  // Right Line
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h - cr);  // Lower right, UL of curve
  // Bottom Line
  ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);

  if (calloutSide === 'bottom') {
    ctx.lineTo(x + cr + (wcr * (1 - pr)), y + h);
    ctx.lineTo(x + cr + (wcr * (1 - pr)), y + h + (h * pr));
    ctx.lineTo(x + cr + (wcr * (1 - pr * 2)), y + h);
    ctx.lineTo(x + cr, y + h);
  } else {
    ctx.lineTo(x + cr, y + h);  // Lower left, LR of curve
  }
  // Left Line
  ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
  ctx.lineTo(x, y + cr);              // Upper left, LL of curve
  ctx.closePath();

  if (autoStroke) {
    ctx.stroke();
  }
  if (autoFill) {
    ctx.fill();
  }
};

export default {
  fillRectRadius: fillRectRadius,
  fillCallout: fillCallout
};
