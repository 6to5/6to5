var el = null;

class A {
  @(_ => el = _)
  foo() {}
}

expect(el).toEqual(Object.defineProperty({
  kind: "method",
  key: "foo",
  placement: "prototype",
  enumerable: false,
  configurable: true,
  writable: true,
  method: A.prototype.foo,
}, Symbol.toStringTag, { value: "Descriptor" }));
