var el = null;

class A {
  @(_ => el = _)
  static foo() {}
}

expect(el).toEqual(Object.defineProperty({
  kind: "method",
  key: "foo",
  placement: "static",
  enumerable: false,
  configurable: true,
  writable: true,
  method: A.foo,
}, Symbol.toStringTag, { value: "Descriptor" }));
