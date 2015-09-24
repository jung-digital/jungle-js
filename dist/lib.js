var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.lib = factory();
})(this, function () {
  'use strict';

  var Lib = (function () {
    function Lib() {
      _classCallCheck(this, Lib);
    }

    _createClass(Lib, [{
      key: 'greet',
      value: function greet() {
        return 'hello';
      }
    }]);

    return Lib;
  })();

  var lib = new Lib();

  return lib;
});
//# sourceMappingURL=lib.js.map