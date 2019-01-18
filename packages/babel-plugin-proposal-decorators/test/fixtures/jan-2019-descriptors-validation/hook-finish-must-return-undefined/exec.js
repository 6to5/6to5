function pushElement(e) {
  return function (c) { c.elements.push(e); return c };
}

expect(() => {
  @pushElement({
    kind: "hook",
    placement: "static",
    finish() {
      return 2;
    }
  })
  class A {}

  new A();
}).toThrow(TypeError);
