var _foo = /*#__PURE__*/new WeakSet();

class Cl {
  constructor() {
    _foo.add(this);
  }

  test() {
    return babelHelpers.classPrivateMethodGet(this, _foo, _foo2).call(this);
  }

}

async function _foo2() {
  return 2;
}
