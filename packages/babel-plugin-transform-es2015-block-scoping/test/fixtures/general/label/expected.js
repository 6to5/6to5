var x = void 0,
    y = void 0;
{
  a: var _x = void 0;

  var _y = void 0;
}

switch (0) {
  case 0:
    a: var _x2 = 0;

} // it should break from inside of switch statements using labels


var _loop = function () {
  var z = 3; // force loop function

  (function () {
    return z;
  });

  switch (true) {
    case true:
      return "break|loop";
  }
};

loop: for (var i = 0; i < 10; i++) {
  var _ret = _loop();

  if (_ret === "break|loop") break loop;
}