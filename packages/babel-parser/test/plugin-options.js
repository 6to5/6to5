import { parse } from "../lib";

function getParser(code, plugins) {
  return () => parse(code, { plugins, sourceType: "module" });
}

describe("plugin options", function () {
  describe("the first options are used", function () {
    // NOTE: This test is not specific about decorators, it can be applied
    // to any plugin with options.

    it("when they aren't specified", function () {
      const WITHOUT_FLAG = "flow";
      const WITH_FLAG = ["flow", { all: true }];

      const CODE = "new Foo<x>(y)";

      const AST_WITHOUT_FLAG = {
        type: "BinaryExpression",
        operator: ">",
        left: {
          type: "BinaryExpression",
          operator: "<",
          left: { type: "NewExpression" },
          right: { type: "Identifier" },
        },
        right: { type: "Identifier", extra: { parenthesized: true } },
      };

      const AST_WITH_FLAG = {
        type: "NewExpression",
        callee: { type: "Identifier" },
        arguments: [{ type: "Identifier" }],
        typeArguments: {
          type: "TypeParameterInstantiation",
          params: [
            { type: "GenericTypeAnnotation", id: { type: "Identifier" } },
          ],
        },
      };

      expect(
        getParser(CODE, [WITHOUT_FLAG, WITH_FLAG])().program.body[0].expression,
      ).toMatchObject(AST_WITHOUT_FLAG);

      expect(
        getParser(CODE, [WITHOUT_FLAG])().program.body[0].expression,
      ).toMatchObject(AST_WITHOUT_FLAG);

      expect(
        getParser(CODE, [WITH_FLAG])().program.body[0].expression,
      ).toMatchObject(AST_WITH_FLAG);
    });

    it("when they are specified", function () {
      const NAME = "pipelineOperator";
      const OPT_1 = [NAME, { proposal: "smart" }];
      const OPT_2 = [NAME, { proposal: "fsharp" }];
      const SYNTAX_1 = "a |> #()";
      const SYNTAX_2 = "a |> b()";

      expect(getParser(SYNTAX_1, [OPT_1, OPT_2])).not.toThrow();
      expect(getParser(SYNTAX_2, [OPT_2, OPT_1])).not.toThrow();
      expect(getParser(SYNTAX_1, [OPT_2, OPT_1])).toThrow();
      expect(getParser(SYNTAX_2, [OPT_1, OPT_2])).toThrow();
    });
  });
  describe("'moduleAttributes' plugin", () => {
    (process.env.BABEL_8_BREAKING ? it : it.skip)("removed in Babel 8", () => {
      expect(
        getParser("", ["moduleAttributes"]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"\`moduleAttributes\` has been removed in Babel 8, please use \`importAssertions\` parser plugin, or \`@babel/plugin-syntax-import-assertions\`."`,
      );
    });
  });
});
