let p;

let a = function () {
  var _ret;

  while (p = p.parentPath) {
    if (a) {
      _ret = 'a';
    } else {
      _ret = 'b';
    }
  }

  return _ret;
}();