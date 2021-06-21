class Base {
  superMethod() {
    return 'good';
  }

}

var _privateMethod = /*#__PURE__*/babelHelpers.classPrivateFieldLooseKey("privateMethod");

class Sub extends Base {
  constructor(...args) {
    super(...args);
    Object.defineProperty(this, _privateMethod, {
      value: _privateMethod2
    });
  }

  superMethod() {
    return 'bad';
  }

  publicMethod() {
    return babelHelpers.classPrivateFieldLooseBase(this, _privateMethod)[_privateMethod]();
  }

}

function _privateMethod2() {
  return babelHelpers.get(babelHelpers.getPrototypeOf(Sub.prototype), "superMethod", this).call(this);
}
