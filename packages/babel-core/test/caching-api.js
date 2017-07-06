import assert from "assert";
import { makeStrongCache } from "../lib/config/caching";

describe("caching API", () => {
  it("should allow permacaching with .forever()", () => {
    let count = 0;

    const fn = makeStrongCache((arg, cache) => {
      cache.forever();
      return { arg, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", count: 1 });
    assert.equal(fn("two"), fn("two"));

    assert.notEqual(fn("one"), fn("two"));
  });

  it("should allow permacaching with cache(true)", () => {
    let count = 0;

    const fn = makeStrongCache((arg, cache) => {
      cache(true);
      return { arg, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", count: 1 });
    assert.equal(fn("two"), fn("two"));

    assert.notEqual(fn("one"), fn("two"));
  });

  it("should allow disabling caching with .never()", () => {
    let count = 0;

    const fn = makeStrongCache((arg, cache) => {
      cache.never();
      return { arg, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", count: 0 });
    assert.deepEqual(fn("one"), { arg: "one", count: 1 });
    assert.notEqual(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", count: 4 });
    assert.deepEqual(fn("two"), { arg: "two", count: 5 });
    assert.notEqual(fn("two"), fn("two"));

    assert.notEqual(fn("one"), fn("two"));
  });

  it("should allow disabling caching with cache(false)", () => {
    let count = 0;

    const fn = makeStrongCache((arg, cache) => {
      cache(false);
      return { arg, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", count: 0 });
    assert.deepEqual(fn("one"), { arg: "one", count: 1 });
    assert.notEqual(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", count: 4 });
    assert.deepEqual(fn("two"), { arg: "two", count: 5 });
    assert.notEqual(fn("two"), fn("two"));

    assert.notEqual(fn("one"), fn("two"));
  });

  it("should allow caching based on a value with .using(fn)", () => {
    let count = 0;
    let other = "default";

    const fn = makeStrongCache((arg, cache) => {
      const val = cache.using(() => other);

      return { arg, val, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 1 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 2 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 3 });
    assert.equal(fn("two"), fn("two"));

    other = "default";

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 1 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 2 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 3 });
    assert.equal(fn("two"), fn("two"));
  });

  it("should allow caching based on a value with cache(fn)", () => {
    let count = 0;
    let other = "default";

    const fn = makeStrongCache((arg, cache) => {
      const val = cache(() => other);

      return { arg, val, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 1 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 2 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 3 });
    assert.equal(fn("two"), fn("two"));

    other = "default";

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 1 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 2 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 3 });
    assert.equal(fn("two"), fn("two"));
  });

  it("should allow invalidation based on a value with .invalidate(fn)", () => {
    let count = 0;
    let other = "default";

    const fn = makeStrongCache((arg, cache) => {
      const val = cache.invalidate(() => other);

      return { arg, val, count: count++ };
    });

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 1 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 2 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 3 });
    assert.equal(fn("two"), fn("two"));

    other = "default";

    assert.deepEqual(fn("one"), { arg: "one", val: "default", count: 4 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "default", count: 5 });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), { arg: "one", val: "new", count: 6 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", val: "new", count: 7 });
    assert.equal(fn("two"), fn("two"));
  });

  it("should allow invalidation with .using and .invalidate", () => {
    let count = 0;
    let other = "default";
    let another = "another";

    const fn = makeStrongCache((arg, cache) => {
      const val = cache.using(() => other);
      const val2 = cache.invalidate(() => another);

      return { arg, val, val2, count: count++ };
    });

    assert.deepEqual(fn("one"), {
      arg: "one",
      val: "default",
      val2: "another",
      count: 0,
    });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), {
      arg: "two",
      val: "default",
      val2: "another",
      count: 1,
    });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), {
      arg: "one",
      val: "new",
      val2: "another",
      count: 2,
    });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), {
      arg: "two",
      val: "new",
      val2: "another",
      count: 3,
    });
    assert.equal(fn("two"), fn("two"));

    other = "default";

    assert.deepEqual(fn("one"), {
      arg: "one",
      val: "default",
      val2: "another",
      count: 4,
    });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), {
      arg: "two",
      val: "default",
      val2: "another",
      count: 5,
    });
    assert.equal(fn("two"), fn("two"));

    other = "new";

    assert.deepEqual(fn("one"), {
      arg: "one",
      val: "new",
      val2: "another",
      count: 6,
    });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), {
      arg: "two",
      val: "new",
      val2: "another",
      count: 7,
    });
    assert.equal(fn("two"), fn("two"));

    another = "second";

    assert.deepEqual(fn("one"), {
      arg: "one",
      val: "new",
      val2: "second",
      count: 8,
    });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), {
      arg: "two",
      val: "new",
      val2: "second",
      count: 9,
    });
    assert.equal(fn("two"), fn("two"));
  });

  it("should throw if caching is never configured and not defaulting", () => {
    const fn = makeStrongCache(() => {}, false /* autoPermacache */);

    assert.throws(() => fn(), /Error: Caching was left unconfigured./);
  });

  it("should auto-permacache by default", () => {
    let count = 0;

    const fn = makeStrongCache(arg => ({ arg, count: count++ }));

    assert.deepEqual(fn("one"), { arg: "one", count: 0 });
    assert.equal(fn("one"), fn("one"));

    assert.deepEqual(fn("two"), { arg: "two", count: 1 });
    assert.equal(fn("two"), fn("two"));

    assert.notEqual(fn("one"), fn("two"));
  });

  it("should throw if you set permacaching and use .using", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.forever();

      cache.using(() => null);
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you set permacaching and use .invalidate", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.forever();

      cache.invalidate(() => null);
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you set permacaching and use .never", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.forever();

      cache.never();
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you set no caching and use .using", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.never();

      cache.using(() => null);
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you set no caching and use .invalidate", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.never();

      cache.invalidate(() => null);
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you set no caching and use .never", () => {
    const fn = makeStrongCache((arg, cache) => {
      cache.never();

      cache.using(() => null);
    });

    assert.throws(() => fn(), /Caching has already been configured/);
  });

  it("should throw if you configure .forever after exiting", () => {
    const fn = makeStrongCache((arg, cache) => cache);

    assert.throws(
      () => fn().forever(),
      /Cannot change caching after evaluation/,
    );
  });

  it("should throw if you configure .never after exiting", () => {
    const fn = makeStrongCache((arg, cache) => cache);

    assert.throws(() => fn().never(), /Cannot change caching after evaluation/);
  });

  it("should throw if you configure .using after exiting", () => {
    const fn = makeStrongCache((arg, cache) => cache);

    assert.throws(
      () => fn().using(() => null),
      /Cannot change caching after evaluation/,
    );
  });

  it("should throw if you configure .invalidate after exiting", () => {
    const fn = makeStrongCache((arg, cache) => cache);

    assert.throws(
      () => fn().invalidate(() => null),
      /Cannot change caching after evaluation/,
    );
  });
});
