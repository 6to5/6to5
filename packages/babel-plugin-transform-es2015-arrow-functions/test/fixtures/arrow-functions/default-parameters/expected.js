var some = function () {
  let count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "30";
  console.log("count", count);
};

var collect = function () {
  let since = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  let userid = arguments[1];
  console.log(userid);
};