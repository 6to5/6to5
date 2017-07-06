import * as t from "../lib";
import { assert } from "chai";
import { parse } from "babylon";
import generate from "babel-generator";

function parseCode(string) {
  return parse(string, {
    allowReturnOutsideFunction: true,
  }).program.body[0];
}
function generateCode(node) {
  return generate(node).code;
}

describe("converters", function() {
  it("toIdentifier", function() {
    assert.equal(t.toIdentifier("swag-lord"), "swagLord");
  });

  describe("valueToNode", function() {
    it("number", function() {
      assert.deepEqual(t.valueToNode(Math.PI), t.numericLiteral(Math.PI));
      assert.deepEqual(t.valueToNode(-Infinity), t.numericLiteral(-Infinity));
      assert.deepEqual(t.valueToNode(NaN), t.numericLiteral(NaN));
    });
    it("string", function() {
      assert.deepEqual(
        t.valueToNode('This is a "string"'),
        t.stringLiteral('This is a "string"'),
      );
    });
    it("boolean", function() {
      assert.deepEqual(t.valueToNode(true), t.booleanLiteral(true));
      assert.deepEqual(t.valueToNode(false), t.booleanLiteral(false));
    });
    it("null", function() {
      assert.deepEqual(t.valueToNode(null), t.nullLiteral());
    });
    it("undefined", function() {
      assert.deepEqual(t.valueToNode(undefined), t.identifier("undefined"));
    });
    it("RegExp", function() {
      assert.deepEqual(
        t.valueToNode(/abc.+/gm),
        t.regExpLiteral("abc.+", "gm"),
      );
    });
    it("array", function() {
      assert.deepEqual(
        t.valueToNode([1, "a"]),
        t.arrayExpression([t.numericLiteral(1), t.stringLiteral("a")]),
      );
    });
    it("object", function() {
      assert.deepEqual(
        t.valueToNode({
          a: 1,
          "b c": 2,
        }),
        t.objectExpression([
          t.objectProperty(t.identifier("a"), t.numericLiteral(1)),
          t.objectProperty(t.stringLiteral("b c"), t.numericLiteral(2)),
        ]),
      );
    });
    it("throws if cannot convert", function() {
      assert.throws(function() {
        t.valueToNode(Object);
      });
      assert.throws(function() {
        t.valueToNode(Symbol());
      });
    });
  });
  describe("toKeyAlias", function() {
    beforeEach(function() {
      // make tests deterministic
      t.toKeyAlias.uid = 0;
    });
    it("doesn't change string literals", function() {
      assert.equal(
        t.toKeyAlias(t.objectProperty(t.stringLiteral("a"), t.nullLiteral())),
        '"a"',
      );
    });
    it("wraps around at Number.MAX_SAFE_INTEGER", function() {
      assert.equal(
        t.toKeyAlias(
          t.objectMethod("method", t.identifier("a"), [], t.blockStatement([])),
        ),
        "0",
      );
    });
  });
  describe("toStatement", function() {
    it("noop on statements", function() {
      const node = t.emptyStatement();
      assert.equal(t.toStatement(node), node);
      t.assertEmptyStatement(node);
    });
    it("mutate class expression to declaration", function() {
      const node = t.classExpression(
        t.identifier("A"),
        null,
        t.classBody([]),
        [],
      );
      t.toStatement(node);
      t.assertClassDeclaration(node);
    });
    it("fail if class expression has no id", function() {
      const node = t.classExpression(null, null, t.classBody([]), []);
      assert.throws(function() {
        t.toStatement(node);
      });
      assert.strictEqual(t.toStatement(node, /* ignore = */ true), false);
      t.assertClassExpression(node);
    });
    it("mutate function expression to declaration", function() {
      const node = t.functionExpression(
        t.identifier("A"),
        [],
        t.blockStatement([]),
      );
      t.toStatement(node);
      t.assertFunctionDeclaration(node);
    });
    it("fail if function expression has no id", function() {
      const node = t.functionExpression(null, [], t.blockStatement([]));
      assert.throws(function() {
        t.toStatement(node);
      });
      assert.strictEqual(t.toStatement(node, /* ignore = */ true), false);
      t.assertFunctionExpression(node);
    });
    it("assignment expression", function() {
      const node = t.assignmentExpression(
        "+=",
        t.identifier("x"),
        t.numericLiteral(1),
      );
      t.assertExpressionStatement(t.toStatement(node));
      t.assertAssignmentExpression(node);
    });
    it("fail if cannot convert node type", function() {
      const node = t.yieldExpression(t.identifier("foo"));
      assert.throws(function() {
        t.toStatement(node);
      });
      assert.strictEqual(t.toStatement(node, /* ignore = */ true), false);
      t.assertYieldExpression(node);
    });
  });
  describe("toExpression", function() {
    it("noop on expressions", function() {
      const node = t.identifier("a");
      assert.equal(t.toExpression(node), node);
      t.assertIdentifier(node);
    });
    it("mutate class declaration to expression", function() {
      const node = t.classDeclaration(
        t.identifier("A"),
        null,
        t.classBody([]),
        [],
      );
      t.toExpression(node);
      t.assertClassExpression(node);
    });
    it("mutate function declaration to expression", function() {
      const node = t.functionDeclaration(
        t.identifier("A"),
        [],
        t.blockStatement([]),
      );
      t.toExpression(node);
      t.assertFunctionExpression(node);
    });
    it("mutate object method to expression", function() {
      const node = t.objectMethod(
        "method",
        t.identifier("A"),
        [],
        t.blockStatement([]),
      );
      t.toExpression(node);
      t.assertFunctionExpression(node);
    });
    it("mutate class method to expression", function() {
      const node = t.classMethod(
        "constructor",
        t.identifier("A"),
        [],
        t.blockStatement([]),
      );
      t.toExpression(node);
      t.assertFunctionExpression(node);
    });
    it("expression statement", function() {
      const inner = t.yieldExpression(t.identifier("foo"));
      const node = t.expressionStatement(inner);
      t.assertYieldExpression(t.toExpression(node));
      assert.equal(t.toExpression(node), inner);
      t.assertExpressionStatement(node);
    });
    it("fail if cannot convert node type", function() {
      const node = t.program([]);
      assert.throws(function() {
        t.toExpression(node);
      });
      t.assertProgram(node);
    });
  });
  describe("toSequenceExpression", function() {
    let scope;
    const undefinedNode = t.identifier("undefined");
    beforeEach(function() {
      scope = [];
      scope.buildUndefinedNode = function() {
        return undefinedNode;
      };
    });
    it("gathers nodes into sequence", function() {
      const node = t.identifier("a");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      t.assertSequenceExpression(sequence);
      assert.equal(sequence.expressions[0], undefinedNode);
      assert.equal(sequence.expressions[1], node);
      t.assertIdentifier(node);
    });
    it("avoids sequence for single node", function() {
      const node = t.identifier("a");
      let sequence = t.toSequenceExpression([node], scope);
      assert.equal(sequence, node);

      const block = t.blockStatement([t.expressionStatement(node)]);
      sequence = t.toSequenceExpression([block], scope);
      assert.equal(sequence, node);
    });
    it("gathers expression", function() {
      const node = t.identifier("a");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(sequence.expressions[1], node);
    });
    it("gathers expression statement", function() {
      const node = t.expressionStatement(t.identifier("a"));
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(sequence.expressions[1], node.expression);
    });
    it("gathers var declarations", function() {
      const node = parseCode("var a, b = 1;");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      t.assertIdentifier(scope[0].id, { name: "a" });
      t.assertIdentifier(scope[1].id, { name: "b" });
      assert.equal(generateCode(sequence.expressions[1]), "b = 1");
      assert.equal(generateCode(sequence.expressions[2]), "undefined");
    });
    it("skips undefined if expression after var declaration", function() {
      const node = parseCode("{ var a, b = 1; true }");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "b = 1, true");
    });
    it("bails on let and const declarations", function() {
      let node = parseCode("let a, b = 1;");
      let sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.isUndefined(sequence);

      node = parseCode("const b = 1;");
      sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.isUndefined(sequence);
    });
    it("gathers if statements", function() {
      let node = parseCode("if (true) { true }");
      let sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(
        generateCode(sequence.expressions[1]),
        "true ? true : undefined",
      );

      node = parseCode("if (true) { true } else { b }");
      sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "true ? true : b");
    });
    it("bails in if statements if recurse bails", function() {
      let node = parseCode("if (true) { return }");
      let sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.isUndefined(sequence);

      node = parseCode("if (true) { true } else { return }");
      sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.isUndefined(sequence);
    });
    it("gathers block statements", function() {
      let node = parseCode("{ a }");
      let sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "a");

      node = parseCode("{ a; b; }");
      sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "a, b");
    });
    it("bails in block statements if recurse bails", function() {
      const node = parseCode("{ return }");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.isUndefined(sequence);
    });
    it("gathers empty statements", function() {
      const node = parseCode(";");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "undefined");
    });
    it("skips empty statement if expression afterwards", function() {
      const node = parseCode("{ ; true }");
      const sequence = t.toSequenceExpression([undefinedNode, node], scope);
      assert.equal(generateCode(sequence.expressions[1]), "true");
    });
  });
});
