// Basic smoke tests for @babel/standalone
(process.env.TEST_TYPE === "cov" ? describe.skip : describe)(
  "@babel/standalone",
  () => {
    const Babel = require("../babel");

    it("handles the es2015-no-commonjs preset", () => {
      const output = Babel.transform('const getMessage = () => "Hello World"', {
        presets: ["es2015-no-commonjs"],
      }).code;
      expect(output).toBe(
        "var getMessage = function getMessage() {\n" +
          '  return "Hello World";\n' +
          "};",
      );
    });
    it("handles the es2015-loose preset", () => {
      const output = Babel.transform("class A {}", {
        sourceType: "script",
        presets: ["es2015-loose"],
      }).code;
      expect(output).toBe('var A = function A() {\n  "use strict";\n};');
    });
    it("handles the typescript preset", () => {
      const output = Babel.transform("var a: string;", {
        presets: [["typescript", { allExtensions: true }]],
      }).code;
      expect(output).toBe("var a;");
    });
    it("handles the flow preset", () => {
      const output = Babel.transform("var a: string;", {
        presets: ["flow"],
      }).code;
      expect(output).toBe("var a;");
    });
    it("can translate simple ast", () => {
      const ast = {
        type: "Program",
        start: 0,
        end: 2,
        directives: [],
        body: [
          {
            type: "ExpressionStatement",
            start: 0,
            end: 1,
            expression: {
              type: "NumericLiteral",
              start: 0,
              end: 2,
              value: 42,
              raw: "42",
            },
          },
        ],
        sourceType: "script",
      };
      const output = Babel.transformFromAst(ast, "42", { presets: ["es2015"] })
        .code;
      expect(output).toBe("42;");
    });

    it("handles the react preset", () => {
      const output = Babel.transform(
        "const someDiv = <div>{getMessage()}</div>",
        {
          presets: ["react"],
        },
      ).code;
      expect(output).toBe(
        'const someDiv = /*#__PURE__*/React.createElement("div", null, getMessage());',
      );
    });

    it("handles presets with options", () => {
      const output = Babel.transform("export let x", {
        presets: [["es2015", { modules: false }]],
      }).code;
      expect(output).toBe("export var x;");
    });

    it("handles specifying a plugin by name", () => {
      const output = Babel.transform('const getMessage = () => "Hello World"', {
        plugins: ["transform-arrow-functions"],
      }).code;
      // Transforms arrow syntax but NOT "const".
      expect(output).toBe(
        "const getMessage = function () {\n" +
          '  return "Hello World";\n' +
          "};",
      );
    });

    it("handles plugins with options", () => {
      const output = Babel.transform("`${x}`", {
        plugins: [["transform-template-literals", { loose: true }]],
      }).code;
      expect(output).toBe('"" + x;');
    });

    it("throws on invalid preset name", () => {
      expect(() =>
        Babel.transform("var foo", { presets: ["lolfail"] }),
      ).toThrow(/Invalid preset specified in Babel options: "lolfail"/);
    });

    it("throws on invalid plugin name", () => {
      expect(() =>
        Babel.transform("var foo", { plugins: ["lolfail"] }),
      ).toThrow(/Invalid plugin specified in Babel options: "lolfail"/);
    });

    it("exports babel toolings", () => {
      expect(Babel.parser).toBeDefined();
      expect(Babel.traverse).toBeDefined();
      expect(Babel.template).toBeDefined();
      expect(Babel.generate).toBeDefined();
      expect(Babel.types).toBeDefined();
    });

    describe("env preset", () => {
      it("works w/o targets", () => {
        const output = Babel.transform("const a = 1;", {
          sourceType: "script",
          presets: ["env"],
        }).code;
        expect(output).toBe("var a = 1;");
      });

      it("doesn't transpile `const` with chrome 60", () => {
        const output = Babel.transform("const a = 1;", {
          sourceType: "script",
          presets: [
            [
              "env",
              {
                targets: {
                  chrome: 60,
                },
              },
            ],
          ],
        }).code;
        expect(output).toBe("const a = 1;");
      });

      it("transpiles `const` with chrome 60 and preset-es2015", () => {
        const output = Babel.transform("const a = 1;", {
          sourceType: "script",
          presets: [
            [
              "env",
              {
                targets: {
                  chrome: 60,
                },
              },
            ],
            "es2015",
          ],
        }).code;
        expect(output).toBe("var a = 1;");
      });

      it("uses transform-new-targets plugin", () => {
        const output = Babel.transform("function Foo() {new.target}", {
          sourceType: "script",
          presets: ["env"],
        }).code;
        expect(output).toBe(
          "function Foo() {\n  this instanceof Foo ? this.constructor : void 0;\n}",
        );
      });
    });

    describe("custom plugins and presets", () => {
      const lolizer = () => ({
        visitor: {
          Identifier(path) {
            path.node.name = "LOL";
          },
        },
      });

      it("allows custom plugins to be registered", () => {
        Babel.registerPlugin("lolizer", lolizer);
        const output = Babel.transform(
          "function helloWorld() { alert(hello); }",
          { plugins: ["lolizer"] },
        );
        expect(output.code).toBe(`function LOL() {
  LOL(LOL);
}`);
      });

      it("allows custom presets to be registered", () => {
        Babel.registerPreset("lulz", { plugins: [lolizer] });
        const output = Babel.transform(
          "function helloWorld() { alert(hello); }",
          { presets: ["lulz"] },
        );
        expect(output.code).toBe(`function LOL() {
  LOL(LOL);
}`);
      });
    });

    describe("regressions", () => {
      it("#11534 - supports quantifiers in unicode regexps", () => {
        expect(() =>
          Babel.transform("/a*/u", { presets: ["es2015"] }),
        ).not.toThrow();
      });
      it("#11628 - supports stage-0 passing moduleAttributesVersion to stage-1", () => {
        expect(() =>
          Babel.transform("const getMessage = () => 'Hello World'", {
            presets: [["stage-0", { decoratorsBeforeExport: false }]],
          }),
        ).not.toThrow();
      });
    });
  },
);
