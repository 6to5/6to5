// ForXStatement
for (var _ref of []) {
  var {
    a
  } = _ref,
      b = babelHelpers.objectWithoutProperties(_ref, ["a"]);
}

for (var _ref2 of []) {
  var {
    a
  } = _ref2,
      b = babelHelpers.objectWithoutProperties(_ref2, ["a"]);
}

async function a() {
  for await (var _ref3 of []) {
    var {
      a
    } = _ref3,
        b = babelHelpers.objectWithoutProperties(_ref3, ["a"]);
  }
} // skip


for ({
  a
} in {}) {}

for ({
  a
} of []) {}

async function a() {
  for await ({
    a
  } of []) {}
}

for (a in {}) {}

for (a of []) {}

async function a() {
  for await (a of []) {}
}