class A {
  static test1() {
    [babelHelpers.classStaticPrivateAccessorDestructureSet2(this, A, _set_priv)._] = [3];
  }

  static test2() {
    [babelHelpers.readOnlyError("#priv2")._] = [3];
  }

}

function _set_priv(_) {}

function _get_priv() {}
