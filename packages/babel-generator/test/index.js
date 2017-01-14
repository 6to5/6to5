const Whitespace = require("../lib/whitespace");
const Printer    = require("../lib/printer");
const generate   = require("../lib");
const assert     = require("assert");
const parse      = require("babylon").parse;
const chai       = require("chai");
const t          = require("babel-types");
const _          = require("lodash");
const fs         = require("fs");
const path       = require("path");

describe("generation", function () {
  it("completeness", function () {
    _.each(t.VISITOR_KEYS, function (keys, type) {
      assert.ok(!!Printer.prototype[type], type + " should exist");
    });

    _.each(Printer.prototype, function (fn, type) {
      if (!/[A-Z]/.test(type[0])) return;
      assert.ok(t.VISITOR_KEYS[type], type + " should not exist");
    });
  });

  it("multiple sources", function () {
    const sources = {
      "a.js": "function hi (msg) { console.log(msg); }\n",
      "b.js": "hi('hello');\n"
    };
    const parsed = _.keys(sources).reduce(function (_parsed, filename) {
      _parsed[filename] = parse(sources[filename], { sourceFilename: filename });
      return _parsed;
    }, {});

    const combinedAst = {
      "type": "File",
      "program": {
        "type": "Program",
        "sourceType": "module",
        "body": [].concat(parsed["a.js"].program.body, parsed["b.js"].program.body)
      }
    };

    const generated = generate.default(combinedAst, { sourceMaps: true }, sources);

    chai.expect(generated.map).to.deep.equal({
      version: 3,
      sources: [ "a.js", "b.js" ],
      mappings: "AAAA,SAASA,EAAT,CAAaC,GAAb,EAAkB;AAAEC,UAAQC,GAAR,CAAYF,GAAZ;AAAmB;;ACAvCD,GAAG,OAAH",
      names: [
        "hi",
        "msg",
        "console",
        "log",
      ],
      sourcesContent: [
        "function hi (msg) { console.log(msg); }\n",
        "hi('hello');\n"
      ]
    }, "sourcemap was incorrectly generated");

    chai.expect(generated.rawMappings).to.deep.equal([
      { name: undefined,
        generated: { line: 1, column: 0 },
        source: "a.js",
        original: { line: 1, column: 0 } },
      { name: "hi",
        generated: { line: 1, column: 9 },
        source: "a.js",
        original: { line: 1, column: 9 } },
      { name: undefined,
        generated: { line: 1, column: 11 },
        source: "a.js",
        original: { line: 1, column: 0 } },
      { name: "msg",
        generated: { line: 1, column: 12 },
        source: "a.js",
        original: { line: 1, column: 13 } },
      { name: undefined,
        generated: { line: 1, column: 15 },
        source: "a.js",
        original: { line: 1, column: 0 } },
      { name: undefined,
        generated: { line: 1, column: 17 },
        source: "a.js",
        original: { line: 1, column: 18 } },
      { name: "console",
        generated: { line: 2, column: 0 },
        source: "a.js",
        original: { line: 1, column: 20 } },
      { name: "log",
        generated: { line: 2, column: 10 },
        source: "a.js",
        original: { line: 1, column: 28 } },
      { name: undefined,
        generated: { line: 2, column: 13 },
        source: "a.js",
        original: { line: 1, column: 20 } },
      { name: "msg",
        generated: { line: 2, column: 14 },
        source: "a.js",
        original: { line: 1, column: 32 } },
      { name: undefined,
        generated: { line: 2, column: 17 },
        source: "a.js",
        original: { line: 1, column: 20 } },
      { name: undefined,
        generated: { line: 3, column: 0 },
        source: "a.js",
        original: { line: 1, column: 39 } },
      { name: "hi",
        generated: { line: 5, column: 0 },
        source: "b.js",
        original: { line: 1, column: 0 } },
      { name: undefined,
        generated: { line: 5, column: 3 },
        source: "b.js",
        original: { line: 1, column: 3 } },
      { name: undefined,
        generated: { line: 5, column: 10 },
        source: "b.js",
        original: { line: 1, column: 0 } },
    ], "raw mappings were incorrectly generated");

    chai.expect(generated.code).to.equal(
      "function hi(msg) {\n  console.log(msg);\n}\n\nhi('hello');",
      "code was incorrectly generated"
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
    id2.loc.identiferName = "bar";

    const generated = generate.default(ast, {
      filename: "inline",
      sourceFileName: "inline",
      sourceMaps: true
    }, code);

    chai.expect(generated.map).to.deep.equal({
      version: 3,
      sources: ["inline"],
      names: ["foo", "bar" ],
      mappings: "AAAA,SAASA,IAAT,GAAe;AAAEC;AAAM",
      sourcesContent: [ "function foo() { bar; }\n" ]
    }, "sourcemap was incorrectly generated");

    chai.expect(generated.rawMappings).to.deep.equal([
      { name: undefined,
        generated: { line: 1, column: 0 },
        source: "inline",
        original: { line: 1, column: 0 } },
      { name: "foo",
        generated: { line: 1, column: 9 },
        source: "inline",
        original: { line: 1, column: 9 } },
      { name: undefined,
        generated: { line: 1, column: 13 },
        source: "inline",
        original: { line: 1, column: 0 } },
      { name: undefined,
        generated: { line: 1, column: 16 },
        source: "inline",
        original: { line: 1, column: 15 } },
      { name: "bar",
        generated: { line: 2, column: 0 },
        source: "inline",
        original: { line: 1, column: 17 } },
      { name: undefined,
        generated: { line: 3, column: 0 },
        source: "inline",
        original: { line: 1, column: 23 } },
    ], "raw mappings were incorrectly generated");

    chai.expect(generated.code).to.equal(
      "function foo2() {\n  bar2;\n}",
      "code was incorrectly generated"
    );
  });

  it("lazy source map generation", function() {
    const code = "function hi (msg) { console.log(msg); }\n";

    const ast = parse(code, { filename: "a.js" }).program;
    const generated = generate.default(ast, {
      sourceFileName: "a.js",
      sourceMaps: true,
    });

    chai.expect(generated.rawMappings).to.be.an("array");

    chai.expect(generated).ownPropertyDescriptor("map").not.to.have.property("value");

    chai.expect(generated.map).to.be.an("object");
  });
});


describe("programmatic generation", function() {
  it("numeric member expression", function() {
    // Should not generate `0.foo`
    const mem = t.memberExpression(t.numericLiteral(60702), t.identifier("foo"));
    new Function(generate.default(mem).code);
  });

  it("nested if statements needs block", function() {
    const ifStatement = t.ifStatement(
      t.stringLiteral("top cond"),
      t.whileStatement(
        t.stringLiteral("while cond"),
        t.ifStatement(
          t.stringLiteral("nested"),
          t.expressionStatement(t.numericLiteral(1))
        )
      ),
      t.expressionStatement(t.stringLiteral("alt"))
    );

    const ast = parse(generate.default(ifStatement).code);
    assert.equal(ast.program.body[0].consequent.type, "BlockStatement");
  });

  it("prints directives in block with empty body", function() {
    const blockStatement = t.blockStatement(
      [],
      [t.directive(t.directiveLiteral("use strict"))]
    );

    const output = generate.default(blockStatement).code;
    assert.equal(output, [
      "{",
      "  \"use strict\";",
      "}"
    ].join("\n"));
  });

  it("flow object indentation", function() {
    const objectStatement = t.objectTypeAnnotation(
      [
        t.objectTypeProperty(
          t.identifier("bar"),
          t.stringTypeAnnotation()
        ),
      ],
      null,
      null
    );

    const output = generate.default(objectStatement).code;
    assert.equal(output, [
      "{",
      "  bar: string,",
      "}",
    ].join("\n"));
  });

  it("flow object indentation with empty leading ObjectTypeProperty", function() {
    const objectStatement = t.objectTypeAnnotation(
      [],
      [
        t.objectTypeIndexer(
          t.identifier("key"),
          t.anyTypeAnnotation(),
          t.identifier("Test"),
        ),
      ]
    );

    const output = generate.default(objectStatement).code;

    assert.equal(output, [
      "{",
      "  [key: any]: Test,",
      "}",
    ].join("\n"));
  });
});

describe("whitespace", function () {
  it("empty token list", function () {
    const w = new Whitespace([]);
    assert.equal(w.getNewlinesBefore(t.stringLiteral("1")), 0);
  });
});

const suites = require("babel-helper-fixtures").default(__dirname + "/fixtures");

suites.forEach(function (testSuite) {
  describe("generation/" + testSuite.title, function () {
    _.each(testSuite.tests, function (task) {
      it(task.title, !task.disabled && function () {
        const expect = task.expect;
        const actual = task.actual;
        const actualCode = actual.code;

        if (actualCode) {
          const actualAst = parse(actualCode, {
            filename: actual.loc,
            plugins: ["*"],
            strictMode: false,
            sourceType: "module",
          });
          const result = generate.default(actualAst, task.options, actualCode);

          if (!expect.code && result.code && fs.statSync(path.dirname(expect.loc)).isDirectory() && !process.env.CI) {
            console.log(`New test file created: ${expect.loc}`);
            fs.writeFileSync(expect.loc, result.code);
          } else {
            chai.expect(result.code).to.be.equal(expect.code, actual.loc + " !== " + expect.loc);
          }
        }
      });
    });
  });
});
