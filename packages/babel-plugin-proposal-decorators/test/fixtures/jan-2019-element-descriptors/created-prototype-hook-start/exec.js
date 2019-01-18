function pushElement(e) {
  return function (c) { c.elements.push(e); return c };
}

var self;

@pushElement({
  kind: "hook",
  placement: "prototype",
  start() {
    self = this;
  }
})
class A {}

expect(self).toBe(A.prototype);
expect(A.prototype).not.toHaveProperty("undefined");
