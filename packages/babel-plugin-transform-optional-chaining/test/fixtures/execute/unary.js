"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = +obj?.a?.b;
assert.equal(test, 0);

test = +obj?.a.b;
assert.equal(test, 0);

test = +obj?.b?.b;
assert.isNaN(test);

test = +obj?.b?.b;
assert.isNaN(test);
