class A {
  static get a() {
    return 1;
  }

}

var _getA = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getA"),
    _getB = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("getB");

class B extends A {
  static get b() {
    return 2;
  }

  static extract() {
    return [babelHelpers.classPrivateFieldLooseBase(this, _getA)[_getA], babelHelpers.classPrivateFieldLooseBase(this, _getB)[_getB]];
  }

}

Object.defineProperty(B, _getA, {
  value: _getA2
})
Object.defineProperty(B, _getB, {
  value: _getB2
})

function _getA2() {
  return babelHelpers.get(babelHelpers.getPrototypeOf(B), "a", this);
}

function _getB2() {
  return this.b;
}

const [getA, getB] = B.extract();
