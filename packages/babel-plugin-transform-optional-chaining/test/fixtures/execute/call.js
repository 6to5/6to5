"use strict";

let calls = 0;
const obj = {
  a: {
    b(val) {
      assert.equal(val, 1);
      assert.equal(this, obj.a);
      return calls++;
    },
  },
  c(val) {
    assert.equal(val, 1);
    assert.equal(this, obj);
    return calls++;
  },
};

let ab = obj?.a?.b(1);
assert.equal(ab, 0);

ab = obj?.a.b(1);
assert.equal(ab, 1);

ab = obj?.a?.b?.(1);
assert.equal(ab, 2);

ab = obj?.a.b?.(1);
assert.equal(ab, 3);

ab = obj?.b?.b(1);
assert.equal(ab, undefined);

ab = obj?.b?.b?.(1);
assert.equal(ab, undefined);

let c = obj?.c(1);
assert.equal(c, 4);

c = obj?.c?.(1);
assert.equal(c, 5);

c = obj?.d?.(1);
assert.equal(c, undefined);

obj?.a.b(1);
assert.equal(calls, 7);

obj?.a?.b(1);
assert.equal(calls, 8);

obj?.a?.b?.(1);
assert.equal(calls, 9);

obj?.a.b?.(1);
assert.equal(calls, 10);

obj?.c?.(1);
assert.equal(calls, 11);

obj?.b?.b(1);
obj?.b?.b?.(1);
obj?.d?.(1);
