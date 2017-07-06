export var MyClass = function MyClass() {
  babelHelpers.classCallCheck(this, MyClass);
};
Object.defineProperty(MyClass, "property", {
  enumerable: true,
  writable: true,
  value: value
});

var MyClass2 = function MyClass2() {
  babelHelpers.classCallCheck(this, MyClass2);
};

Object.defineProperty(MyClass2, "property", {
  enumerable: true,
  writable: true,
  value: value
});
export { MyClass2 as default };