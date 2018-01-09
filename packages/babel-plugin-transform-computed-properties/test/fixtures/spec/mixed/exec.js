var heh = "heh";
var noo = "noo";
var foo = "foo";

var obj = {
  ["x" + heh]: "heh",
  ["y" + noo]: "noo",
  [foo]: "foo1",
  foo: "foo2",
  bar: "bar",
};

assert.deepEqual(obj, {
  xheh: "heh",
  ynoo: "noo",
  foo: "foo2",
  bar: "bar",
});
