function foo() {
  var x = 5;
  console.log(x);
  {
    var _x = 7;
    setTimeout(function () {
      return _x;
    }, 0);
  }
}

function bar() {
  var x = 5;
  console.log(x);

  for (var i = 0; i < 7; i++) {
    {
      (function () {
        var x = i;
        setTimeout(function () {
          return x;
        }, 0);
      })();
    }
  }
}

function baz() {
  var x = 5;
  console.log(x);

  for (var i = 0; i < 7; i++) {
    var qux = function qux(y) {
      var x = y;
      setTimeout(function () {
        return x;
      }, 0);
    };

    qux(i);
  }
}