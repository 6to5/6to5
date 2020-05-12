module.exports = function myConfig() {
  g();
};

function f() {
  throw new Error("Error inside config!");
}

function g() {
  f();
}
