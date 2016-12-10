"use strict";

const assert = require("assert");
const helpers = require("./spec-test-helpers");

describe("spec export", function () {
  const runner = new helpers.Runner();

  describe("basic shape", function () {
    const exports = runner.transformAndRun("export {}");

    it("is frozen", function () {
      assert(Object.isFrozen(exports));
    });

    it("has a null prototype", function () {
      assert.strictEqual(Object.getPrototypeOf(exports), null);
    });

    it("is tagged as Module", function () {
      if (typeof Symbol === "function" && Symbol.toStringTag) {
        assert.strictEqual(exports[Symbol.toStringTag], "Module");
      } else {
        this.skip();
      }
    });

    it("has the __esModule flag", function () {
      assert.deepStrictEqual(
        Object.getOwnPropertyDescriptor(exports, "__esModule"),
        { value: true, configurable: false, writable: false, enumerable: false }
      );
    });

    it("has no exports", function () {
      assert.deepStrictEqual(Object.keys(exports), []);
    });
  });

  describe("default export", function () {
    describe("of single value", function () {
      const exports = runner.transformAndRun("const foo = 'foo';\nexport default foo");

      it("has no exports other than 'default'", function () {
        assert.deepStrictEqual(Object.keys(exports), ["default"]);
      });

      it("has the correct value", function () {
        assert.strictEqual(exports.default, "foo");
      });
    });

    describe("of anonymous function", function () {
      const exports = runner.transformAndRun("export default function () {}");

      it("has Function.name of 'default'", function () {
        assert.strictEqual(exports.default.name, "default");
      });
    });

    describe("of anonymous class", function () {
      const exports = runner.transformAndRun("export default class {}");

      it("has Function.name of 'default'", function () {
        assert.strictEqual(exports.default.name, "default");
      });
    });
  });

  describe("named export", function () {
    describe("of single value declaration", function () {
      const exports = runner.transformAndRun("export const a = 'a'");

      it("has no exports other than 'a'", function () {
        assert.deepStrictEqual(Object.keys(exports), ["a"]);
      });

      it("has the correct value", function () {
        assert.strictEqual(exports.a, "a");
      });
    });

    describe("of multiple value declaration", function () {
      const exports = runner.transformAndRun("export const a = 'a', b = 'b'");

      it("has no exports other than 'a' and 'b'", function () {
        const keys = Object.keys(exports);
        assert.strictEqual(keys.length, 2);
        assert(keys.indexOf("a") >= 0);
        assert(keys.indexOf("b") >= 0);
      });

      it("has the correct values", function () {
        assert.strictEqual(exports.a, "a");
        assert.strictEqual(exports.b, "b");
      });
    });
  });

  describe("early errors", function () {
    // it turns out that babylon already throws for us, but test just to make sure
    it("throws when generating duplicate default exports", function () {
      assert.throws(function () {
        runner.transformAndRun("export default class {}\nexport default class {}");
      });
    });

    it("throws when generating duplicate default export via renaming", function () {
      assert.throws(function () {
        runner.transformAndRun("var foo\nexport default foo\nexport { foo as default }");
      });
    });

    it("throws when generating duplicate exports in the same specifier", function () {
      assert.throws(function () {
        runner.transformAndRun("export var foo, foo");
      });
    });

    it("throws when generating duplicate named exports in the same specifier", function () {
      assert.throws(function () {
        runner.transformAndRun("const foo = 'foo'\nexport { foo, foo }");
      });
    });

    it("throws when generating duplicate renamed exports", function () {
      assert.throws(function () {
        runner.transformAndRun("const foo = 'foo'\nconst bar = 'bar'\nexport { foo, bar as foo }");
      });
    });

    // babel extension; check for the flag used to distinguish
    // babel ES modules from regular commonjs modules
    it("throws when attempting to export __esModule", function () {
      assert.throws(function () {
        runner.transformAndRun("const __esModule = false\nexport { __esModule }");
      });
    });
  });
});
