var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _foo = _classPrivateFieldLooseKey("foo");

class A {
  constructor() {
    Object.defineProperty(this, _foo, {
      value: _foo2
    });
    this.x = 2;
  }

}

var _foo2 = function _foo2() {};
