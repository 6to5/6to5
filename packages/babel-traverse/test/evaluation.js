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

describe("evaluation", function() {
  describe("evaluateTruthy", function() {
    it("it should work with null", function() {
      assert.strictEqual(
        getPath("false || a.length === 0;").get("body")[0].evaluateTruthy(),
        undefined,
      );
    });

    it("it should not mistake lack of confidence for falsy", function() {
      assert.strictEqual(
        getPath("foo || 'bar'").get("body")[0].evaluate().value,
        undefined,
      );
    });
  });

  it("should bail out on recursive evaluation", function() {
    assert.strictEqual(
      getPath("function fn(a) { var g = a ? 1 : 2, a = g * this.foo; }")
        .get("body.0.body.body.0.declarations.1.init")
        .evaluate().confident,
      false,
    );
  });

  it("should work with repeated, indeterminate identifiers", function() {
    assert.strictEqual(
      getPath("var num = foo(); (num > 0 && num < 100);")
        .get("body")[1]
        .evaluateTruthy(),
      undefined,
    );
  });

  it("should work with repeated, determinate identifiers", function() {
    assert.strictEqual(
      getPath("var num = 5; (num > 0 && num < 100);")
        .get("body")[1]
        .evaluateTruthy(),
      true,
    );
  });

  it("should deopt when var is redeclared in the same scope", function() {
    assert.strictEqual(
      getPath("var x = 2; var y = x + 2; { var x = 3 }")
        .get("body.1.declarations.0.init")
        .evaluate().confident,
      false,
    );
  });

  it("it should not deopt vars in different scope", function() {
    const input =
      "var a = 5; function x() { var a = 5; var b = a + 1; } var b = a + 2";
    assert.strictEqual(
      getPath(input).get("body.1.body.body.1.declarations.0.init").evaluate()
        .value,
      6,
    );
    assert.strictEqual(
      getPath(input).get("body.2.declarations.0.init").evaluate().value,
      7,
    );
  });

  it("it should not deopt let/const inside blocks", function() {
    assert.strictEqual(
      getPath("let x = 5; { let x = 1; } let y = x + 5")
        .get("body.2.declarations.0.init")
        .evaluate().value,
      10,
    );
    const constExample =
      "const d = true; if (d && true || false) { const d = false; d && 5; }";
    assert.strictEqual(
      getPath(constExample).get("body.1.test").evaluate().value,
      true,
    );
    assert.strictEqual(
      getPath(constExample).get("body.1.consequent.body.1").evaluate().value,
      false,
    );
  });

  it("should deopt ids that are referenced before the bindings", function() {
    assert.strictEqual(
      getPath("let x = y + 5; let y = 5;")
        .get("body.0.declarations.0.init")
        .evaluate().confident,
      false,
    );
    assert.strictEqual(
      getPath("if (typeof x === 'undefined') var x = {}")
        .get("body.0.test")
        .evaluate().confident,
      false,
    );
  });

  it("should evaluate undefined, NaN and Infinity", () => {
    assert.strictEqual(
      getPath("undefined").get("body.0.expression").evaluate().confident,
      true,
    );
    assert.strictEqual(
      getPath("NaN").get("body.0.expression").evaluate().confident,
      true,
    );
    assert.strictEqual(
      getPath("Infinity").get("body.0.expression").evaluate().confident,
      true,
    );
  });

  it("should deopt redefined primitives - undefined, NaN and Infinity", () => {
    const eval_undef = getPath("let undefined; undefined;")
      .get("body.1.expression")
      .evaluate();
    const eval_nan = getPath("let NaN; NaN;")
      .get("body.1.expression")
      .evaluate();
    const eval_inf = getPath("let Infinity; Infinity;")
      .get("body.1.expression")
      .evaluate();
    assert.strictEqual(eval_undef.confident, false);
    assert.strictEqual(eval_nan.confident, false);
    assert.strictEqual(eval_inf.confident, false);

    assert.strictEqual(eval_undef.deopt.type, "VariableDeclarator");
    assert.strictEqual(eval_undef.deopt.parentPath.node.kind, "let");
  });

  it("should work with String.raw", function() {
    assert.strictEqual(
      getPath("String.raw`\\d`").get("body")[0].evaluate().value,
      "\\d",
    );

    assert.strictEqual(
      getPath("`${String.raw`\\d`}`").get("body")[0].evaluate().value,
      "\\d",
    );
  });
});
