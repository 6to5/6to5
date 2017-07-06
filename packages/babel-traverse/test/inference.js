import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";
import * as t from "babel-types";

function getPath(code) {
  const ast = parse(code, { plugins: ["flow", "asyncGenerators"] });
  let path;
  traverse(ast, {
    Program: function(_path) {
      path = _path;
      _path.stop();
    },
  });
  return path;
}

describe("inference", function() {
  describe("baseTypeStrictlyMatches", function() {
    it("it should work with null", function() {
      const path = getPath("var x = null; x === null")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      assert.ok(strictMatch, "null should be equal to null");
    });

    it("it should work with numbers", function() {
      const path = getPath("var x = 1; x === 2")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      assert.ok(strictMatch, "number should be equal to number");
    });

    it("it should bail when type changes", function() {
      const path = getPath("var x = 1; if (foo) x = null;else x = 3; x === 2")
        .get("body")[2]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");

      const strictMatch = left.baseTypeStrictlyMatches(right);

      assert.ok(!strictMatch, "type might change in if statement");
    });

    it("it should differentiate between null and undefined", function() {
      const path = getPath("var x; x === null")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      assert.ok(!strictMatch, "null should not match undefined");
    });
  });
  describe("getTypeAnnotation", function() {
    it("should infer from type cast", function() {
      const path = getPath("(x: number)").get("body")[0].get("expression");
      assert.ok(
        t.isNumberTypeAnnotation(path.getTypeAnnotation()),
        "should be number",
      );
    });
    it("should infer string from template literal", function() {
      const path = getPath("`hey`").get("body")[0].get("expression");
      assert.ok(
        t.isStringTypeAnnotation(path.getTypeAnnotation()),
        "should be string",
      );
    });
    it("should infer number from +x", function() {
      const path = getPath("+x").get("body")[0].get("expression");
      assert.ok(
        t.isNumberTypeAnnotation(path.getTypeAnnotation()),
        "should be number",
      );
    });
    it("should infer T from new T", function() {
      const path = getPath("new T").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "T",
        "should be T",
      );
    });
    it("should infer number from ++x", function() {
      const path = getPath("++x").get("body")[0].get("expression");
      assert.ok(
        t.isNumberTypeAnnotation(path.getTypeAnnotation()),
        "should be number",
      );
    });
    it("should infer number from --x", function() {
      const path = getPath("--x").get("body")[0].get("expression");
      assert.ok(
        t.isNumberTypeAnnotation(path.getTypeAnnotation()),
        "should be number",
      );
    });
    it("should infer void from void x", function() {
      const path = getPath("void x").get("body")[0].get("expression");
      assert.ok(
        t.isVoidTypeAnnotation(path.getTypeAnnotation()),
        "should be void",
      );
    });
    it("should infer string from typeof x", function() {
      const path = getPath("typeof x").get("body")[0].get("expression");
      assert.ok(
        t.isStringTypeAnnotation(path.getTypeAnnotation()),
        "should be string",
      );
    });
    it("should infer boolean from !x", function() {
      const path = getPath("!x").get("body")[0].get("expression");
      assert.ok(
        t.isBooleanTypeAnnotation(path.getTypeAnnotation()),
        "should be boolean",
      );
    });
    it("should infer type of sequence expression", function() {
      const path = getPath("a,1").get("body")[0].get("expression");
      assert.ok(
        t.isNumberTypeAnnotation(path.getTypeAnnotation()),
        "should be number",
      );
    });
    it("should infer type of logical expression", function() {
      const path = getPath("'a' && 1").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isUnionTypeAnnotation(type), "should be a union");
      assert.ok(
        t.isStringTypeAnnotation(type.types[0]),
        "first type in union should be string",
      );
      assert.ok(
        t.isNumberTypeAnnotation(type.types[1]),
        "second type in union should be number",
      );
    });
    it("should infer type of conditional expression", function() {
      const path = getPath("q ? true : 0").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isUnionTypeAnnotation(type), "should be a union");
      assert.ok(
        t.isBooleanTypeAnnotation(type.types[0]),
        "first type in union should be boolean",
      );
      assert.ok(
        t.isNumberTypeAnnotation(type.types[1]),
        "second type in union should be number",
      );
    });
    it("should infer RegExp from RegExp literal", function() {
      const path = getPath("/.+/").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "RegExp",
        "should be RegExp",
      );
    });
    it("should infer Object from object expression", function() {
      const path = getPath("({ a: 5 })").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "Object",
        "should be Object",
      );
    });
    it("should infer Array from array expression", function() {
      const path = getPath("[ 5 ]").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "Array",
        "should be Array",
      );
    });
    it("should infer Function from function", function() {
      const path = getPath("(function (): string {})")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "Function",
        "should be Function",
      );
    });
    it("should infer call return type using function", function() {
      const path = getPath("(function (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isStringTypeAnnotation(type), "should be string");
    });
    it("should infer call return type using async function", function() {
      const path = getPath("(async function (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "Promise",
        "should be Promise",
      );
    });
    it("should infer call return type using async generator function", function() {
      const path = getPath("(async function * (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "AsyncIterator",
        "should be AsyncIterator",
      );
    });
    it("should infer number from x/y", function() {
      const path = getPath("x/y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isNumberTypeAnnotation(type), "should be number");
    });
    it("should infer boolean from x instanceof y", function() {
      const path = getPath("x instanceof y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isBooleanTypeAnnotation(type), "should be boolean");
    });
    it("should infer number from 1 + 2", function() {
      const path = getPath("1 + 2").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isNumberTypeAnnotation(type), "should be number");
    });
    it("should infer string|number from x + y", function() {
      const path = getPath("x + y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(t.isUnionTypeAnnotation(type), "should be a union");
      assert.ok(
        t.isStringTypeAnnotation(type.types[0]),
        "first type in union should be string",
      );
      assert.ok(
        t.isNumberTypeAnnotation(type.types[1]),
        "second type in union should be number",
      );
    });
    it("should infer type of tagged template literal", function() {
      const path = getPath("(function (): RegExp {}) `hey`")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      assert.ok(
        t.isGenericTypeAnnotation(type) && type.id.name === "RegExp",
        "should be RegExp",
      );
    });
  });
});
