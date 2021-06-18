var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo");

class Cl {
  constructor() {
    Object.defineProperty(this, _foo, {
      value: _foo2
    });
  }

  test() {
    return babelHelpers.classPrivateFieldLooseBase(this, _foo)[_foo]();
  }

}

async function _foo2() {
  return 2;
}
