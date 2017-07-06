import assert from "assert";
import path from "path";
import buildConfigChain from "../lib/config/build-config-chain";

function fixture() {
  const args = [__dirname, "fixtures", "config"];
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return path.join.apply(path, args);
}

function base() {
  return process.cwd();
}

describe("buildConfigChain", function() {
  let oldBabelEnv;
  let oldNodeEnv;

  beforeEach(function() {
    oldBabelEnv = process.env.BABEL_ENV;
    oldNodeEnv = process.env.NODE_ENV;

    delete process.env.BABEL_ENV;
    delete process.env.NODE_ENV;
  });

  afterEach(function() {
    process.env.BABEL_ENV = oldBabelEnv;
    process.env.NODE_ENV = oldNodeEnv;
  });

  describe("ignore/only", () => {
    // TODO: More tests for ignore and only

    it("should ignore files that match", () => {
      const chain = buildConfigChain({
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        ignore: [
          fixture("nonexistant-fake", "src.js"),

          // We had a regression where multiple ignore patterns broke things, so
          // we keep some extra random items in here.
          fixture("nonexistant-fake", "other.js"),
          fixture("nonexistant-fake", "misc.js"),
        ],
      });

      assert.equal(chain, null);
    });
  });

  it("dir1", function() {
    const chain = buildConfigChain({
      filename: fixture("dir1", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          plugins: ["extended"],
        },
        alias: fixture("extended.babelrc.json"),
        loc: fixture("extended.babelrc.json"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["root"],
        },
        alias: fixture(".babelrc"),
        loc: fixture(".babelrc"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("dir1", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("dir2", function() {
    const chain = buildConfigChain({
      filename: fixture("dir2", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["dir2"],
        },
        alias: fixture("dir2", ".babelrc"),
        loc: fixture("dir2", ".babelrc"),
        dirname: fixture("dir2"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("dir2", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("dir3", function() {
    const chain = buildConfigChain({
      filename: fixture("dir3", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          plugins: ["extended"],
        },
        alias: fixture("extended.babelrc.json"),
        loc: fixture("extended.babelrc.json"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["root"],
        },
        alias: fixture(".babelrc"),
        loc: fixture(".babelrc"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("dir3", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("env - base", function() {
    const chain = buildConfigChain({
      filename: fixture("env", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["env-base"],
        },
        alias: fixture("env", ".babelrc"),
        loc: fixture("env", ".babelrc"),
        dirname: fixture("env"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("env", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("env - foo", function() {
    process.env.NODE_ENV = "foo";

    const chain = buildConfigChain({
      filename: fixture("env", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["env-base"],
        },
        alias: fixture("env", ".babelrc"),
        loc: fixture("env", ".babelrc"),
        dirname: fixture("env"),
      },
      {
        type: "options",
        options: {
          plugins: ["env-foo"],
        },
        alias: fixture("env", ".babelrc.env.foo"),
        loc: fixture("env", ".babelrc.env.foo"),
        dirname: fixture("env"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("env", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("env - bar", function() {
    process.env.NODE_ENV = "foo"; // overridden
    process.env.NODE_ENV = "bar";

    const chain = buildConfigChain({
      filename: fixture("env", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["env-base"],
        },
        alias: fixture("env", ".babelrc"),
        loc: fixture("env", ".babelrc"),
        dirname: fixture("env"),
      },
      {
        type: "options",
        options: {
          plugins: ["env-bar"],
        },
        alias: fixture("env", ".babelrc.env.bar"),
        loc: fixture("env", ".babelrc.env.bar"),
        dirname: fixture("env"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("env", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("env - foo", function() {
    process.env.NODE_ENV = "foo";

    const chain = buildConfigChain({
      filename: fixture("pkg", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          plugins: ["pkg-plugin"],
        },
        alias: fixture("pkg", "package.json"),
        loc: fixture("pkg", "package.json"),
        dirname: fixture("pkg"),
      },
      {
        type: "options",
        options: {
          ignore: ["pkg-ignore"],
        },
        alias: fixture("pkg", ".babelignore"),
        loc: fixture("pkg", ".babelignore"),
        dirname: fixture("pkg"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("pkg", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("js-config", function() {
    const chain = buildConfigChain({
      filename: fixture("js-config", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["foo", "bar"],
        },
        alias: fixture("js-config", ".babelrc.js"),
        loc: fixture("js-config", ".babelrc.js"),
        dirname: fixture("js-config"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("js-config", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("js-config-function", function() {
    const chain = buildConfigChain({
      filename: fixture("js-config-function", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          compact: true,
        },
        alias: fixture("js-config-function", ".babelrc.js"),
        loc: fixture("js-config-function", ".babelrc.js"),
        dirname: fixture("js-config-function"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("js-config-function", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it("js-config-default - should read transpiled export default", function() {
    const chain = buildConfigChain({
      filename: fixture("js-config-default", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["foo", "bar"],
        },
        alias: fixture("js-config-default", ".babelrc.js"),
        loc: fixture("js-config-default", ".babelrc.js"),
        dirname: fixture("js-config-default"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("js-config-default", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });
  it("js-config-extended", function() {
    const chain = buildConfigChain({
      filename: fixture("js-config-extended", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["extended"],
        },
        alias: fixture("extended.babelrc.json"),
        loc: fixture("extended.babelrc.json"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          plugins: ["foo", "bar"],
        },
        alias: fixture("js-config-extended", ".babelrc.js"),
        loc: fixture("js-config-extended", ".babelrc.js"),
        dirname: fixture("js-config-extended"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("js-config-extended", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);
  });

  it(
    "json-pkg-config-no-babel - should not throw if" +
      " package.json doesn't contain a `babel` field",
    function() {
      const chain = buildConfigChain({
        filename: fixture("json-pkg-config-no-babel", "src.js"),
      });

      const expected = [
        {
          type: "options",
          options: {
            ignore: ["root-ignore"],
          },
          alias: fixture(".babelignore"),
          loc: fixture(".babelignore"),
          dirname: fixture(),
        },
        {
          type: "options",
          options: {
            plugins: ["json"],
          },
          alias: fixture("json-pkg-config-no-babel", ".babelrc"),
          loc: fixture("json-pkg-config-no-babel", ".babelrc"),
          dirname: fixture("json-pkg-config-no-babel"),
        },
        {
          type: "arguments",
          options: {
            filename: fixture("json-pkg-config-no-babel", "src.js"),
          },
          alias: "base",
          loc: "base",
          dirname: base(),
        },
      ];

      assert.deepEqual(chain, expected);
    },
  );

  it("should not ignore file matching negated file pattern", function() {
    const chain = buildConfigChain({
      filename: fixture("ignore-negate", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          ignore: ["*", "!src.js"],
        },
        alias: fixture("ignore-negate", ".babelrc"),
        loc: fixture("ignore-negate", ".babelrc"),
        dirname: fixture("ignore-negate"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("ignore-negate", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);

    const chain2 = buildConfigChain({
      filename: fixture("ignore-negate", "src2.js"),
    });

    assert.equal(chain2, null);
  });

  it("should not ignore file matching negated folder pattern", function() {
    const chain = buildConfigChain({
      filename: fixture("ignore-negate-folder", "folder", "src.js"),
    });

    const expected = [
      {
        type: "options",
        options: {
          ignore: ["root-ignore"],
        },
        alias: fixture(".babelignore"),
        loc: fixture(".babelignore"),
        dirname: fixture(),
      },
      {
        type: "options",
        options: {
          ignore: ["*", "!folder"],
        },
        alias: fixture("ignore-negate-folder", ".babelrc"),
        loc: fixture("ignore-negate-folder", ".babelrc"),
        dirname: fixture("ignore-negate-folder"),
      },
      {
        type: "arguments",
        options: {
          filename: fixture("ignore-negate-folder", "folder", "src.js"),
        },
        alias: "base",
        loc: "base",
        dirname: base(),
      },
    ];

    assert.deepEqual(chain, expected);

    const chain2 = buildConfigChain({
      filename: fixture("ignore-negate-folder", "src2.js"),
    });

    assert.equal(chain2, null);
  });

  it(
    "js-json-config - should throw an error if both a .babelrc" +
      " and a .babelrc.js are present",
    function() {
      assert.throws(function() {
        buildConfigChain({
          filename: fixture("js-json-config", "src.js"),
        });
      }, /Multiple configuration files found\.(.|\n)*\.babelrc(.|\n)*\.babelrc\.js/);
    },
  );

  it(
    "js-pkg-config - should throw an error if both a .babelrc.js" +
      " and a package.json with a babel field are present",
    function() {
      assert.throws(function() {
        buildConfigChain({
          filename: fixture("js-pkg-config", "src.js"),
        });
      }, /Multiple configuration files found\.(.|\n)*\.babelrc\.js(.|\n)*package\.json/);
    },
  );

  it(
    "json-pkg-config - should throw an error if both a .babelrc" +
      " and a package.json with a babel field are present",
    function() {
      assert.throws(function() {
        buildConfigChain({
          filename: fixture("json-pkg-config", "src.js"),
        });
      }, /Multiple configuration files found\.(.|\n)*\.babelrc(.|\n)*package\.json/);
    },
  );

  it("js-config-error", function() {
    assert.throws(function() {
      buildConfigChain({
        filename: fixture("js-config-error", "src.js"),
      });
    }, /Error while loading config/);
  });

  it("js-config-error2", function() {
    assert.throws(function() {
      buildConfigChain({
        filename: fixture("js-config-error2", "src.js"),
      });
    }, /Configuration should be an exported JavaScript object/);
  });

  it("js-config-error3", function() {
    assert.throws(function() {
      buildConfigChain({
        filename: fixture("js-config-error3", "src.js"),
      });
    }, /Configuration should be an exported JavaScript object/);
  });

  it("json-config-error", function() {
    assert.throws(function() {
      buildConfigChain({
        filename: fixture("json-config-error", "src.js"),
      });
    }, /Error while parsing config/);
  });
});
