var x = function (foo) {
  for (var _len = arguments.length, bar = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    bar[_key - 1] = arguments[_key];
  }

  console.log(bar);
};

var y = function (foo) {
  var x = function z(bar) {
    bar[1] = 5;
  };
};

var b = function (x, y) {
  for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
    args[_key2 - 2] = arguments[_key2];
  }

  console.log(args[0]);
  args.pop();
  console.log(args[1]);
};

var z = function (foo) {
  for (var _len3 = arguments.length, bar = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    bar[_key3 - 1] = arguments[_key3];
  }

  var x = function () {
    bar[1] = 5;
  };
};

var a = function (foo) {
  for (var _len4 = arguments.length, bar = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    bar[_key4 - 1] = arguments[_key4];
  }

  return bar.join(",");
};

var b = function (foo) {
  var join = "join";

  for (var _len5 = arguments.length, bar = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    bar[_key5 - 1] = arguments[_key5];
  }

  return bar[join];
};

var b = function () {
  for (var _len6 = arguments.length, bar = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    bar[_key6] = arguments[_key6];
  }

  return bar.len;
};

var b = function (foo) {
  return (arguments.length <= 1 ? 0 : arguments.length - 1) * 2;
};

var b = function (foo, baz) {
  return arguments.length <= 2 ? 0 : arguments.length - 2;
};

function x() {
  for (var _len7 = arguments.length, rest = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    rest[_key7] = arguments[_key7];
  }

  rest[0] = 0;
}

function swap() {
  for (var _len8 = arguments.length, rest = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    rest[_key8] = arguments[_key8];
  }

  var _ref = [rest[1], rest[0]];
  rest[0] = _ref[0];
  rest[1] = _ref[1];
}

function forIn() {
  for (var _len9 = arguments.length, rest = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    rest[_key9] = arguments[_key9];
  }

  for (rest[0] in this) {
    foo(rest[0]);
  }
}

function inc() {
  for (var _len10 = arguments.length, rest = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    rest[_key10] = arguments[_key10];
  }

  ++rest[0];
}

function dec() {
  for (var _len11 = arguments.length, rest = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    rest[_key11] = arguments[_key11];
  }

  --rest[0];
}

function del() {
  for (var _len12 = arguments.length, rest = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
    rest[_key12] = arguments[_key12];
  }

  delete rest[0];
}

function method() {
  for (var _len13 = arguments.length, rest = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
    rest[_key13] = arguments[_key13];
  }

  rest[0]();
}

function newExp() {
  for (var _len14 = arguments.length, rest = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
    rest[_key14] = arguments[_key14];
  }

  new rest[0]();
} // In addition to swap() above because at some point someone tried checking
// grandparent path for isArrayExpression() to deopt.


function arrayDestructure() {
  for (var _len15 = arguments.length, rest = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
    rest[_key15] = arguments[_key15];
  }

  var _x = babelHelpers.slicedToArray(x, 1);

  rest[0] = _x[0];
}

function forOf() {
  for (var _len16 = arguments.length, rest = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
    rest[_key16] = arguments[_key16];
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      rest[0] = _step.value;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function postfixIncrement() {
  for (var _len17 = arguments.length, rest = Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
    rest[_key17] = arguments[_key17];
  }

  rest[0]++;
}

function postfixDecrement() {
  for (var _len18 = arguments.length, rest = Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
    rest[_key18] = arguments[_key18];
  }

  rest[0]--;
}