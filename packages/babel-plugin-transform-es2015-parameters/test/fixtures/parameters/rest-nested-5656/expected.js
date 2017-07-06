function a() {
  var foo = function () {
    return bar.apply(undefined, arguments);
  };

  foo.apply(undefined, arguments);
}

function b() {
  var foo = function () {
    return bar.apply(undefined, arguments);
  };

  foo.apply(undefined, arguments);
}

function c() {
  var foo = function () {
    return bar.apply(undefined, arguments);
  };

  foo([]);
}

function d(thing) {
  var foo = function () {
    return bar.apply(undefined, arguments);
  };

  {
    var _args = thing;
    foo(thing);
  }
}