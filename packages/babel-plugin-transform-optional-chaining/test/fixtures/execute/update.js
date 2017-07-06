"use strict";

const obj = {
  a: {
    b: 0,
  },
};

obj?.a.b++;
assert.equal(obj.a.b, 1);

obj?.a?.b++;
assert.equal(obj.a.b, 2);

obj?.b?.b++;
assert.equal(obj.b, undefined);
