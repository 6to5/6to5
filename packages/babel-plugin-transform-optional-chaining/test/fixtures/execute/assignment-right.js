"use strict";

const obj = {
  a: {
    b: {
      c: {
        d: 2,
      },
    },
  },
};

const a = obj?.a;
assert.equal(a, obj.a);

const b = obj?.a?.b;
assert.equal(b, obj.a.b);

const bad = obj?.b?.b;
assert.equal(bad, undefined);

let val;
val = obj?.a?.b;
assert.equal(val, obj.a.b);

assert.throws(() => {
  const bad = obj?.b.b;
});
