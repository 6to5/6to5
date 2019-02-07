var Point =
/*#__PURE__*/
function () {
  "use strict";

  function Point(_x2 = 0, _y2 = 0) {
    var _this = this;

    babelHelpers.classCallCheck(this, Point);
    Object.defineProperty(_this, _x, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(_this, _y, {
      writable: true,
      value: void 0
    });
    babelHelpers.classPrivateFieldLooseBase(_this, _x)[_x] = +_x2;
    babelHelpers.classPrivateFieldLooseBase(_this, _y)[_y] = +_y2;
  }

  babelHelpers.createClass(Point, [{
    key: "equals",
    value: function equals(p) {
      return babelHelpers.classPrivateFieldLooseBase(this, _x)[_x] === babelHelpers.classPrivateFieldLooseBase(p, _x)[_x] && babelHelpers.classPrivateFieldLooseBase(this, _y)[_y] === babelHelpers.classPrivateFieldLooseBase(p, _y)[_y];
    }
  }, {
    key: "toString",
    value: function toString() {
      return `Point<${babelHelpers.classPrivateFieldLooseBase(this, _x)[_x]},${babelHelpers.classPrivateFieldLooseBase(this, _y)[_y]}>`;
    }
  }, {
    key: "x",
    get: function () {
      return babelHelpers.classPrivateFieldLooseBase(this, _x)[_x];
    },
    set: function (value) {
      babelHelpers.classPrivateFieldLooseBase(this, _x)[_x] = +value;
    }
  }, {
    key: "y",
    get: function () {
      return babelHelpers.classPrivateFieldLooseBase(this, _y)[_y];
    },
    set: function (value) {
      babelHelpers.classPrivateFieldLooseBase(this, _y)[_y] = +value;
    }
  }]);
  return Point;
}();

var _x = babelHelpers.classPrivateFieldLooseKey("x");

var _y = babelHelpers.classPrivateFieldLooseKey("y");
