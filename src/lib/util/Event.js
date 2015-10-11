'use strict';

/*============================================*\
 * Class
\*============================================*/
/**
 * Represents an event that can bubble or use the capture phase.
 */
class Event {
  constructor(type, bubbles, useCapture) {
    this.type = type;
    this.bubbles = bubbles;
    this.useCapture = useCapture;
  }
}
