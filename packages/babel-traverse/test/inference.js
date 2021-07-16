import traverse from "../lib";
import { parse } from "@babel/parser";
import * as t from "@babel/types";

function getPath(code) {
  const ast = parse(code, { plugins: ["flow"] });
  let path;
  traverse(ast, {
    Program: function (_path) {
      path = _path;
      _path.stop();
    },
  });
  return path;
}

describe("inference", function () {
  describe("baseTypeStrictlyMatches", function () {
    it("should work with null", function () {
      const path = getPath("var x = null; x === null")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      expect(strictMatch).toBeTruthy();
    });

    it("should work with numbers", function () {
      const path = getPath("var x = 1; x === 2")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      expect(strictMatch).toBeTruthy();
    });

    it("should bail when type changes", function () {
      const path = getPath("var x = 1; if (foo) x = null;else x = 3; x === 2")
        .get("body")[2]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");

      const strictMatch = left.baseTypeStrictlyMatches(right);

      expect(strictMatch).toBeFalsy();
    });

    it("should differentiate between null and undefined", function () {
      const path = getPath("var x; x === null")
        .get("body")[1]
        .get("expression");
      const left = path.get("left");
      const right = path.get("right");
      const strictMatch = left.baseTypeStrictlyMatches(right);

      expect(strictMatch).toBeFalsy();
    });
  });
  describe("getTypeAnnotation", function () {
    it("should infer from type cast", function () {
      const path = getPath("(x: number)").get("body")[0].get("expression");
      expect(t.isNumberTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer string from template literal", function () {
      const path = getPath("`hey`").get("body")[0].get("expression");
      expect(t.isStringTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer number from +x", function () {
      const path = getPath("+x").get("body")[0].get("expression");
      expect(t.isNumberTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer T from new T", function () {
      const path = getPath("new T").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "T",
      ).toBeTruthy();
    });
    it("should infer number from ++x", function () {
      const path = getPath("++x").get("body")[0].get("expression");
      expect(t.isNumberTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer number from --x", function () {
      const path = getPath("--x").get("body")[0].get("expression");
      expect(t.isNumberTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer void from void x", function () {
      const path = getPath("void x").get("body")[0].get("expression");
      expect(t.isVoidTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer string from typeof x", function () {
      const path = getPath("typeof x").get("body")[0].get("expression");
      expect(t.isStringTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer boolean from !x", function () {
      const path = getPath("!x").get("body")[0].get("expression");
      expect(t.isBooleanTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer type of sequence expression", function () {
      const path = getPath("a,1").get("body")[0].get("expression");
      expect(t.isNumberTypeAnnotation(path.getTypeAnnotation())).toBeTruthy();
    });
    it("should infer type of logical expression", function () {
      const path = getPath("'a' && 1").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isUnionTypeAnnotation(type)).toBeTruthy();
      expect(t.isStringTypeAnnotation(type.types[0])).toBeTruthy();
      expect(t.isNumberTypeAnnotation(type.types[1])).toBeTruthy();
    });
    it("should infer type of conditional expression", function () {
      const path = getPath("q ? true : 0").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isUnionTypeAnnotation(type)).toBeTruthy();
      expect(t.isBooleanTypeAnnotation(type.types[0])).toBeTruthy();
      expect(t.isNumberTypeAnnotation(type.types[1])).toBeTruthy();
    });
    it("should infer RegExp from RegExp literal", function () {
      const path = getPath("/.+/").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "RegExp",
      ).toBeTruthy();
    });
    it("should infer Object from object expression", function () {
      const path = getPath("({ a: 5 })").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Object",
      ).toBeTruthy();
    });
    it("should infer Array from array expression", function () {
      const path = getPath("[ 5 ]").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Array",
      ).toBeTruthy();
    });
    it("should infer Function from function", function () {
      const path = getPath("(function (): string {})")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Function",
      ).toBeTruthy();
    });
    it("should infer Array type from outside of function declaration", function () {
      const path = getPath(`
      const arr = []; function func() { const a = arr }`).get(
        "body.1.body.body.0.declarations.0",
      );
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Array",
      ).toBeTruthy();
    });
    it("should infer Array type from outside of function expression", function () {
      const path = getPath(`
        const arr = []; const func = function () { const a = arr }`).get(
        "body.1.declarations.0.init.body.body.0.declarations.0",
      );
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Array",
      ).toBeTruthy();
    });
    it("should infer Array type from outside of arrow function", function () {
      const path = getPath(`
        const arr = []; const func = () => { const a = arr }`).get(
        "body.1.declarations.0.init.body.body.0.declarations.0",
      );
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Array",
      ).toBeTruthy();
    });
    it("should infer call return type using function", function () {
      const path = getPath("(function (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isStringTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer call return type using async function", function () {
      const path = getPath("(async function (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "Promise",
      ).toBeTruthy();
    });
    it("should infer call return type using async generator function", function () {
      const path = getPath("(async function * (): string {})()")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "AsyncIterator",
      ).toBeTruthy();
    });
    it("should infer number from x/y", function () {
      const path = getPath("x/y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer boolean from x instanceof y", function () {
      const path = getPath("x instanceof y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isBooleanTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer number from 1 + 2", function () {
      const path = getPath("1 + 2").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer string|number from x + y", function () {
      const path = getPath("x + y").get("body")[0].get("expression");
      const type = path.getTypeAnnotation();
      expect(t.isUnionTypeAnnotation(type)).toBeTruthy();
      expect(t.isStringTypeAnnotation(type.types[0])).toBeTruthy();
      expect(t.isNumberTypeAnnotation(type.types[1])).toBeTruthy();
    });
    it("should infer type of tagged template literal", function () {
      const path = getPath("(function (): RegExp {}) `hey`")
        .get("body")[0]
        .get("expression");
      const type = path.getTypeAnnotation();
      expect(
        t.isGenericTypeAnnotation(type) && type.id.name === "RegExp",
      ).toBeTruthy();
    });
    it("should infer constant identifier", function () {
      const path = getPath("const x = 0; x").get("body.1.expression");
      const type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer indirect constant identifier", function () {
      const path = getPath("const x = 0; const y = x; y").get(
        "body.2.expression",
      );
      const type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer identifier type from if statement (===)", function () {
      const path = getPath(
        `function test(x) {
        if (x === true) x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      const type = path.getTypeAnnotation();
      expect(t.isBooleanTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer identifier type from if statement (typeof)", function () {
      let path = getPath(
        `function test(x) {
        if (typeof x == 'string') x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      let type = path.getTypeAnnotation();
      expect(t.isStringTypeAnnotation(type)).toBeTruthy();
      path = getPath(
        `function test(x) {
        if (typeof x === 'number') x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer identifier type from if statement (&&)", function () {
      let path = getPath(
        `function test(x) {
        if (typeof x == 'string' && x === 3) x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      let type = path.getTypeAnnotation();
      expect(t.isUnionTypeAnnotation(type)).toBeTruthy();
      expect(t.isStringTypeAnnotation(type.types[0])).toBeTruthy();
      expect(t.isNumberTypeAnnotation(type.types[1])).toBeTruthy();
      path = getPath(
        `function test(x) {
        if (true && x === 3) x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      type = path.getTypeAnnotation();
      expect(t.isNumberTypeAnnotation(type)).toBeTruthy();
      path = getPath(
        `function test(x) {
        if (x === 'test' && true) x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      type = path.getTypeAnnotation();
      expect(t.isStringTypeAnnotation(type)).toBeTruthy();
    });
    it("should infer identifier type from if statement (||)", function () {
      const path = getPath(
        `function test(x) {
        if (typeof x == 'string' || x === 3) x;
      }`,
      ).get("body.0.body.body.0.consequent.expression");
      const type = path.getTypeAnnotation();
      expect(t.isAnyTypeAnnotation(type)).toBeTruthy();
    });
    it("should not infer identifier type from incorrect binding", function () {
      const path = getPath(
        `function outer(x) {
        if (x === 3) {
          function inner(x) {
            x;
          }
        }
      }`,
      ).get("body.0.body.body.0.consequent.body.0.body.body.0.expression");
      const type = path.getTypeAnnotation();
      expect(t.isAnyTypeAnnotation(type)).toBeTruthy();
    });
    it("should not cause a stack overflow when two variable depend on eachother", function () {
      const path = getPath(`
        var b, c;
        while (0) {
          c = 1;
          b = c;
        }
        c = b;
      `).get("body.2.expression");

      expect(path.toString()).toBe("c = b");

      // Note: this could technically be "number | void", but the cycle detection
      // logic just bails out to "any" to avoid infinite loops.
      expect(path.getTypeAnnotation()).toEqual({ type: "AnyTypeAnnotation" });
    });
  });
});
