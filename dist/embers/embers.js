var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('shared/util/util')) : typeof define === 'function' && define.amd ? define(['shared/util/util'], factory) : global.Embers = factory(global.util);
})(this, function (util) {
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

      window.requestAnimationFrame(this.onFrameFirst.bind(this));
    }

    /*============================================
     * Constants
     *============================================*/

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
      key: 'onFrameFirst',
      value: function onFrameFirst(timestamp) {
        this.lastTime = timestamp;
        window.requestAnimationFrame(this.onFrame.bind(this));
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

  var SPARKS = 500; // Maximum number of sparks to display simulataneously
  var WIDTH = 800; // Width of canvas
  var HEIGHT = 800 / 1.61; // Height of canvas,
  var SPARK_SOURCE_RADIUS = 50; // Spark source radius in pixels
  var CHANGE_DIR_TIME_MAX = 5000; // The maximum time to wait between changing directions  

  /*============================================
   * The demo JSX component
   *============================================*/

  var Embers = (function (_ComponentBase) {
    _inherits(Embers, _ComponentBase);

    function Embers(canvas) {
      _classCallCheck(this, Embers);

      _get(Object.getPrototypeOf(Embers.prototype), 'constructor', this).call(this, canvas);

      this.hue = 0;

      this.sparkSource = new gl.vec2.fromValues(WIDTH / 2, HEIGHT / 5);

      this.sparks = [];

      for (var i = 0; i < SPARKS; i++) {
        this.sparks.push(new Spark({
          pathRedraw: this.pathRedraw,
          sparkResolution: 4
        }));
      }
    }

    _createClass(Embers, [{
      key: 'pathRedraw',
      value: function pathRedraw(spark, start, end, ratio, elapsed, context) {
        ratio = 1 - ratio;

        context.strokeStyle = 'rgba(' + ~ ~(spark.options.color.r * 256) + ',' + ~ ~(spark.options.color.g * 256) + ',' + ~ ~spark.options.color.b * 256 + ',' + ratio + ')';
        context.lineWidth = spark.options.size * ratio;

        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.stroke();
      }
    }, {
      key: 'onFrame',
      value: function onFrame(timestamp) {
        var _this = this;

        this.ctx.clearRect(0, 0, this.state.WIDTH, this.state.HEIGHT);
        this.elapsed = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.hue = Math.random() * Math.random() * 60;

        this.sparks.forEach(function (spark) {
          if (!spark.sparking) {
            _this.startSpark(spark);
          }

          _this.sparkOnFrame.call(spark, _this);

          spark.onFrame(_this.elapsed, _this.ctx);
        });

        window.requestAnimationFrame(this.onFrame.bind(this));
      }
    }, {
      key: 'startSpark',
      value: function startSpark(spark) {
        var velAngle = Math.random() - .5 - Math.PI / 2;
        var sourceAngle = Math.random() * Math.PI * 2;
        var sourceDistance = Math.random() * SPARK_SOURCE_RADIUS;
        var rgb = util.hsvToRgb(this.hue, 1, 0.8);

        spark.spark({
          type: 2,
          size: Math.random() * 2 + 1,
          color: rgb,
          position: gl.vec2.add(gl.vec2.create(), this.sparkSource, gl.vec2.fromValues(Math.cos(sourceAngle) * sourceDistance, Math.sin(sourceAngle) * sourceDistance)),
          velocity: gl.vec2.scale(gl.vec2.create(), gl.vec2.fromValues(Math.cos(velAngle), Math.sin(velAngle)), Math.random() * 150 + 20),
          heatCurrent: 0,
          lastAngleChangeTime: 0,
          life: Math.random() * 4 + 2
        });
      }

      // 'this' will be the Spark object itself.
    }, {
      key: 'sparkOnFrame',
      value: function sparkOnFrame(demo) {
        var ran = Math.random() * CHANGE_DIR_TIME_MAX + (demo.lastTime - this.options.lastAngleChangeTime);

        if (ran > CHANGE_DIR_TIME_MAX) {
          var angle = Math.random() * (3.141 / 3) - 3.141 / 6;
          var matrix = gl.mat2.create();
          gl.mat2.rotate(matrix, matrix, angle);
          gl.vec2.transformMat2(this.options.velocity, this.options.velocity, matrix);
          this.options.lastAngleChangeTime = demo.lastTime;
        }

        this.options.heatCurrent += Math.random();
        this.options.life -= demo.elapsed;

        var nextPos = gl.vec2.scaleAndAdd(gl.vec2.create(), this.position, this.options.velocity, demo.elapsed);
        this.next(nextPos);

        if (this.options.life < 0 || nextPos.y > HEIGHT + 50 || nextPos.x < -50 || nextPos.y < -50 || nextPos.x > WIDTH + 50) {
          this.reset();
        }
      }
    }, {
      key: 'onMouseMoveHandler',
      value: function onMouseMoveHandler(event) {
        var rect = this.canvas.getBoundingClientRect();
        var scale = WIDTH / this.state.canvasTargetWidth;

        this.sparkSource = gl.vec2.fromValues((event.clientX - rect.left) * scale, (event.clientY - rect.top) * scale);
      }
    }, {
      key: 'onTouchMoveHandler',
      value: function onTouchMoveHandler(event) {
        event.preventDefault();

        var rect = this.canvas.getBoundingClientRect();
        var scale = WIDTH / this.state.canvasTargetWidth;

        this.sparkSource = gl.vec2.fromValues((event.touches[0].clientX - rect.left) * scale, (event.touches[0].clientY - rect.top) * scale);
      }
    }]);

    return Embers;
  })(ComponentBase);

  return Embers;
});
//# sourceMappingURL=Embers.js.map