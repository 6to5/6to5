var _obj$obj;

function fn() {}

var args = [1, 2, 3];
var obj = {
  obj: {
    fn
  }
};

switch (true) {
  case true:
    (_obj$obj = obj.obj).fn.apply(_obj$obj, args);

    break;
}