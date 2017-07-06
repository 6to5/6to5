import cloneDeep from "lodash/cloneDeep";
import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";

describe("traverse", function() {
  const code = `
    var foo = "bar";
    this.test = "wow";
  `;
  const ast = parse(code);
  const program = ast.program;
  const body = program.body;

  it("traverse replace", function() {
    const replacement = {
      type: "StringLiteral",
      value: "foo",
    };
    const ast2 = cloneDeep(program);

    traverse(ast2, {
      enter: function(path) {
        if (path.node.type === "ThisExpression") path.replaceWith(replacement);
      },
    });

    assert.equal(ast2.body[1].expression.left.object, replacement);
  });

  it("traverse", function() {
    const expect = [
      body[0],
      body[0].declarations[0],
      body[0].declarations[0].id,
      body[0].declarations[0].init,
      body[1],
      body[1].expression,
      body[1].expression.left,
      body[1].expression.left.object,
      body[1].expression.left.property,
      body[1].expression.right,
    ];

    const actual = [];

    traverse(program, {
      enter: function(path) {
        actual.push(path.node);
      },
    });

    assert.deepEqual(actual, expect);
  });

  it("traverse falsy parent", function() {
    traverse(null, {
      enter: function() {
        throw new Error("should not be ran");
      },
    });
  });

  it("traverse blacklistTypes", function() {
    const expect = [
      body[0],
      body[0].declarations[0],
      body[0].declarations[0].id,
      body[0].declarations[0].init,
      body[1],
      body[1].expression,
      body[1].expression.right,
    ];

    const actual = [];

    traverse(program, {
      blacklist: ["MemberExpression"],
      enter: function(path) {
        actual.push(path.node);
      },
    });

    assert.deepEqual(actual, expect);
  });

  it("hasType", function() {
    assert.ok(traverse.hasType(ast, null, "ThisExpression"));
    assert.ok(
      !traverse.hasType(ast, null, "ThisExpression", ["AssignmentExpression"]),
    );

    assert.ok(traverse.hasType(ast, null, "ThisExpression"));
    assert.ok(traverse.hasType(ast, null, "Program"));

    assert.ok(
      !traverse.hasType(ast, null, "ThisExpression", ["MemberExpression"]),
    );
    assert.ok(!traverse.hasType(ast, null, "ThisExpression", ["Program"]));

    assert.ok(!traverse.hasType(ast, null, "ArrowFunctionExpression"));
  });

  it("clearCache", function() {
    const paths = [];
    const scopes = [];
    traverse(ast, {
      enter(path) {
        scopes.push(path.scope);
        paths.push(path);
        path.stop();
      },
    });

    traverse.cache.clear();

    const paths2 = [];
    const scopes2 = [];
    traverse(ast, {
      enter(path) {
        scopes2.push(path.scope);
        paths2.push(path);
        path.stop();
      },
    });

    scopes2.forEach(function(_, i) {
      assert.notStrictEqual(scopes[i], scopes2[i]);
      assert.notStrictEqual(paths[i], paths2[i]);
    });
  });

  it("clearPath", function() {
    const paths = [];
    traverse(ast, {
      enter(path) {
        paths.push(path);
      },
    });

    traverse.cache.clearPath();

    const paths2 = [];
    traverse(ast, {
      enter(path) {
        paths2.push(path);
      },
    });

    paths2.forEach(function(p, i) {
      assert.notStrictEqual(p, paths[i]);
    });
  });

  it("clearScope", function() {
    const scopes = [];
    traverse(ast, {
      enter(path) {
        scopes.push(path.scope);
        path.stop();
      },
    });

    traverse.cache.clearScope();

    const scopes2 = [];
    traverse(ast, {
      enter(path) {
        scopes2.push(path.scope);
        path.stop();
      },
    });

    scopes2.forEach(function(p, i) {
      assert.notStrictEqual(p, scopes[i]);
    });
  });
});
