//
// These require toPropertyKey().
// If the call is missing, it's a hard error.
var _z = z,
    _fn = babelHelpers.toPropertyKey(fn()),
    x = _z[_fn],
    y = babelHelpers.objectWithoutProperties(_z, [_fn]);

var _z2 = z,
    _ref = babelHelpers.toPropertyKey(i + 1),
    x = _z2[_ref],
    y = babelHelpers.objectWithoutProperties(_z2, [_ref]);

var _z3 = z,
    _ref2 = babelHelpers.toPropertyKey("string" && maybeNotString),
    x = _z3[_ref2],
    y = babelHelpers.objectWithoutProperties(_z3, [_ref2]);

var _z4 = z,
    _ref3 = babelHelpers.toPropertyKey(maybeNotString || "string"),
    x = _z4[_ref3],
    y = babelHelpers.objectWithoutProperties(_z4, [_ref3]);

var _z5 = z,
    _ref4 = babelHelpers.toPropertyKey(t ? "string" : maybeNotString),
    x = _z5[_ref4],
    y = babelHelpers.objectWithoutProperties(_z5, [_ref4]);

var _z6 = z,
    _ref5 = babelHelpers.toPropertyKey(tag`can return anything`),
    x = _z6[_ref5],
    y = babelHelpers.objectWithoutProperties(_z6, [_ref5]); //
// These technically don't require toPropertyKey()
// but are pathological cases that our current evaluatesToString()
// heuristic does not identify. If someone improves the heuristic,
// please update the expected output of these accordingly.


var _z7 = z,
    _ref6 = babelHelpers.toPropertyKey(true && "string"),
    x = _z7[_ref6],
    y = babelHelpers.objectWithoutProperties(_z7, [_ref6]);

var _z8 = z,
    _ref7 = babelHelpers.toPropertyKey("" && irrelevant),
    x = _z8[_ref7],
    y = babelHelpers.objectWithoutProperties(_z8, [_ref7]);

var _z9 = z,
    _ref8 = babelHelpers.toPropertyKey(false || "string"),
    x = _z9[_ref8],
    y = babelHelpers.objectWithoutProperties(_z9, [_ref8]);

var _z10 = z,
    _ref9 = babelHelpers.toPropertyKey("string" || irrelevant),
    x = _z10[_ref9],
    y = babelHelpers.objectWithoutProperties(_z10, [_ref9]);

var _z11 = z,
    _ref10 = babelHelpers.toPropertyKey((irrelevant, "string")),
    x = _z11[_ref10],
    y = babelHelpers.objectWithoutProperties(_z11, [_ref10]); //
// These don't require toPropertyKey().
// If toPropertyKey() is emitted here, it's a soft error
// due to wrong heuristic guess - perhaps minor performance
// penalty, otherwise harmless.


var _obj = obj,
    _parrot = typeof parrot,
    ex = _obj[_parrot],
    rest = babelHelpers.objectWithoutProperties(_obj, [_parrot]);

var _obj2 = obj,
    _ref11 = "Norwegian" && "Blue",
    v = _obj2[_ref11],
    rest = babelHelpers.objectWithoutProperties(_obj2, [_ref11]);

var _obj3 = obj,
    _ref12 = "Pining for the fjords" || `Pushing up the daisies`,
    v = _obj3[_ref12],
    rest = babelHelpers.objectWithoutProperties(_obj3, [_ref12]);

var _obj4 = obj,
    _ref13 = "I`ve got a " + slug,
    v = _obj4[_ref13],
    rest = babelHelpers.objectWithoutProperties(_obj4, [_ref13]);

var _obj5 = obj,
    _ref14 = doesItTalk ? "Occasionally" : "Not really, no",
    v = _obj5[_ref14],
    rest = babelHelpers.objectWithoutProperties(_obj5, [_ref14]);

var _obj6 = obj,
    _ref15 = `Palindrome of ${town} would be ${palindrome(town)}`,
    v = _obj6[_ref15],
    rest = babelHelpers.objectWithoutProperties(_obj6, [_ref15]);
