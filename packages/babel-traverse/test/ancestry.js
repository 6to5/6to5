import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";
import { expect } from "chai";

describe("path/ancestry", function() {
  describe("isAncestor", function() {
    const ast = parse("var a = 1; 'a';");

    it("returns true if ancestor", function() {
      const paths = [];
      traverse(ast, {
        "Program|NumericLiteral"(path) {
          paths.push(path);
        },
      });

      const [programPath, numberPath] = paths;

      assert(programPath.isAncestor(numberPath));
    });

    it("returns false if not ancestor", function() {
      const paths = [];
      traverse(ast, {
        "Program|NumericLiteral|StringLiteral"(path) {
          paths.push(path);
        },
      });

      const [, numberPath, stringPath] = paths;

      assert(!stringPath.isAncestor(numberPath));
    });
  });

  describe("isDescendant", function() {
    const ast = parse("var a = 1; 'a';");

    it("returns true if descendant", function() {
      const paths = [];
      traverse(ast, {
        "Program|NumericLiteral"(path) {
          paths.push(path);
        },
      });

      const [programPath, numberPath] = paths;

      assert(numberPath.isDescendant(programPath));
    });

    it("returns false if not descendant", function() {
      const paths = [];
      traverse(ast, {
        "Program|NumericLiteral|StringLiteral"(path) {
          paths.push(path);
        },
      });

      const [, numberPath, stringPath] = paths;

      assert(!numberPath.isDescendant(stringPath));
    });
  });

  describe("getStatementParent", function() {
    const ast = parse("var a = 1;");
    it("should throw", function() {
      expect(function() {
        traverse(ast, {
          Program(path) {
            path.getStatementParent();
          },
        });
      }).to.throw(/File\/Program node/);
    });
  });
});
