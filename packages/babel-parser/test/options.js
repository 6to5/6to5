import { parse } from "../lib";

describe("options", () => {
  describe("strictMode", () => {
    const CODE = "function f(x, x) {}";

    function expectToSucceed(opts) {
      expect(parse(CODE, opts).program.body[0]).toMatchObject({
        type: "FunctionDeclaration",
        id: { type: "Identifier", name: "f" },
        generator: false,
        async: false,
        params: [
          { type: "Identifier", name: "x" },
          { type: "Identifier", name: "x" },
        ],
        body: {
          type: "BlockStatement",
          body: [],
          directives: [],
        },
      });
    }

    function expectToFail(opts) {
      expect(() => parse(CODE, opts)).toThrow(
        new SyntaxError("Argument name clash. (1:14)"),
      );
    }

    describe("sourceType module", () => {
      it("default parses as strict mode", () => {
        expectToFail({ sourceType: "module" });
      });

      it("false parses as sloppy mode", () => {
        expectToSucceed({ sourceType: "module", strictMode: false });
      });

      it("true parses as strict mode", () => {
        expectToFail({ sourceType: "module", strictMode: true });
      });
    });

    describe("sourceType script", () => {
      it("default parses as sloppy mode", () => {
        expectToSucceed({ sourceType: "script" });
      });

      it("false parses as sloppy mode", () => {
        expectToSucceed({ sourceType: "script", strictMode: false });
      });

      it("true parses as strict mode", () => {
        expectToFail({ sourceType: "script", strictMode: true });
      });
    });
  });
});
