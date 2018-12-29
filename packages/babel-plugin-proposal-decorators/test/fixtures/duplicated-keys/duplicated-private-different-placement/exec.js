function getPrivateName() {
  let pn;
  class C { @(({ key }) => { pn = key }) #x; }
  return pn;
}

expect(() => {
  @(desc => {
    const pn = getPrivateName();
    desc.elements = [{
      key: pn,
      kind: "field",
      placement: "own",
      descriptor: {},
    }, {
      key: pn,
      kind: "field",
      placement: "static",
      descriptor: {},
    }];
  })
  class A {}
}).not.toThrow();
