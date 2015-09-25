var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.Embers = factory();
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
    function ComponentBase(canvas, options, id) {
      _classCallCheck(this, ComponentBase);

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      this.options = options || {};

      this.lastTime = 0;

      this.canvasTargetWidth = this.width = this.options.width || DEFAULT_WIDTH;
      this.canvasTargetHeight = this.height = this.options.width || DEFAULT_HEIGHT;

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

  function _ran(min, max) {
    return Math.random() * (max - min) + min;
  };

  function ranItem(arr) {
    return arr[Math.floor(_ran(0, arr.length - 0.000001))];
  };

  var Sides = {
    LEFT: 1,
    TOP: 2,
    RIGHT: 3,
    BOTTOM: 4,
    ran: function ran() {
      return Math.floor(_ran(1, 4.99));
    }
  };

  function isAbove(p1, p2) {
    return p1.y < p2.y;
  }
  function isBelow(p1, p2) {
    return p1.y > p2.y;
  }
  function isLeft(p1, p2) {
    return p1.x < p2.x;
  }
  function isRight(p1, p2) {
    return p1.x > p2.x;
  }
  function reverseOf(dir) {
    return (dir - 1 + 2) % 4 + 1;
  } // Opposite of LEFT (1) is RIGHT (3) etc.
  function toward(p1, p2) {
    var dir = [];
    if (isAbove(p1, p2)) dir.push(4);
    if (isBelow(p1, p2)) dir.push(2);
    if (isLeft(p1, p2)) dir.push(3);
    if (isRight(p1, p2)) dir.push(1);
    return dir;
  }

  function vecFor(side) {
    if (side == Sides.LEFT) return new paper.Point(-1, 0);
    if (side == Sides.RIGHT) return new paper.Point(1, 0);
    if (side == Sides.TOP) return new paper.Point(0, -1);
    if (side == Sides.BOTTOM) return new paper.Point(0, 1);
  }

  function getRandomPointFor(side, bounds) {
    var x = 0;
    x = side == Sides.RIGHT ? bounds.right : x;
    x = side == Sides.TOP || side == Sides.BOTTOM ? _ran(0, bounds.right) : x;

    var y = 0;
    y = side == Sides.BOTTOM ? bounds.bottom : y;
    y = side == Sides.LEFT || side == Sides.RIGHT ? _ran(0, bounds.bottom) : y;

    return new paper.Point(x, y);
  }

  function hsvToRgb(h, s, v) {
    var i;
    var f;
    var p;
    var q;
    var t;
    var r;
    var g;
    var b;
    if (s == 0) {
      // achromatic (grey)
      r = g = b = v;
    } else {
      h /= 60; // sector 0 to 5
      i = Math.floor(h);
      f = h - i; // factorial part of h
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        default:
          r = v;
          g = p;
          b = q;
          break;
      }
    }

    return {
      r: r,
      g: g,
      b: b
    };
  }

  var util = {
    ran: _ran,
    ranItem: ranItem,
    Sides: Sides,
    isAbove: isAbove,
    isBelow: isBelow,
    isLeft: isLeft,
    isRight: isRight,
    reverseOf: reverseOf,
    toward: toward,
    vecFor: vecFor,
    hsvToRgb: hsvToRgb,
    getRandomPointFor: getRandomPointFor
  };

  /*============================================
   * Constants
   *============================================*/
  var SPARK_COUNT = 25; // Maximum number of sparks to display simultaneously
  var SPARK_MAX_SIZE = 2;
  var SPARK_MIN_SIZE = 0.5;
  var SPARK_MAX_VELOCITY = 70;
  var SPARK_MIN_VELOCITY = 20;
  var WIDTH = 800; // Width of canvas
  var HEIGHT = 800 / 1.61; // Height of canvas,
  var SPARK_SOURCE_RADIUS = 50; // Spark source radius in pixels
  var CHANGE_DIR_TIME_MAX = 5000; // The maximum time to wait between changing directions

  /*============================================
   * The demo JSX component
   *============================================*/

  var Embers = (function (_ComponentBase) {
    _inherits(Embers, _ComponentBase);

    function Embers(canvas, options) {
      _classCallCheck(this, Embers);

      _get(Object.getPrototypeOf(Embers.prototype), 'constructor', this).call(this, canvas, options);

      this.options.sparkCount = this.options.sparkCount || SPARK_COUNT;
      this.options.maxSparkSize = this.options.maxSparkSize || SPARK_MAX_SIZE;
      this.options.minSparkSize = this.options.minSparkSize || SPARK_MIN_SIZE;
      this.options.maxSparkVelocity = this.options.maxSparkVelocity || SPARK_MAX_VELOCITY;
      this.options.minSparkVelocity = this.options.minSparkVelocity || SPARK_MIN_VELOCITY;
      this.options.sparkCount = this.options.sparkCount || SPARK_COUNT;

      this.hue = 0;

      this.sparkSource = new vec2.fromValues(WIDTH / 2, HEIGHT / 5);

      this.sparks = [];

      for (var i = 0; i < this.options.sparkCount; i++) {
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

        var rgb = util.hsvToRgb(spark.options.color.h, spark.options.color.s, spark.options.color.l);

        context.strokeStyle = 'rgba(' + ~ ~(rgb.r * 256) + ',' + ~ ~(rgb.g * 256) + ',' + ~ ~rgb.b * 256 + ',' + ratio + ')';
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

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        var life = Math.random() * 8 + 2;

        spark.spark({
          type: 2,
          size: Math.random() * (this.options.maxSparkSize - this.options.minSparkSize) + this.options.minSparkSize,
          color: {
            h: Math.random() * 25 + 25,
            s: Math.random() * 0.2 + 0.8,
            l: 1
          },
          position: vec2.add(vec2.create(), this.sparkSource, vec2.fromValues(Math.cos(sourceAngle) * sourceDistance, Math.sin(sourceAngle) * sourceDistance)),
          velocity: vec2.scale(vec2.create(), vec2.fromValues(Math.cos(velAngle), Math.sin(velAngle)), Math.random() * (this.options.maxSparkVelocity - this.options.minSparkVelocity) + this.options.minSparkVelocity),
          heatCurrent: 0,
          lastAngleChangeTime: 0,
          glow: Math.random() * 0.8 + 0.2,
          flickerSpeed: Math.random(),
          life: life,
          lifeTotal: life
        });
      }

      // 'this' will be the Spark object itself.
    }, {
      key: 'sparkOnFrame',
      value: function sparkOnFrame(demo) {
        var ran = Math.random() * CHANGE_DIR_TIME_MAX + (demo.lastTime - this.options.lastAngleChangeTime);

        if (ran > CHANGE_DIR_TIME_MAX) {
          var angle = Math.random() * (3.141 / 3) - 3.141 / 6;
          var matrix = mat2.create();
          mat2.rotate(matrix, matrix, angle);
          vec2.transformMat2(this.options.velocity, this.options.velocity, matrix);
          this.options.lastAngleChangeTime = demo.lastTime;
        }

        this.options.heatCurrent += Math.random();
        this.options.life -= demo.elapsed;
        this.options.color.l = this.options.life / this.options.lifeTotal * this.options.glow;

        var nextPos = vec2.scaleAndAdd(vec2.create(), this.position, this.options.velocity, demo.elapsed);
        this.next(nextPos);

        if (this.options.life < 0 || nextPos.y > HEIGHT + 50 || nextPos.x < -50 || nextPos.y < -50 || nextPos.x > WIDTH + 50) {
          this.reset();
        }
      }
    }, {
      key: 'onMouseMoveHandler',
      value: function onMouseMoveHandler(event) {
        var rect = this.canvas.getBoundingClientRect();
        var scale = this.WIDTH / this.canvasTargetWidth;

        this.sparkSource = vec2.fromValues((event.clientX - rect.left) * scale, (event.clientY - rect.top) * scale);
      }
    }, {
      key: 'onTouchMoveHandler',
      value: function onTouchMoveHandler(event) {
        event.preventDefault();

        var rect = this.canvas.getBoundingClientRect();
        var scale = WIDTH / this.state.canvasTargetWidth;

        this.sparkSource = vec2.fromValues((event.touches[0].clientX - rect.left) * scale, (event.touches[0].clientY - rect.top) * scale);
      }
    }]);

    return Embers;
  })(ComponentBase);

  return Embers;
});
//# sourceMappingURL=Embers.js.map