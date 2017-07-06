System.register(["./evens"], function (_export, _context) {
  "use strict";

  var isEven, p, a, i, j, isOdd;

  function nextOdd(n) {
    return _export("p", p = isEven(n) ? n + 1 : n + 2);
  }

  _export("nextOdd", nextOdd);

  return {
    setters: [function (_evens) {
      isEven = _evens.isEven;
    }],
    execute: function () {
      _export("p", p = 5);

      _export("p", p);

      for (a in b);

      for (i = 0, j = 0;;);

      _export("isOdd", isOdd = function (isEven) {
        return function (n) {
          return !isEven(n);
        };
      }(isEven));

      _export("isOdd", isOdd);
    }
  };
});