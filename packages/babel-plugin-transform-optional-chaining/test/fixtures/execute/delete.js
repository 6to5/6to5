"use strict";

const obj = {
  a: {
    b: 0,
  },
};

let test = delete obj?.a?.b;
assert.equal(obj.a.b, undefined);
assert.equal(test, true);

test = delete obj?.a.b;
assert.equal(obj.a.b, undefined);
assert.equal(test, true);

test = delete obj?.b?.b;
assert.equal(obj.b, undefined);
assert.equal(test, undefined);

delete obj?.a;
assert.equal(obj.a, undefined);
