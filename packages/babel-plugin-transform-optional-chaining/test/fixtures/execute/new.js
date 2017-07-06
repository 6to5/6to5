"use strict";

let calls = 0;
const obj = {
  a: {
    b: class {
      constructor(val) {
        assert.equal(val, 1);
        assert(this instanceof obj.a.b);
        calls++;
      }
    },
  },
  c: class {
    constructor(val) {
      assert.equal(val, 1);
      assert(this instanceof obj.c);
      calls++;
    }
  },
};

let ab = new obj?.a?.b(1);
assert(ab instanceof obj.a.b);

ab = new obj?.a.b(1);
assert(ab instanceof obj.a.b);

ab = new obj?.a?.b?.(1);
assert(ab instanceof obj.a.b);

ab = new obj?.a.b?.(1);
assert(ab instanceof obj.a.b);

ab = new obj?.b?.b(1);
assert.equal(ab, undefined);

ab = new obj?.b?.b?.(1);
assert.equal(ab, undefined);

let c = new obj?.c(1);
assert(c instanceof obj.c);

c = new obj?.c?.(1);
assert(c instanceof obj.c);

c = new obj?.d?.(1);
assert.equal(c, undefined);

new obj?.a.b(1);
assert.equal(calls, 7);

new obj?.a?.b(1);
assert.equal(calls, 8);

new obj?.a?.b?.(1);
assert.equal(calls, 9);

new obj?.a.b?.(1);
assert.equal(calls, 10);

new obj?.c?.(1);
assert.equal(calls, 11);

new obj?.b?.b(1);
new obj?.b?.b?.(1);
new obj?.d?.(1);
