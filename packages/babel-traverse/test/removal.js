import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";
import generate from "babel-generator";

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

function generateCode(path) {
  return generate(path.node).code;
}

describe("removal", function() {
  describe("ArrowFunction", function() {
    it("remove body", function() {
      const rootPath = getPath("x = () => b;");
      const path = rootPath.get("body")[0].get("expression").get("right");
      const body = path.get("body");
      body.remove();

      assert.equal(
        generateCode(rootPath),
        "x = () => {};",
        "body should be replaced with BlockStatement",
      );
    });
  });
});
