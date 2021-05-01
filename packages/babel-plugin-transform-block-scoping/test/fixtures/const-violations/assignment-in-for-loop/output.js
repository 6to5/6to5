function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

var array = [1, 2, 3];
console.log("this file runs");

for (var element of []) {
  var from = 50;
  _readOnlyError("from"), from--;
}
