var _priv = /*#__PURE__*/new WeakMap(),
    _priv2 = /*#__PURE__*/new WeakMap();

class A {
  pub1 = 1;
  pub2 = (_priv.set(this, 2), _priv2.set(this, 3), 4);
}
