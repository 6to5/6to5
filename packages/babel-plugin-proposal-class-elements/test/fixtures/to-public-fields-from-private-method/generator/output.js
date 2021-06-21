var _foo = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _foo.add(this);
  }

  test() {
    return babelHelpers.classPrivateMethodGet(this, _foo, _foo2).call(this);
  }

}

function* _foo2() {
  yield 2;
  return 3;
}
