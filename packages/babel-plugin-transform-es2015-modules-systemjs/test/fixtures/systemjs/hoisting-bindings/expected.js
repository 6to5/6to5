System.register([], function (_export, _context) {
  "use strict";

  var c;

  function a() {
    alert("a");
    _export("c", c + 1), c++;
  }

  _export("a", a);

  function b() {
    a();
  }

  return {
    setters: [],
    execute: function () {
      _export("c", c = 5);

      _export("c", c);

      b();
    }
  };
});