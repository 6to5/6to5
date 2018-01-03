var _this = this;

var fooCalls = [];

var _jumpTable = (0,
/*#__PURE__*/
function jumpTable(name, arg) {
  babelHelpers.newArrowCheck(this, _this);

  if (_jumpTable[name]) {
    _jumpTable[name](arg);
  }
}.bind(this));

Object.assign(_jumpTable, {
  foo(arg) {
    fooCalls.push(arg);
  }

});

_jumpTable('foo', 'bar');

assert.strictEqual(fooCalls[0], 'bar');
