import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";

function getPath(code) {
  const ast = parse(code);
  let path;
  traverse(ast, {
    Program: function(_path) {
      path = _path;
      _path.stop();
    },
  });
  return path;
}

function getIdentifierPath(code) {
  const ast = parse(code);
  let nodePath;
  traverse(ast, {
    Identifier: function(path) {
      nodePath = path;
      path.stop();
    },
  });

  return nodePath;
}

describe("scope", function() {
  describe("binding paths", function() {
    it("function declaration id", function() {
      assert.ok(
        getPath("function foo() {}").scope.getBinding("foo").path.type ===
          "FunctionDeclaration",
      );
    });

    it("function expression id", function() {
      assert.ok(
        getPath("(function foo() {})")
          .get("body")[0]
          .get("expression")
          .scope.getBinding("foo").path.type === "FunctionExpression",
      );
    });

    it("function param", function() {
      assert.ok(
        getPath("(function (foo) {})")
          .get("body")[0]
          .get("expression")
          .scope.getBinding("foo").path.type === "Identifier",
      );
    });

    it("variable declaration", function() {
      assert.ok(
        getPath("var foo = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var { foo } = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var [ foo ] = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var { bar: [ foo ] } = null;").scope.getBinding("foo").path
          .type === "VariableDeclarator",
      );
    });

    it("purity", function() {
      assert.ok(
        getPath("({ x: 1 })").get("body")[0].get("expression").isPure(),
      );
    });

    test("label", function() {
      assert.strictEqual(
        getPath("foo: { }").scope.getBinding("foo"),
        undefined,
      );
      assert.strictEqual(
        getPath("foo: { }").scope.getLabel("foo").type,
        "LabeledStatement",
      );
      assert.strictEqual(
        getPath("foo: { }").scope.getLabel("toString"),
        undefined,
      );

      assert.strictEqual(
        getPath(
          `
        foo: { }
      `,
        ).scope.generateUid("foo"),
        "_foo",
      );
    });

    test("generateUid collision check with labels", function() {
      assert.strictEqual(
        getPath(
          `
        _foo: { }
      `,
        ).scope.generateUid("foo"),
        "_foo2",
      );

      assert.strictEqual(
        getPath(
          `
        _foo: { }
        _foo1: { }
        _foo2: { }
      `,
        ).scope.generateUid("foo"),
        "_foo3",
      );
    });

    it("reference paths", function() {
      const path = getIdentifierPath("function square(n) { return n * n}");
      const referencePaths = path.context.scope.bindings.n.referencePaths;
      assert.equal(referencePaths.length, 2);
      assert.deepEqual(referencePaths[0].node.loc.start, {
        line: 1,
        column: 28,
      });
      assert.deepEqual(referencePaths[1].node.loc.start, {
        line: 1,
        column: 32,
      });
    });
  });
});
