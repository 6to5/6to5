import * as babel from "../lib/index";
import buildExternalHelpers from "../lib/tools/build-external-helpers";
import sourceMap from "source-map";
import assert from "assert";
import Plugin from "../lib/config/plugin";
import generator from "babel-generator";

function assertIgnored(result) {
  assert.ok(!result);
}

function assertNotIgnored(result) {
  assert.ok(!result.ignored);
}

// shim
function transformAsync(code, opts) {
  return {
    then: function(resolve) {
      resolve(babel.transform(code, opts));
    },
  };
}

describe("parser and generator options", function() {
  const recast = {
    parse: function(code, opts) {
      return opts.parser.parse(code);
    },
    print: function(ast) {
      return generator(ast);
    },
  };

  function newTransform(string) {
    return babel.transform(string, {
      parserOpts: {
        parser: recast.parse,
        plugins: ["flow"],
        allowImportExportEverywhere: true,
      },
      generatorOpts: {
        generator: recast.print,
      },
    });
  }

  it("options", function() {
    const string = "original;";
    assert.deepEqual(newTransform(string).ast, babel.transform(string).ast);
    assert.equal(newTransform(string).code, string);
  });

  it("experimental syntax", function() {
    const experimental = "var a: number = 1;";

    assert.deepEqual(
      newTransform(experimental).ast,
      babel.transform(experimental, {
        parserOpts: {
          plugins: ["flow"],
        },
      }).ast,
    );
    assert.equal(newTransform(experimental).code, experimental);

    function newTransformWithPlugins(string) {
      return babel.transform(string, {
        plugins: [__dirname + "/../../babel-plugin-syntax-flow"],
        parserOpts: {
          parser: recast.parse,
        },
        generatorOpts: {
          generator: recast.print,
        },
      });
    }

    assert.deepEqual(
      newTransformWithPlugins(experimental).ast,
      babel.transform(experimental, {
        parserOpts: {
          plugins: ["flow"],
        },
      }).ast,
    );
    assert.equal(newTransformWithPlugins(experimental).code, experimental);
  });

  it("other options", function() {
    const experimental = "if (true) {\n  import a from 'a';\n}";

    assert.notEqual(
      newTransform(experimental).ast,
      babel.transform(experimental, {
        parserOpts: {
          allowImportExportEverywhere: true,
        },
      }).ast,
    );
    assert.equal(newTransform(experimental).code, experimental);
  });
});

describe("api", function() {
  it("analyze", function() {
    assert.equal(babel.analyse("foobar;").marked.length, 0);

    assert.equal(
      babel.analyse("foobar;", {
        plugins: [
          new Plugin({
            visitor: {
              Program: function(path) {
                path.mark("category", "foobar");
              },
            },
          }),
        ],
      }).marked[0].message,
      "foobar",
    );

    assert.equal(
      babel.analyse(
        "foobar;",
        {},
        {
          Program: function(path) {
            path.mark("category", "foobar");
          },
        },
      ).marked[0].message,
      "foobar",
    );
  });

  it("exposes the resolvePlugin method", function() {
    assert.throws(
      () => babel.resolvePlugin("nonexistent-plugin"),
      /Cannot find module 'babel-plugin-nonexistent-plugin'/,
    );
  });

  it("exposes the resolvePreset method", function() {
    assert.throws(
      () => babel.resolvePreset("nonexistent-preset"),
      /Cannot find module 'babel-preset-nonexistent-preset'/,
    );
  });

  it("transformFile", function(done) {
    babel.transformFile(
      __dirname + "/fixtures/api/file.js",
      {
        babelrc: false,
      },
      function(err, res) {
        if (err) return done(err);
        assert.equal(res.code, "foo();");
        done();
      },
    );
  });

  it("transformFileSync", function() {
    assert.equal(
      babel.transformFileSync(__dirname + "/fixtures/api/file.js", {
        babelrc: false,
      }).code,
      "foo();",
    );
  });

  it("options throw on falsy true", function() {
    return assert.throws(function() {
      babel.transform("", {
        plugins: [__dirname + "/../../babel-plugin-syntax-jsx", false],
      });
    }, /Error: \[BABEL\] unknown: Unexpected falsy value: false/);
  });

  it("options merge backwards", function() {
    return transformAsync("", {
      presets: [__dirname + "/../../babel-preset-es2015"],
      plugins: [__dirname + "/../../babel-plugin-syntax-jsx"],
    }).then(function(result) {
      assert.ok(
        result.options.plugins[0][0].manipulateOptions
          .toString()
          .indexOf("jsx") >= 0,
      );
    });
  });

  it("option wrapPluginVisitorMethod", function() {
    let calledRaw = 0;
    let calledIntercept = 0;

    babel.transform("function foo() { bar(foobar); }", {
      wrapPluginVisitorMethod: function(pluginAlias, visitorType, callback) {
        if (pluginAlias !== "foobar") {
          return callback;
        }

        assert.equal(visitorType, "enter");

        return function() {
          calledIntercept++;
          return callback.apply(this, arguments);
        };
      },

      plugins: [
        new Plugin({
          name: "foobar",
          visitor: {
            "Program|Identifier": function() {
              calledRaw++;
            },
          },
        }),
      ],
    });

    assert.equal(calledRaw, 4);
    assert.equal(calledIntercept, 4);
  });

  it("source map merging", function() {
    const result = babel.transform(
      [
        /* eslint-disable max-len */
        'function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }',
        "",
        "let Foo = function Foo() {",
        "  _classCallCheck(this, Foo);",
        "};",
        "",
        "//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0ZG91dCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFNLEdBQUcsWUFBSCxHQUFHO3dCQUFILEdBQUciLCJmaWxlIjoidW5kZWZpbmVkIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRm9vIHt9XG4iXX0=",
        /* eslint-enable max-len */
      ].join("\n"),
      {
        sourceMap: true,
      },
    );

    assert.deepEqual(
      [
        "function _classCallCheck(instance, Constructor) {",
        "  if (!(instance instanceof Constructor)) {",
        '    throw new TypeError("Cannot call a class as a function");',
        "  }",
        "}",
        "",
        "let Foo = function Foo() {",
        "  _classCallCheck(this, Foo);",
        "};",
      ].join("\n"),
      result.code,
    );

    const consumer = new sourceMap.SourceMapConsumer(result.map);

    assert.deepEqual(
      consumer.originalPositionFor({
        line: 7,
        column: 4,
      }),
      {
        name: null,
        source: "stdout",
        line: 1,
        column: 6,
      },
    );
  });

  it("code option false", function() {
    return transformAsync("foo('bar');", { code: false }).then(function(
      result,
    ) {
      assert.ok(!result.code);
    });
  });

  it("ast option false", function() {
    return transformAsync("foo('bar');", { ast: false }).then(function(result) {
      assert.ok(!result.ast);
    });
  });

  it("auxiliaryComment option", function() {
    return transformAsync("class Foo {}", {
      auxiliaryCommentBefore: "before",
      auxiliaryCommentAfter: "after",
      plugins: [
        function(babel) {
          const t = babel.types;
          return {
            visitor: {
              Program: function(path) {
                path.unshiftContainer(
                  "body",
                  t.expressionStatement(t.identifier("start")),
                );
                path.pushContainer(
                  "body",
                  t.expressionStatement(t.identifier("end")),
                );
              },
            },
          };
        },
      ],
    }).then(function(result) {
      assert.equal(
        result.code,
        "/*before*/\nstart;\n\n/*after*/\nclass Foo {}\n\n/*before*/\nend;\n\n/*after*/",
      );
    });
  });

  it("modules metadata", function() {
    return Promise.all([
      // eslint-disable-next-line max-len
      transformAsync(
        'import { externalName as localName } from "external";',
      ).then(function(result) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["externalName"],
          specifiers: [
            {
              kind: "named",
              imported: "externalName",
              local: "localName",
            },
          ],
        });
      }),

      transformAsync('import * as localName2 from "external";').then(function(
        result,
      ) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["*"],
          specifiers: [
            {
              kind: "namespace",
              local: "localName2",
            },
          ],
        });
      }),

      transformAsync('import localName3 from "external";').then(function(
        result,
      ) {
        assert.deepEqual(result.metadata.modules.imports[0], {
          source: "external",
          imported: ["default"],
          specifiers: [
            {
              kind: "named",
              imported: "default",
              local: "localName3",
            },
          ],
        });
      }),

      transformAsync('import localName from "./array";', {
        resolveModuleSource: function() {
          return "override-source";
        },
      }).then(function(result) {
        assert.deepEqual(result.metadata.modules.imports, [
          {
            source: "override-source",
            imported: ["default"],
            specifiers: [
              {
                kind: "named",
                imported: "default",
                local: "localName",
              },
            ],
          },
        ]);
      }),

      transformAsync('export * as externalName1 from "external";', {
        plugins: [require("../../babel-plugin-syntax-export-extensions")],
      }).then(function(result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName1"],
          specifiers: [
            {
              kind: "external-namespace",
              exported: "externalName1",
              source: "external",
            },
          ],
        });
      }),

      transformAsync('export externalName2 from "external";', {
        plugins: [require("../../babel-plugin-syntax-export-extensions")],
      }).then(function(result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName2"],
          specifiers: [
            {
              kind: "external",
              local: "externalName2",
              exported: "externalName2",
              source: "external",
            },
          ],
        });
      }),

      transformAsync("export function namedFunction() {}").then(function(
        result,
      ) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["namedFunction"],
          specifiers: [
            {
              kind: "local",
              local: "namedFunction",
              exported: "namedFunction",
            },
          ],
        });
      }),

      transformAsync('export var foo = "bar";').then(function(result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["foo"],
          specifiers: [
            {
              kind: "local",
              local: "foo",
              exported: "foo",
            },
          ],
        });
      }),

      transformAsync("export { localName as externalName3 };").then(function(
        result,
      ) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName3"],
          specifiers: [
            {
              kind: "local",
              local: "localName",
              exported: "externalName3",
            },
          ],
        });
      }),

      transformAsync('export { externalName4 } from "external";').then(function(
        result,
      ) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["externalName4"],
          specifiers: [
            {
              kind: "external",
              local: "externalName4",
              exported: "externalName4",
              source: "external",
            },
          ],
        });
      }),

      transformAsync('export * from "external";').then(function(result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: [],
          specifiers: [
            {
              kind: "external-all",
              source: "external",
            },
          ],
        });
      }),

      transformAsync(
        "export default function defaultFunction() {}",
      ).then(function(result) {
        assert.deepEqual(result.metadata.modules.exports, {
          exported: ["defaultFunction"],
          specifiers: [
            {
              kind: "local",
              local: "defaultFunction",
              exported: "default",
            },
          ],
        });
      }),
    ]);
  });

  it("ignore option", function() {
    return Promise.all([
      transformAsync("", {
        ignore: ["/foo"],
        filename: "/foo/node_modules/bar",
      }).then(assertIgnored),

      transformAsync("", {
        ignore: ["/foo/node_modules"],
        filename: "/foo/node_modules/bar",
      }).then(assertIgnored),

      transformAsync("", {
        ignore: ["/foo/node_modules/*"],
        filename: "/foo/node_modules/bar",
      }).then(assertIgnored),

      transformAsync("", {
        ignore: ["/foo/**/*"],
        filename: "/foo/node_modules/bar",
      }).then(assertIgnored),

      transformAsync("", {
        ignore: ["/foo/node_modules/*.bar"],
        filename: "/foo/node_modules/foo.bar",
      }).then(assertIgnored),

      transformAsync("", {
        ignore: ["/foo/node_modules/*.foo"],
        filename: "/foo/node_modules/foo.bar",
      }).then(assertNotIgnored),

      transformAsync("", {
        ignore: ["/bar/**/*"],
        filename: "/foo/node_modules/foo.bar",
      }).then(assertNotIgnored),
    ]);
  });

  it("only option", function() {
    return Promise.all([
      transformAsync("", {
        only: ["/foo"],
        filename: "/foo/node_modules/bar",
      }).then(assertNotIgnored),

      transformAsync("", {
        only: ["/foo/*"],
        filename: "/foo/node_modules/bar",
      }).then(assertNotIgnored),

      transformAsync("", {
        only: ["/foo/node_modules"],
        filename: "/foo/node_modules/bar",
      }).then(assertNotIgnored),

      transformAsync("", {
        only: ["/foo/node_modules/*.bar"],
        filename: "/foo/node_modules/foo.bar",
      }).then(assertNotIgnored),

      transformAsync("", {
        only: ["/foo/node_modules"],
        filename: "/foo/node_module/bar",
      }).then(assertIgnored),

      transformAsync("", {
        only: ["/foo/node_modules"],
        filename: "/bar/node_modules/foo",
      }).then(assertIgnored),

      transformAsync("", {
        only: ["/foo/node_modules/*.bar"],
        filename: "/foo/node_modules/bar.foo",
      }).then(assertIgnored),
    ]);
  });

  describe("env option", function() {
    const oldBabelEnv = process.env.BABEL_ENV;
    const oldNodeEnv = process.env.NODE_ENV;

    setup(function() {
      // Tests need to run with the default and specific values for these. They
      // need to be cleared for each test.
      delete process.env.BABEL_ENV;
      delete process.env.NODE_ENV;
    });

    suiteTeardown(function() {
      process.env.BABEL_ENV = oldBabelEnv;
      process.env.NODE_ENV = oldNodeEnv;
    });

    it("default", function() {
      const result = babel.transform("foo;", {
        env: {
          development: { code: false },
        },
      });

      assert.equal(result.code, undefined);
    });

    it("BABEL_ENV", function() {
      process.env.BABEL_ENV = "foo";
      const result = babel.transform("foo;", {
        env: {
          foo: { code: false },
        },
      });
      assert.equal(result.code, undefined);
    });

    it("NODE_ENV", function() {
      process.env.NODE_ENV = "foo";
      const result = babel.transform("foo;", {
        env: {
          foo: { code: false },
        },
      });
      assert.equal(result.code, undefined);
    });
  });

  it("resolveModuleSource option", function() {
    /* eslint-disable max-len */
    const actual =
      'import foo from "foo-import-default";\nimport "foo-import-bare";\nexport { foo } from "foo-export-named";';
    const expected =
      'import foo from "resolved/foo-import-default";\nimport "resolved/foo-import-bare";\nexport { foo } from "resolved/foo-export-named";';
    /* eslint-enable max-len */

    return transformAsync(actual, {
      resolveModuleSource: function(originalSource) {
        return "resolved/" + originalSource;
      },
    }).then(function(result) {
      assert.equal(result.code.trim(), expected);
    });
  });

  describe("buildExternalHelpers", function() {
    it("all", function() {
      const script = buildExternalHelpers();
      assert.ok(script.indexOf("classCallCheck") >= -1);
      assert.ok(script.indexOf("inherits") >= 0);
    });

    it("whitelist", function() {
      const script = buildExternalHelpers(["inherits"]);
      assert.ok(script.indexOf("classCallCheck") === -1);
      assert.ok(script.indexOf("inherits") >= 0);
    });

    it("empty whitelist", function() {
      const script = buildExternalHelpers([]);
      assert.ok(script.indexOf("classCallCheck") === -1);
      assert.ok(script.indexOf("inherits") === -1);
    });

    it("underscored", function() {
      const script = buildExternalHelpers(["typeof"]);
      assert.ok(script.indexOf("typeof") >= 0);
    });
  });
});
