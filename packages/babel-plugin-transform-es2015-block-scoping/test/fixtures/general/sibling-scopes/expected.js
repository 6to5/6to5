var f1, f2;
{
  var z = 'z1 value';

  f1 = function () {
    return z;
  };
}
{
  var _z = 'z2 value';

  f2 = function () {
    return _z;
  };
}
f1();
f2();