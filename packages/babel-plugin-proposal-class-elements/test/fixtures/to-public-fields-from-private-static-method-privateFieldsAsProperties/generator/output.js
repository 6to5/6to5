var _foo = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("foo");

class Cl {
  test() {
    return babelHelpers.classPrivateFieldLooseBase(Cl, _foo)[_foo]();
  }

}

Object.defineProperty(Cl, _foo, {
  value: _foo2
})

function* _foo2() {
  yield 2;
  return 3;
}
