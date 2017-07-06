import traverse from "babel-traverse";
import assert from "assert";
import { parse } from "babylon";

describe("evaluation", function() {
  function addTest(code, type, value, notConfident) {
    it(type + ": " + code, function() {
      const visitor = {};

      visitor[type] = function(path) {
        const evaluate = path.evaluate();
        assert.equal(evaluate.confident, !notConfident);
        assert.deepEqual(evaluate.value, value);
      };

      traverse(
        parse(code, {
          plugins: ["*"],
        }),
        visitor,
      );
    });
  }

  addTest("void 0", "UnaryExpression", undefined);
  addTest("!true", "UnaryExpression", false);
  addTest("+'2'", "UnaryExpression", 2);
  addTest("-'2'", "UnaryExpression", -2);
  addTest("~1", "UnaryExpression", -2);
  addTest("3 - 1", "BinaryExpression", 2);
  addTest("5 + 5", "BinaryExpression", 10);
  addTest("10 / 2", "BinaryExpression", 5);
  addTest("2 * 3", "BinaryExpression", 6);
  addTest("4 % 2", "BinaryExpression", 0);
  addTest("2 ** 3", "BinaryExpression", 8);
  addTest("1 < 2", "BinaryExpression", true);
  addTest("1 > 2", "BinaryExpression", false);
  addTest("1 <= 2", "BinaryExpression", true);
  addTest("1 >= 2", "BinaryExpression", false);
  addTest("1 == '1'", "BinaryExpression", true);
  addTest("1 != 2", "BinaryExpression", true);
  addTest("'str' === 'str'", "BinaryExpression", true);
  addTest("'four' === 4", "BinaryExpression", false);
  addTest("'four' !== '4'", "BinaryExpression", true);
  addTest("'str' !== 'str'", "BinaryExpression", false);
  addTest("1 | 0", "BinaryExpression", 1);
  addTest("1 & 1", "BinaryExpression", 1);
  addTest("1 ^ 0", "BinaryExpression", 1);
  addTest("1 << 2", "BinaryExpression", 4);
  addTest("1 >> 2", "BinaryExpression", 0);
  addTest("1 in [1]", "BinaryExpression", undefined, true);
  addTest("A instanceof B", "BinaryExpression", undefined, true);
  addTest("'abc' === 'abc' && 1 === 1", "LogicalExpression", true);
  addTest("'abc' === 'abc' && 1 === 10", "LogicalExpression", false);
  addTest("'abc' === 'xyz' && 1 === 1", "LogicalExpression", false);
  addTest("'abc' === 'xyz' && 1 === 10", "LogicalExpression", false);
  addTest("'abc' === 'abc' || 1 === 1", "LogicalExpression", true);
  addTest("'abc' === 'abc' || 1 === 10", "LogicalExpression", true);
  addTest("'abc' === 'xyz' || 1 === 1", "LogicalExpression", true);
  addTest("'abc' === 'xyz' || 1 === 10", "LogicalExpression", false);
  addTest("'abc' === 'abc' || config.flag === 1", "LogicalExpression", true);
  addTest(
    "obj.a === 'abc' || config.flag === 1",
    "LogicalExpression",
    undefined,
    true,
  );
  addTest("'abc' !== 'abc' && config.flag === 1", "LogicalExpression", false);
  addTest("obj.a === 'abc' && 1 === 1", "LogicalExpression", undefined, true);
  addTest(
    "'abc' === 'abc' && (1 === 1 || config.flag)",
    "LogicalExpression",
    true,
  );
  addTest(
    "'abc' === 'xyz' || (1 === 1 && config.flag)",
    "LogicalExpression",
    undefined,
    true,
  );
  addTest(
    "'abc' === 'xyz' || (1 === 1 && 'four' === 'four')",
    "LogicalExpression",
    true,
  );
  addTest(
    "'abc' === 'abc' && (1 === 1 && 'four' === 'four')",
    "LogicalExpression",
    true,
  );
  addTest("({})", "ObjectExpression", {});
  addTest("({a: '1'})", "ObjectExpression", { a: "1" });
  addTest("({['a' + 'b']: 10 * 20, 'z': [1, 2, 3]})", "ObjectExpression", {
    ab: 200,
    z: [1, 2, 3],
  });
});
