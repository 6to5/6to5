foo.func1 = function () {
  if (cond1) {
    for (;;) {
      if (cond2) {
        var _ret = function () {
          function func2() {}

          function func3() {}

          func4(function () {
            func2();
          });
          return "break";
        }();

        if (_ret === "break") break;
      }
    }
  }
};