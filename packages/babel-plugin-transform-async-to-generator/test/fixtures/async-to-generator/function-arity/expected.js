let one = (() => {
  var _ref = babelHelpers.asyncToGenerator(function* (a, b = 1) {});

  return function one(_x) {
    return _ref.apply(this, arguments);
  };
})();

let two = (() => {
  var _ref2 = babelHelpers.asyncToGenerator(function* (a, b, ...c) {});

  return function two(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

let three = (() => {
  var _ref3 = babelHelpers.asyncToGenerator(function* (a, b = 1, c, d = 3) {});

  return function three(_x4) {
    return _ref3.apply(this, arguments);
  };
})();

let four = (() => {
  var _ref4 = babelHelpers.asyncToGenerator(function* (a, b = 1, c, ...d) {});

  return function four(_x5) {
    return _ref4.apply(this, arguments);
  };
})();

let five = (() => {
  var _ref5 = babelHelpers.asyncToGenerator(function* (a, {
    b
  }) {});

  return function five(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

let six = (() => {
  var _ref6 = babelHelpers.asyncToGenerator(function* (a, {
    b
  } = {}) {});

  return function six(_x8) {
    return _ref6.apply(this, arguments);
  };
})();