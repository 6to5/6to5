var _priv = /*#__PURE__*/new WeakMap();

class A {
  pub1 = 1;
  pub2 = (_priv.set(this, 2), 3);
}
