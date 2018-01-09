var _foo, _mutatorMap;

var k = Symbol();
var foo = (_foo = babelHelpers.defineProperty({}, Symbol.iterator, "foobar"), _mutatorMap = {}, _mutatorMap[k] = _mutatorMap[k] || {}, _mutatorMap[k].get = function () {
  return k;
}, babelHelpers.defineEnumerableProperties(_foo, _mutatorMap), _foo);
