function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _foo = new WeakSet();

class A {
  constructor() {
    _foo.add(this);

    _defineProperty(this, "x", 2);
  }

}

var _foo2 = function _foo2() {};
