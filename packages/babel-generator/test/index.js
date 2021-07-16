import Printer from "../lib/printer";
import generate, { CodeGenerator } from "../lib";
import { parse } from "@babel/parser";
import * as t from "@babel/types";
import fs from "fs";
import path from "path";
import fixtures from "@babel/helper-fixtures";
import sourcemap from "source-map";
import { fileURLToPath } from "url";

describe("generation", function () {
  it("completeness", function () {
    Object.keys(t.VISITOR_KEYS).forEach(function (type) {
      expect(Printer.prototype[type]).toBeTruthy();
    });

    Object.keys(Printer.prototype).forEach(function (type) {
      if (!/[A-Z]/.test(type[0])) return;
      expect(t.VISITOR_KEYS[type]).toBeTruthy();
    });
  });

  it("multiple sources", function () {
    const sources = {
      "a.js": "function hi (msg) { console.log(msg); }\n",
      "b.js": "hi('hello');\n",
    };
    const parsed = Object.keys(sources).reduce(function (_parsed, filename) {
      _parsed[filename] = parse(sources[filename], {
        sourceFilename: filename,
      });
      return _parsed;
    }, {});

    const combinedAst = {
      type: "File",
      program: {
        type: "Program",
        sourceType: "module",
        body: [].concat(
          parsed["a.js"].program.body,
          parsed["b.js"].program.body,
        ),
      },
    };

    const generated = generate(combinedAst, { sourceMaps: true }, sources);

    expect(generated.map).toEqual(
      {
        version: 3,
        sources: ["a.js", "b.js"],
        mappings:
          // eslint-disable-next-line max-len
          "AAAA,SAASA,EAAT,CAAaC,GAAb,EAAkB;AAAEC,EAAAA,OAAO,CAACC,GAAR,CAAYF,GAAZ;AAAmB;;ACAvCD,EAAE,CAAC,OAAD,CAAF",
        names: ["hi", "msg", "console", "log"],
        sourcesContent: [
          "function hi (msg) { console.log(msg); }\n",
          "hi('hello');\n",
        ],
      },
      "sourcemap was incorrectly generated",
    );

    expect(generated.rawMappings).toEqual(
      [
        {
          name: undefined,
          generated: { line: 1, column: 0 },
          source: "a.js",
          original: { line: 1, column: 0 },
        },
        {
          name: "hi",
          generated: { line: 1, column: 9 },
          source: "a.js",
          original: { line: 1, column: 9 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 11 },
          source: "a.js",
          original: { line: 1, column: 0 },
        },
        {
          name: "msg",
          generated: { line: 1, column: 12 },
          source: "a.js",
          original: { line: 1, column: 13 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 15 },
          source: "a.js",
          original: { line: 1, column: 0 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 17 },
          source: "a.js",
          original: { line: 1, column: 18 },
        },
        {
          name: "console",
          generated: { line: 2, column: 0 },
          source: "a.js",
          original: { line: 1, column: 20 },
        },
        {
          name: "console",
          generated: { line: 2, column: 2 },
          source: "a.js",
          original: { line: 1, column: 20 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 9 },
          source: "a.js",
          original: { line: 1, column: 27 },
        },
        {
          name: "log",
          generated: { line: 2, column: 10 },
          source: "a.js",
          original: { line: 1, column: 28 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 13 },
          source: "a.js",
          original: { line: 1, column: 20 },
        },
        {
          name: "msg",
          generated: { line: 2, column: 14 },
          source: "a.js",
          original: { line: 1, column: 32 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 17 },
          source: "a.js",
          original: { line: 1, column: 20 },
        },
        {
          name: undefined,
          generated: { line: 3, column: 0 },
          source: "a.js",
          original: { line: 1, column: 39 },
        },
        {
          name: "hi",
          generated: { line: 5, column: 0 },
          source: "b.js",
          original: { line: 1, column: 0 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 2 },
          source: "b.js",
          original: { line: 1, column: 2 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 3 },
          source: "b.js",
          original: { line: 1, column: 3 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 10 },
          source: "b.js",
          original: { line: 1, column: 2 },
        },
        {
          name: undefined,
          generated: { line: 5, column: 11 },
          source: "b.js",
          original: { line: 1, column: 0 },
        },
      ],
      "raw mappings were incorrectly generated",
    );

    expect(generated.code).toBe(
      "function hi(msg) {\n  console.log(msg);\n}\n\nhi('hello');",
    );
  });

  it("identifierName", function () {
    const code = "function foo() { bar; }\n";

    const ast = parse(code, { filename: "inline" }).program;
    const fn = ast.body[0];

    const id = fn.id;
    id.name += "2";
    id.loc.identifierName = "foo";

    const id2 = fn.body.body[0].expression;
    id2.name += "2";
    id2.loc.identifierName = "bar";

    const generated = generate(
      ast,
      {
        filename: "inline",
        sourceFilename: "inline",
        sourceMaps: true,
      },
      code,
    );

    expect(generated.map).toEqual(
      {
        version: 3,
        sources: ["inline"],
        names: ["foo", "bar"],
        mappings: "AAAA,SAASA,IAAT,GAAe;AAAEC,EAAAA,IAAG;AAAG",
        sourcesContent: ["function foo() { bar; }\n"],
      },
      "sourcemap was incorrectly generated",
    );

    expect(generated.rawMappings).toEqual(
      [
        {
          name: undefined,
          generated: { line: 1, column: 0 },
          source: "inline",
          original: { line: 1, column: 0 },
        },
        {
          name: "foo",
          generated: { line: 1, column: 9 },
          source: "inline",
          original: { line: 1, column: 9 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 13 },
          source: "inline",
          original: { line: 1, column: 0 },
        },
        {
          name: undefined,
          generated: { line: 1, column: 16 },
          source: "inline",
          original: { line: 1, column: 15 },
        },
        {
          name: "bar",
          generated: { line: 2, column: 0 },
          source: "inline",
          original: { line: 1, column: 17 },
        },
        {
          name: "bar",
          generated: { line: 2, column: 2 },
          source: "inline",
          original: { line: 1, column: 17 },
        },
        {
          name: undefined,
          generated: { line: 2, column: 6 },
          source: "inline",
          original: { line: 1, column: 20 },
        },
        {
          name: undefined,
          generated: { line: 3, column: 0 },
          source: "inline",
          original: { line: 1, column: 23 },
        },
      ],
      "raw mappings were incorrectly generated",
    );

    expect(generated.code).toBe("function foo2() {\n  bar2;\n}");
  });

  it("newline in template literal", () => {
    const code = "`before\n\nafter`;";
    const ast = parse(code, { filename: "inline" }).program;
    const generated = generate(
      ast,
      {
        filename: "inline",
        sourceFilename: "inline",
        sourceMaps: true,
      },
      code,
    );

    const consumer = new sourcemap.SourceMapConsumer(generated.map);
    const loc = consumer.originalPositionFor({ line: 2, column: 1 });
    expect(loc).toMatchObject({
      column: 0,
      line: 2,
    });
  });

  it("newline in string literal", () => {
    const code = "'before\\\n\\\nafter';";
    const ast = parse(code, { filename: "inline" }).program;
    const generated = generate(
      ast,
      {
        filename: "inline",
        sourceFilename: "inline",
        sourceMaps: true,
      },
      code,
    );

    const consumer = new sourcemap.SourceMapConsumer(generated.map);
    const loc = consumer.originalPositionFor({ line: 2, column: 1 });
    expect(loc).toMatchObject({
      column: 0,
      line: 2,
    });
  });

  it("lazy source map generation", function () {
    const code = "function hi (msg) { console.log(msg); }\n";

    const ast = parse(code, { filename: "a.js" }).program;
    const generated = generate(ast, {
      sourceFilename: "a.js",
      sourceMaps: true,
    });

    expect(Array.isArray(generated.rawMappings)).toBe(true);

    expect(
      Object.getOwnPropertyDescriptor(generated, "map"),
    ).not.toHaveProperty("value");

    expect(generated).toHaveProperty("map");
    expect(typeof generated.map).toBe("object");
  });

  it("wraps around infer inside an array type", () => {
    const type = t.tsArrayType(
      t.tsInferType(
        t.tsTypeParameter(
          null,
          null,
          !process.env.BABEL_8_BREAKING ? "T" : t.identifier("T"),
        ),
      ),
    );

    const output = generate(type).code;
    expect(output).toBe("(infer T)[]");
  });

  it("should not deduplicate comments with same start index", () => {
    const code1 = "/*#__PURE__*/ a();";
    const code2 = "/*#__PURE__*/ b();";

    const ast1 = parse(code1).program;
    const ast2 = parse(code2).program;

    const ast = t.program([...ast1.body, ...ast2.body]);

    expect(generate(ast).code).toBe(
      "/*#__PURE__*/\na();\n\n/*#__PURE__*/\nb();",
    );
  });
});

describe("programmatic generation", function () {
  it("should add parenthesis when NullishCoalescing is used along with ||", function () {
    // https://github.com/babel/babel/issues/10260
    const nullishCoalesc = t.logicalExpression(
      "??",
      t.logicalExpression("||", t.identifier("a"), t.identifier("b")),
      t.identifier("c"),
    );
    const output = generate(nullishCoalesc).code;
    expect(output).toBe(`(a || b) ?? c`);
  });

  it("should add parenthesis when NullishCoalesing is used with &&", function () {
    const nullishCoalesc = t.logicalExpression(
      "??",
      t.identifier("a"),
      t.logicalExpression(
        "&&",
        t.identifier("b"),
        t.logicalExpression("&&", t.identifier("c"), t.identifier("d")),
      ),
    );
    const output = generate(nullishCoalesc).code;
    expect(output).toBe(`a ?? (b && c && d)`);
  });

  it("numeric member expression", function () {
    // Should not generate `0.foo`
    const mem = t.memberExpression(
      t.numericLiteral(60702),
      t.identifier("foo"),
    );
    new Function(generate(mem).code);
  });

  it("nested if statements needs block", function () {
    const ifStatement = t.ifStatement(
      t.stringLiteral("top cond"),
      t.whileStatement(
        t.stringLiteral("while cond"),
        t.ifStatement(
          t.stringLiteral("nested"),
          t.expressionStatement(t.numericLiteral(1)),
        ),
      ),
      t.expressionStatement(t.stringLiteral("alt")),
    );

    const ast = parse(generate(ifStatement).code);
    expect(ast.program.body[0].consequent.type).toBe("BlockStatement");
  });

  it("prints directives in block with empty body", function () {
    const blockStatement = t.blockStatement(
      [],
      [t.directive(t.directiveLiteral("use strict"))],
    );

    const output = generate(blockStatement).code;
    expect(output).toBe(`{
  "use strict";
}`);
  });

  it("flow object indentation", function () {
    const objectStatement = t.objectTypeAnnotation(
      [t.objectTypeProperty(t.identifier("bar"), t.stringTypeAnnotation())],
      null,
      null,
      null,
    );

    const output = generate(objectStatement).code;
    expect(output).toBe(`{
  bar: string
}`);
  });

  it("flow object exact", function () {
    const objectStatement = t.objectTypeAnnotation(
      [t.objectTypeProperty(t.identifier("bar"), t.stringTypeAnnotation())],
      null,
      null,
      null,
      true,
    );

    const output = generate(objectStatement).code;
    expect(output).toBe(`{|
  bar: string
|}`);
  });

  it("flow object indentation with empty leading ObjectTypeProperty", function () {
    const objectStatement = t.objectTypeAnnotation(
      [],
      [
        t.objectTypeIndexer(
          t.identifier("key"),
          t.anyTypeAnnotation(),
          t.numberTypeAnnotation(),
        ),
      ],
      null,
    );

    const output = generate(objectStatement).code;

    expect(output).toBe(`{
  [key: any]: number
}`);
  });

  it("flow interface with nullish extends", () => {
    const interfaceDeclaration = t.interfaceDeclaration(
      t.identifier("A"),
      undefined,
      undefined,
      t.objectTypeAnnotation([]),
    );
    const output = generate(interfaceDeclaration).code;
    expect(output).toBe("interface A {}");
  });

  describe("directives", function () {
    it("preserves escapes", function () {
      const directive = t.directive(
        t.directiveLiteral(String.raw`us\x65 strict`),
      );
      const output = generate(directive).code;

      expect(output).toBe(String.raw`"us\x65 strict";`);
    });

    it("preserves escapes in minified output", function () {
      // https://github.com/babel/babel/issues/4767

      const directive = t.directive(t.directiveLiteral(String.raw`foo\n\t\r`));
      const output = generate(directive, { minified: true }).code;

      expect(output).toBe(String.raw`"foo\n\t\r";`);
    });

    it("unescaped single quote", function () {
      const directive = t.directive(t.directiveLiteral(String.raw`'\'\"`));
      const output = generate(directive).code;

      expect(output).toBe(String.raw`"'\'\"";`);
    });

    it("unescaped double quote", function () {
      const directive = t.directive(t.directiveLiteral(String.raw`"\'\"`));
      const output = generate(directive).code;

      expect(output).toBe(String.raw`'"\'\"';`);
    });

    it("unescaped single and double quotes together throw", function () {
      const directive = t.directive(t.directiveLiteral(String.raw`'"`));

      expect(() => {
        generate(directive);
      }).toThrow();
    });
  });

  describe("typescript generate parentheses if necessary", function () {
    it("wraps around union for array", () => {
      const typeStatement = t.tsArrayType(
        t.tsUnionType([
          t.tsIntersectionType([t.tsNumberKeyword(), t.tsBooleanKeyword()]),
          t.tsNullKeyword(),
        ]),
      );
      const output = generate(typeStatement).code;
      expect(output).toBe("((number & boolean) | null)[]");
    });
    it("wraps around intersection for array", () => {
      const typeStatement = t.tsArrayType(
        t.tsIntersectionType([t.tsNumberKeyword(), t.tsBooleanKeyword()]),
      );
      const output = generate(typeStatement).code;
      expect(output).toBe("(number & boolean)[]");
    });
    it("wraps around rest", () => {
      const typeStatement = t.tsRestType(
        t.tsIntersectionType([t.tsNumberKeyword(), t.tsBooleanKeyword()]),
      );
      const output = generate(typeStatement).code;
      expect(output).toBe("...(number & boolean)");
    });
    it("wraps around optional type", () => {
      const typeStatement = t.tsOptionalType(
        t.tsIntersectionType([t.tsNumberKeyword(), t.tsBooleanKeyword()]),
      );
      const output = generate(typeStatement).code;
      expect(output).toBe("(number & boolean)?");
    });
  });

  describe("object expressions", () => {
    it("not wrapped in parentheses when standalone", () => {
      const objectExpression = t.objectExpression([]);
      const output = generate(objectExpression).code;
      expect(output).toBe("{}");
    });

    it("wrapped in parentheses in expression statement", () => {
      const expressionStatement = t.expressionStatement(t.objectExpression([]));
      const output = generate(expressionStatement).code;
      expect(output).toBe("({});");
    });

    it("wrapped in parentheses in arrow function", () => {
      const arrowFunctionExpression = t.arrowFunctionExpression(
        [],
        t.objectExpression([]),
      );
      const output = generate(arrowFunctionExpression).code;
      expect(output).toBe("() => ({})");
    });

    it("not wrapped in parentheses in conditional", () => {
      const conditionalExpression = t.conditionalExpression(
        t.objectExpression([]),
        t.booleanLiteral(true),
        t.booleanLiteral(false),
      );
      const output = generate(conditionalExpression).code;
      expect(output).toBe("{} ? true : false");
    });

    it("wrapped in parentheses in conditional in expression statement", () => {
      const expressionStatement = t.expressionStatement(
        t.conditionalExpression(
          t.objectExpression([]),
          t.booleanLiteral(true),
          t.booleanLiteral(false),
        ),
      );
      const output = generate(expressionStatement).code;
      expect(output).toBe("({}) ? true : false;");
    });

    it("wrapped in parentheses in conditional in arrow function", () => {
      const arrowFunctionExpression = t.arrowFunctionExpression(
        [],
        t.conditionalExpression(
          t.objectExpression([]),
          t.booleanLiteral(true),
          t.booleanLiteral(false),
        ),
      );
      const output = generate(arrowFunctionExpression).code;
      expect(output).toBe("() => ({}) ? true : false");
    });

    it("not wrapped in parentheses in binary expression", () => {
      const binaryExpression = t.binaryExpression(
        "+",
        t.objectExpression([]),
        t.numericLiteral(1),
      );
      const output = generate(binaryExpression).code;
      expect(output).toBe("{} + 1");
    });

    it("wrapped in parentheses in binary expression in expression statement", () => {
      const expressionStatement = t.expressionStatement(
        t.binaryExpression("+", t.objectExpression([]), t.numericLiteral(1)),
      );
      const output = generate(expressionStatement).code;
      expect(output).toBe("({}) + 1;");
    });

    it("wrapped in parentheses in binary expression in arrow function", () => {
      const arrowFunctionExpression = t.arrowFunctionExpression(
        [],
        t.binaryExpression("+", t.objectExpression([]), t.numericLiteral(1)),
      );
      const output = generate(arrowFunctionExpression).code;
      expect(output).toBe("() => ({}) + 1");
    });

    it("not wrapped in parentheses in sequence expression", () => {
      const sequenceExpression = t.sequenceExpression([
        t.objectExpression([]),
        t.numericLiteral(1),
      ]);
      const output = generate(sequenceExpression).code;
      expect(output).toBe("{}, 1");
    });

    it("wrapped in parentheses in sequence expression in expression statement", () => {
      const expressionStatement = t.expressionStatement(
        t.sequenceExpression([t.objectExpression([]), t.numericLiteral(1)]),
      );
      const output = generate(expressionStatement).code;
      expect(output).toBe("({}), 1;");
    });

    it("wrapped in parentheses in sequence expression in arrow function", () => {
      const arrowFunctionExpression = t.arrowFunctionExpression(
        [],
        t.sequenceExpression([t.objectExpression([]), t.numericLiteral(1)]),
      );
      const output = generate(arrowFunctionExpression).code;
      expect(output).toBe("() => (({}), 1)");
    });
  });

  describe("function expressions", () => {
    it("not wrapped in parentheses when standalone", () => {
      const functionExpression = t.functionExpression(
        null,
        [],
        t.blockStatement([]),
      );
      const output = generate(functionExpression).code;
      expect(output).toBe("function () {}");
    });

    it("wrapped in parentheses in expression statement", () => {
      const expressionStatement = t.expressionStatement(
        t.functionExpression(null, [], t.blockStatement([])),
      );
      const output = generate(expressionStatement).code;
      expect(output).toBe("(function () {});");
    });

    it("wrapped in parentheses in export default declaration", () => {
      const exportDefaultDeclaration = t.exportDefaultDeclaration(
        t.functionExpression(null, [], t.blockStatement([])),
      );
      const output = generate(exportDefaultDeclaration).code;
      expect(output).toBe("export default (function () {});");
    });
  });

  describe("class expressions", () => {
    it("not wrapped in parentheses when standalone", () => {
      const classExpression = t.classExpression(null, null, t.classBody([]));
      const output = generate(classExpression).code;
      expect(output).toBe("class {}");
    });

    it("wrapped in parentheses in expression statement", () => {
      const expressionStatement = t.expressionStatement(
        t.classExpression(null, null, t.classBody([])),
      );
      const output = generate(expressionStatement).code;
      expect(output).toBe("(class {});");
    });

    it("wrapped in parentheses in export default declaration", () => {
      const exportDefaultDeclaration = t.exportDefaultDeclaration(
        t.classExpression(null, null, t.classBody([])),
      );
      const output = generate(exportDefaultDeclaration).code;
      expect(output).toBe("export default (class {});");
    });
  });

  describe("jsescOption.minimal", () => {
    const string = t.stringLiteral("\u8868\u683C_\u526F\u672C");

    it("true", () => {
      const output = generate(string, { jsescOption: { minimal: true } }).code;
      expect(output).toBe(`"表格_副本"`);
    });

    it("false", () => {
      const output = generate(string, { jsescOption: { minimal: false } }).code;
      expect(output).toBe(`"\\u8868\\u683C_\\u526F\\u672C"`);
    });

    if (process.env.BABEL_8_BREAKING) {
      it("default", () => {
        const output = generate(string).code;

        expect(output).toBe(`"表格_副本"`);
      });
    } else {
      it("default in Babel 7", () => {
        const output = generate(string).code;

        expect(output).toBe(`"\\u8868\\u683C_\\u526F\\u672C"`);
      });
    }
  });

  describe("typescript interface declaration", () => {
    it("empty extends array", () => {
      const tsInterfaceDeclaration = t.tsInterfaceDeclaration(
        t.identifier("A"),
        undefined,
        [],
        t.tsInterfaceBody([]),
      );
      const output = generate(tsInterfaceDeclaration).code;
      expect(output).toBe("interface A {}");
    });
  });

  describe("identifier let", () => {
    it("detects open bracket from non-optional OptionalMemberExpression", () => {
      const ast = parse(`for (let?.[x];;);`, {
        sourceType: "script",
        strictMode: "false",
      });
      ast.program.body[0].init.optional = false;
      const output = generate(ast).code;
      expect(output).toBe("for ((let)[x];;);");
    });
  });
});

describe("CodeGenerator", function () {
  it("generate", function () {
    const codeGen = new CodeGenerator(t.numericLiteral(123));
    const code = codeGen.generate().code;
    expect(parse(code).program.body[0].expression.value).toBe(123);
  });
});

const suites = fixtures(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures"),
);

suites.forEach(function (testSuite) {
  describe("generation/" + testSuite.title, function () {
    testSuite.tests.forEach(function (task) {
      const testFn = task.disabled ? it.skip : it;

      testFn(
        task.title,

        function () {
          const expected = task.expect;
          const actual = task.actual;
          const actualCode = actual.code;

          if (actualCode) {
            const actualAst = parse(actualCode, {
              filename: actual.loc,
              plugins: task.options.plugins || [],
              strictMode: task.options.strictMode === false ? false : true,
              sourceType: "module",
              sourceMaps: !!task.sourceMap,
              ...task.options.parserOpts,
            });
            const options = {
              sourceFilename: path.relative(
                path.dirname(fileURLToPath(import.meta.url)),
                actual.loc,
              ),
              ...task.options,
              sourceMaps: task.sourceMap ? true : task.options.sourceMaps,
            };

            const run = () => {
              return generate(actualAst, options, actualCode);
            };

            const throwMsg = task.options.throws;
            if (throwMsg) {
              expect(() => run()).toThrow(
                throwMsg === true ? undefined : throwMsg,
              );
            } else {
              const result = run();

              if (options.sourceMaps) {
                expect(result.map).toEqual(task.sourceMap);
              }

              if (
                !expected.code &&
                result.code &&
                fs.statSync(path.dirname(expected.loc)).isDirectory() &&
                !process.env.CI
              ) {
                console.log(`New test file created: ${expected.loc}`);
                fs.writeFileSync(expected.loc, result.code);
              } else {
                try {
                  expect(result.code).toBe(expected.code);
                } catch (e) {
                  if (!process.env.OVERWRITE) throw e;
                  console.log(`Updated test file: ${expected.loc}`);
                  fs.writeFileSync(expected.loc, result.code);
                }
              }
            }
          }
        },
      );
    });
  });
});
