'use strict';

/*============================================*\
 * Class
\*============================================*/
/**
 * An event dispatcher.
 */
class Dispatcher {
  /**
   * Builds an empty dispatcher.
   */
  constructor() {
    this.listeners = {};
  }

  /**
   * Add a listener for a particular event type. Remember to bind the function if you want to preserve `this`.
   *
   * @param {String} type The type of the event to listen for.
   * @param {Function} callback The function to call when the event is dispatched.
   */
  addListener(type, callback) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(callback);
  }

  dispatch(event) {
    this.listeners[event.type] ? this.listeners[event.type].forEach(l => l(event)) : void 0;
  }
}

export default Dispatcher;
