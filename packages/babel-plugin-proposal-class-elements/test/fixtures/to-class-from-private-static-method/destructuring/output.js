class A {
  static test() {
    [babelHelpers.readOnlyError("#priv")._] = [3];
  }

}

function _priv() {}
