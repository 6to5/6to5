var _priv = /*#__PURE__*/new WeakSet(),
    _priv2 = /*#__PURE__*/new WeakSet();

class A {
  constructor() {
    _priv.add(this);

    _priv2.add(this);
  }

  test1() {
    [babelHelpers.classInstancePrivateAccessorDestructureSet2(this, _priv, _set_priv)._] = [3];
  }

  test2() {
    [babelHelpers.readOnlyError("#priv2")._] = [3];
  }

}

function _set_priv(_) {}

function _get_priv() {}
