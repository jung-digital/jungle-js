var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

  var Lib_js = new Lib();

  var DEFAULT_WIDTH = 800;
  var DEFAULT_HEIGHT = 800 / 1.618;

  var ComponentBase = (function () {
    function ComponentBase(canvas, id) {
      _classCallCheck(this, ComponentBase);

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.lastTime = 0;

      this.canvasTargetWidth = this.width = DEFAULT_WIDTH;
      this.canvasTargetHeight = this.height = DEFAULT_HEIGHT;

      window.addEventListener('resize', this.resizeHandler.bind(this));

      canvas.addEventListener('mousemove', this.onMouseMoveHandler.bind(this));
      canvas.addEventListener('mouseout', this.onMouseOutHandler.bind(this));
      canvas.addEventListener('touchstart', this.onTouchStartHandler.bind(this));
      canvas.addEventListener('touchmove', this.onTouchMoveHandler.bind(this));

      canvas.setAttribute('width', DEFAULT_WIDTH);
      canvas.setAttribute('height', DEFAULT_HEIGHT);

      if (id) {
        canvas.setAttribute('id', id);
      }
    }

    _createClass(ComponentBase, [{
      key: 'resizeHandler',
      value: function resizeHandler(event) {
        var i = Math.min(800, window.innerWidth);

        canvas.style.width = this.state.canvasTargetWidth = i;
        canvas.style.height = this.state.canvasTargetHeight = i / 1.618;

        this.resize();
      }
    }, {
      key: 'resize',
      value: function resize() {
        console.log('Resized!', this.state.canvasTargetWidth, this.state.canvasTargetHeight);
      }
    }, {
      key: 'onMouseMoveHandler',
      value: function onMouseMoveHandler() {
        // noop
      }
    }, {
      key: 'onMouseOutHandler',
      value: function onMouseOutHandler() {
        // noop
      }
    }, {
      key: 'onTouchStartHandler',
      value: function onTouchStartHandler() {
        // noop
      }
    }, {
      key: 'onTouchMoveHandler',
      value: function onTouchMoveHandler() {
        // noop
      }
    }, {
      key: 'onFrameHandler',
      value: function onFrameHandler(timestamp) {
        if (!this.lastTime) {
          this.lastTime = timestamp;
          this.elapsed = 0.01;
        } else {
          this.elapsed = (timestamp - this.lastTime) / 1000;
        }
      }
    }]);

    return ComponentBase;
  })();

  var Embers = (function (_ComponentBase) {
    _inherits(Embers, _ComponentBase);

    function Embers() {
      _classCallCheck(this, Embers);

      _get(Object.getPrototypeOf(Embers.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Embers, [{
      key: 'doSomething',
      value: function doSomething() {
        console.log('something is done');
      }
    }]);

    return Embers;
  })(ComponentBase);

  var embers = Embers;

  return embers;
});
//# sourceMappingURL=embers.js.map