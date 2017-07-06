var obj = {
  f: function f() {
    (function f() {
      console.log(f);
    })();
  },
  h: function (_h) {
    function h() {
      return _h.apply(this, arguments);
    }

    h.toString = function () {
      return _h.toString();
    };

    return h;
  }(function () {
    console.log(h);
  }),
  m: function m() {
    doSmth();
  }
};