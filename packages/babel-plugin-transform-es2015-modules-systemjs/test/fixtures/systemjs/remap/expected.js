System.register([], function (_export, _context) {
  "use strict";

  var test, a, b, d;
  return {
    setters: [],
    execute: function () {
      _export("test", test = 2);

      _export("test", test);

      _export("test", test = 5);

      _export("test", test + 1), test++;

      (function () {
        var test = 2;
        test = 3;
        test++;
      })();

      _export("a", a = 2);

      _export("a", a);

      _export("a", a = 3);

      _export("c", b = 2);

      _export("c", b);

      _export("c", b = 3);

      _export("f", _export("e", d = 3));

      _export("e", d);

      _export("f", d);

      _export("f", _export("e", d = 4));
    }
  };
});