var foo = {};
var foo = {
  x,
  y
};
var foo = {
  x: x,
  y: y
};
var foo = {
  x: x,
  y: y
};
var foo = {
  ["bar"]: "foo",

  ["foo"]() {},

  foo() {},

  async foo() {},

  *foo() {},

  get foo() {},

  set foo(foo) {}

};