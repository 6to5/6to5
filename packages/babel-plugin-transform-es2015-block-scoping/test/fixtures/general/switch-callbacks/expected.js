var _ref = function () {
  switch (true) {
    default:
      var foo = 4;
      if (true) {
        var bar = function () {
          return foo;
        };
        console.log(bar());
      }
  }
};

function fn() {
  while (true) {
    _ref();
  }
}