"use strict";

const obj = {
  a: {
    b: 0,
  },
};

obj?.a.b = 1;
assert.equal(obj.a.b, 1);

obj?.a?.b = 2;
assert.equal(obj.a.b, 2);

obj?.b?.b = 3;
assert.equal(obj.b, undefined);
