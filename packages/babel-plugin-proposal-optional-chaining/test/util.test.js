import { willPathCastToBoolean } from "../src/util";
import { parseSync, traverse } from "@babel/core";

function getPath(input, parserOpts) {
  let targetPath;
  traverse(
    parseSync(input, {
      configFile: false,
      parserOpts,
      filename: "example.js",
    }),
    {
      OptionalMemberExpression(path) {
        targetPath = path;
        path.stop();
      },
      noScope: true,
    },
  );
  return targetPath;
}

describe("willPathCastToBoolean", () => {
  const positiveCases = [
    "if(a?.b) {}",
    "while(a?.b) {}",
    "a?.b ? 0 : 1",
    "for(;a?.b;);",
    "while(a?.b);",
    "do {} while (a?.b)",
    "!a?.b",
    "if(a && a?.b) {}",
    "if(a?.b && a) {}",
    "while(a || a?.b) {}",
    "while(a?.b || a) {}",
    "for(; a ?? a?.b ;);",
    "do {} while (0, a?.b)",
    "(a?.b, 0)",
    "!(a && ( b || ( c ?? ( a?.b && d ) ) ) )",

    // parenthesized
    "!((a?.b), 0)",
    "((a?.b)) ? 0 : 1",
    "while( (a || ((a?.b) && c) ) );",
  ];

  const negativeCases = [
    "() => a?.b",
    "for(; a?.b ?? a;);",
    "a?.b && a",
    "a && a?.b",
    "() => a?.b || a",
    "() => a || a?.b",
    "a?.b()",
    "a = a?.b && null",

    // parenthesized
    "(a?.b)",
  ];

  describe("default parser options", () => {
    test.each(positiveCases)(
      "willPathCastToBoolean(a?.b in %p) should return true",
      input => {
        expect(willPathCastToBoolean(getPath(input))).toBe(true);
      },
    );
    test.each(negativeCases)(
      "willPathCastToBoolean(a?.b in %p) should return false",
      input => {
        expect(willPathCastToBoolean(getPath(input))).toBe(false);
      },
    );
  });

  describe("createParenthesizedExpressions", () => {
    test.each(positiveCases)(
      "willPathCastToBoolean(a?.b in %p with { createParenthesizedExpressions: true }) should return true",
      input => {
        const parserOpts = { createParenthesizedExpressions: true };
        expect(willPathCastToBoolean(getPath(input, parserOpts))).toBe(true);
      },
    );
    test.each(negativeCases)(
      "willPathCastToBoolean(a?.b in %p with { createParenthesizedExpressions: true }) should return false",
      input => {
        const parserOpts = { createParenthesizedExpressions: true };
        expect(willPathCastToBoolean(getPath(input, parserOpts))).toBe(false);
      },
    );
  });
});
