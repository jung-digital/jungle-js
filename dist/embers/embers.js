var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.embers = factory();
})(this, function () {
  'use strict';

  /*============================================
   * A spark represents a sequence of shapes that
   * move along a provided path.
   *============================================*/

  var Spark = (function () {
    _createClass(Spark, [{
      key: 'reset',
      value: function reset() {
        this.sparking = false;
      }
    }, {
      key: 'spark',
      value: function spark(options) {
        if (this.sparking) {
          return;
        }

        // Merge with current options
        for (var a in options) {
          this.options[a] = options[a];
        }

        // TODO do not duplicate variable names, reference via 'this.options.blah'
        this.onFrameCallback = options.onFrameCallback;
        this.velocity = options.velocity;

        this.sparking = true;
        this.position = this.options.position;

        this.points = this.options.position ? [this.options.position] : undefined; // Reset points for manual mode
      }

      // Manual mode, set the next position of the spark
    }, {
      key: 'next',
      value: function next(pos) {
        this.position = pos;

        this.points = this.points || [];
        this.points.push(pos);

        if (this.points.length > this.sparkResolution) {
          this.points.shift();
        }
      }
    }, {
      key: 'onFrame',
      value: function onFrame(elapsed, context) {
        if (this.sparking) {
          if (this.onFrameCallback) {
            this.onFrameCallback.call(this, elapsed, context);
          }

          this.updateTail(elapsed, context);
        }
      }
    }, {
      key: 'updateTail',
      value: function updateTail(elapsed, context) {
        // Go backwards from the end, building up paths and letting the dev manually style them
        // ensuring that there are this.resolution # of paths.
        if (this.points.length > 1) {
          for (var i = 0; i < this.points.length - 1; i++) {
            var start = this.points[this.points.length - (i + 1)];
            var end = this.points[this.points.length - (i + 2)];

            // Let dev manually style points based on ratio of start to end
            this.pathRedraw(this, start, end, i / (this.sparkResolution - 1), elapsed, context);
          }
        }
      }

      // Spark()
    }]);

    function Spark(options) {
      _classCallCheck(this, Spark);

      this.id = options.id || -1; // index of this spark
      this.pathRedraw = options.pathRedraw; // A function to call to redraw each segment as the spark moves.

      this.sparkLength = options.sparkLength || 200; // Pixel length of the spark
      this.sparkResolution = options.sparkResolution || 20; // Resolution (number of segments) of the spark

      this.options = options;

      this.paths = []; // Paper.js Paths of this spark, one for each segment.

      this.sparking = false;
    }

    return Spark;
  })();

  var Lib = function Lib() {
    _classCallCheck(this, Lib);

    this.Spark = Spark;
  };

  var lib_js = new Lib();

  var Embers = (function () {
    function Embers() {
      _classCallCheck(this, Embers);
    }

    _createClass(Embers, [{
      key: 'doSomething',
      value: function doSomething() {
        console.log('something is done');
      }
    }]);

    return Embers;
  })();

  var embers = Embers;

  return embers;
});
//# sourceMappingURL=embers.js.map