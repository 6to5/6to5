g();

module.exports = function myConfig() {
};

function f() {
  throw new Error("Error inside config!");
}

function g() {
  f();
}
