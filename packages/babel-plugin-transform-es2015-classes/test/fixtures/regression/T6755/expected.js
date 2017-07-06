"use strict";

var Example = function () {
  function Example() {}

  Example.prototype.test1 = async function test1() {
    await Promise.resolve(2);
  };

  Example.prototype.test2 = regeneratorRuntime.mark(function test2() {
    return regeneratorRuntime.wrap(function test2$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return 3;

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, test2, this);
  });
  return Example;
}();
