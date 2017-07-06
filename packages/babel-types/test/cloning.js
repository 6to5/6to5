import * as t from "../lib";
import assert from "assert";
import { parse } from "babylon";

suite("cloning", function() {
  suite("clone", function() {
    it("should handle undefined", function() {
      const node = undefined;
      const cloned = t.clone(node);
      assert(cloned === undefined);
    });

    it("should handle null", function() {
      const node = null;
      const cloned = t.clone(node);
      assert(cloned === null);
    });

    it("should handle simple cases", function() {
      const node = t.arrayExpression([null, t.identifier("a")]);
      const cloned = t.clone(node);
      assert(node !== cloned);
      assert(t.isNodesEquivalent(node, cloned) === true);
    });
  });

  suite("cloneDeep", function() {
    it("should handle undefined", function() {
      const node = undefined;
      const cloned = t.cloneDeep(node);
      assert(cloned === undefined);
    });

    it("should handle null", function() {
      const node = null;
      const cloned = t.cloneDeep(node);
      assert(cloned === null);
    });

    it("should handle simple cases", function() {
      const node = t.arrayExpression([null, t.identifier("a")]);
      const cloned = t.cloneDeep(node);
      assert(node !== cloned);
      assert(t.isNodesEquivalent(node, cloned) === true);
    });

    it("should handle full programs", function() {
      const node = parse("1 + 1");
      const cloned = t.cloneDeep(node);
      assert(node !== cloned);
      assert(t.isNodesEquivalent(node, cloned) === true);
    });

    it("should handle complex programs", function() {
      const program = "'use strict'; function lol() { wow();return 1; }";
      const node = parse(program);
      const cloned = t.cloneDeep(node);
      assert(node !== cloned);
      assert(t.isNodesEquivalent(node, cloned) === true);
    });

    it("should handle missing array element", function() {
      const node = parse("[,0]");
      const cloned = t.cloneDeep(node);
      assert(node !== cloned);
      assert(t.isNodesEquivalent(node, cloned) === true);
    });
  });
});
