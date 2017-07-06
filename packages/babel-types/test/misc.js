import * as t from "../lib";
import { assert } from "chai";
import { parse } from "babylon";

function parseCode(string) {
  return parse(string, {
    allowReturnOutsideFunction: true,
  }).program.body[0];
}

describe("misc helpers", function() {
  describe("matchesPattern", function() {
    it("matches explicitly", function() {
      const ast = parseCode("a.b.c.d").expression;
      assert(t.matchesPattern(ast, "a.b.c.d"));
      assert.isFalse(t.matchesPattern(ast, "a.b.c"));
      assert.isFalse(t.matchesPattern(ast, "b.c.d"));
      assert.isFalse(t.matchesPattern(ast, "a.b.c.d.e"));
    });

    it("matches partially", function() {
      const ast = parseCode("a.b.c.d").expression;
      assert(t.matchesPattern(ast, "a.b.c.d", true));
      assert(t.matchesPattern(ast, "a.b.c", true));
      assert.isFalse(t.matchesPattern(ast, "b.c.d", true));
      assert.isFalse(t.matchesPattern(ast, "a.b.c.d.e", true));
    });

    it("matches string literal expressions", function() {
      const ast = parseCode("a['b'].c.d").expression;
      assert(t.matchesPattern(ast, "a.b.c.d"));
      assert.isFalse(t.matchesPattern(ast, "a.b.c"));
      assert.isFalse(t.matchesPattern(ast, "b.c.d"));
      assert.isFalse(t.matchesPattern(ast, "a.b.c.d.e"));
    });

    it("matches string literal expressions partially", function() {
      const ast = parseCode("a['b'].c.d").expression;
      assert(t.matchesPattern(ast, "a.b.c.d", true));
      assert(t.matchesPattern(ast, "a.b.c", true));
      assert.isFalse(t.matchesPattern(ast, "b.c.d", true));
      assert.isFalse(t.matchesPattern(ast, "a.b.c.d.e", true));
    });
  });
});
