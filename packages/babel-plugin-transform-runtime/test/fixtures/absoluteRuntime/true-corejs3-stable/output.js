var _regeneratorRuntime = require("<CWD>/packages/babel-runtime-corejs3/regenerator/index.js");

var _mapInstanceProperty = require("<CWD>/packages/babel-runtime-corejs3/core-js-stable/instance/map.js");

var _marked = /*#__PURE__*/_regeneratorRuntime.mark(makeIterator);

_mapInstanceProperty(Array);

function makeIterator() {
  return _regeneratorRuntime.wrap(function makeIterator$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 1;

        case 2:
          _context.next = 4;
          return 2;

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _marked);
}

var _iterator = babelHelpers.createForOfIteratorHelper(makeIterator()),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var itItem = _step.value;
    console.log(itItem);
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}
