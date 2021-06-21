var _g = /*#__PURE__*/new WeakSet();

class C {
  constructor() {
    _g.add(this);
  }

}

async function* _g2() {
  await 1;
  yield 2;
  return 3;
}
