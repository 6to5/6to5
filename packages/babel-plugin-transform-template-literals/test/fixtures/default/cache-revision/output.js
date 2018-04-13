var _templateObject = /*#__PURE__*/ _taggedTemplateLiteral(["some template"]),
    _templateObject2 = /*#__PURE__*/ _taggedTemplateLiteral(["some template"]);

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var tag = v => v;

function foo() {
  return tag(_templateObject);
}

function bar() {
  return tag(_templateObject2);
}

assert.equal(foo(), foo());
assert.equal(bar(), bar());
assert.notEqual(foo(), bar());
