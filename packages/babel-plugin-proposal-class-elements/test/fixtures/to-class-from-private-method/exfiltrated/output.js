let exfiltrated;

var _privateMethod = /*#__PURE__*/new WeakSet();

class Foo {
  constructor() {
    _privateMethod.add(this);

    if (exfiltrated === undefined) {
      exfiltrated = babelHelpers.classPrivateMethodGet(this, _privateMethod, _privateMethod2);
    }
  }

}

function _privateMethod2() {}
