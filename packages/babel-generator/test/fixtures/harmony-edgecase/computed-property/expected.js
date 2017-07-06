var object1 = {
  get [Symbol.create]() {},

  set [set()](value) {}

};
var object2 = {
  *[generator()]() {}

};
var object3 = {
  *[generator()]() {}

};
var object4 = {
  [Symbol.xxx]: "hello",
  [ok()]: 42
};