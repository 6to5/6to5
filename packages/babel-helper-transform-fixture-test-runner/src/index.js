/* eslint-env jest */
import * as babel from "@babel/core";
import { buildExternalHelpers } from "@babel/core";
import getFixtures from "@babel/helper-fixtures";
import sourceMap from "source-map";
import { codeFrameColumns } from "@babel/code-frame";
import defaults from "lodash/defaults";
import includes from "lodash/includes";
import escapeRegExp from "lodash/escapeRegExp";
import * as helpers from "./helpers";
import extend from "lodash/extend";
import merge from "lodash/merge";
import resolve from "resolve";
import assert from "assert";
import fs from "fs";
import path from "path";
import vm from "vm";
import checkDuplicatedNodes from "babel-check-duplicated-nodes";

import diff from "jest-diff";

const moduleCache = {};
const testContext = vm.createContext({
  ...helpers,
  process: process,
  transform: babel.transform,
  setTimeout: setTimeout,
  setImmediate: setImmediate,
  expect,
});
testContext.global = testContext;

// Initialize the test context with the polyfill, and then freeze the global to prevent implicit
// global creation in tests, which could cause things to bleed between tests.
runModuleInTestContext("@babel/polyfill", __filename);

// Populate the "babelHelpers" global with Babel's helper utilities.
runCodeInTestContext(buildExternalHelpers(), {
  filename: path.join(__dirname, "babel-helpers-in-memory.js"),
});

/**
 * A basic implementation of CommonJS so we can execute `@babel/polyfill` inside our test context.
 * This allows us to run our unittests
 */
function runModuleInTestContext(id: string, relativeFilename: string) {
  const filename = resolve.sync(id, {
    basedir: path.dirname(relativeFilename),
  });

  // Expose Node-internal modules if the tests want them. Note, this will not execute inside
  // the context's global scope.
  if (filename === id) return require(id);

  if (moduleCache[filename]) return moduleCache[filename].exports;

  const module = (moduleCache[filename] = {
    id: filename,
    exports: {},
  });
  const dirname = path.dirname(filename);
  const req = id => runModuleInTestContext(id, filename);

  const src = fs.readFileSync(filename, "utf8");
  const code = `(function (exports, require, module, __filename, __dirname) {${src}\n});`;

  vm.runInContext(code, testContext, {
    filename,
    displayErrors: true,
  }).call(module.exports, module.exports, req, module, filename, dirname);

  return module.exports;
}

/**
 * Run the given snippet of code inside a CommonJS module.
 *
 * Exposed for unit tests, not for use as an API.
 */
export function runCodeInTestContext(code: string, opts: { filename: string }) {
  const filename = opts.filename;
  const dirname = path.dirname(filename);
  const req = id => runModuleInTestContext(id, filename);

  const module = {
    id: filename,
    exports: {},
  };

  const oldCwd = process.cwd();
  try {
    if (opts.filename) process.chdir(path.dirname(opts.filename));

    // Expose the test options as "opts", but otherwise run the test in a CommonJS-like environment.
    // Note: This isn't doing .call(module.exports, ...) because some of our tests currently
    // rely on 'this === global'.
    const src = `(function(exports, require, module, __filename, __dirname, opts) {${code}\n});`;
    return vm.runInContext(src, testContext, {
      filename,
      displayErrors: true,
    })(module.exports, req, module, filename, dirname, opts);
  } finally {
    process.chdir(oldCwd);
  }
}

function wrapPackagesArray(type, names, optionsDir) {
  return (names || []).map(function(val) {
    if (typeof val === "string") val = [val];

    // relative path (outside of monorepo)
    if (val[0][0] === ".") {
      if (!optionsDir) {
        throw new Error(
          "Please provide an options.json in test dir when using a " +
            "relative plugin path.",
        );
      }

      val[0] = path.resolve(optionsDir, val[0]);
    } else {
      const monorepoPath = __dirname + "/../../babel-" + type + "-" + val[0];

      if (fs.existsSync(monorepoPath)) {
        val[0] = monorepoPath;
      }
    }

    return val;
  });
}

function run(task) {
  const actual = task.actual;
  const expected = task.expect;
  const exec = task.exec;
  const opts = task.options;
  const optionsDir = task.optionsDir;

  function getOpts(self) {
    const newOpts = merge(
      {
        cwd: path.dirname(self.loc),
        filename: self.loc,
        filenameRelative: self.filename,
        sourceFileName: self.filename,
        sourceType: "script",
        babelrc: false,
        inputSourceMap: task.inputSourceMap || undefined,
      },
      opts,
    );

    newOpts.plugins = wrapPackagesArray("plugin", newOpts.plugins, optionsDir);
    newOpts.presets = wrapPackagesArray(
      "preset",
      newOpts.presets,
      optionsDir,
    ).map(function(val) {
      if (val.length > 3) {
        throw new Error(
          "Unexpected extra options " +
            JSON.stringify(val.slice(3)) +
            " passed to preset.",
        );
      }

      return val;
    });

    return newOpts;
  }

  let execCode = exec.code;
  let result;
  let resultExec;

  if (execCode) {
    const execOpts = getOpts(exec);
    result = babel.transform(execCode, execOpts);
    checkDuplicatedNodes(babel, result.ast);
    execCode = result.code;

    try {
      resultExec = runCodeInTestContext(execCode, execOpts);
    } catch (err) {
      // Pass empty location to include the whole file in the output.
      err.message =
        `${exec.loc}: ${err.message}\n` + codeFrameColumns(execCode, {});
      throw err;
    }
  }

  let actualCode = actual.code;
  const expectCode = expected.code;
  if (!execCode || actualCode) {
    result = babel.transform(actualCode, getOpts(actual));
    const expectedCode = result.code.replace(
      new RegExp(escapeRegExp(path.resolve(__dirname, "../../../"))),
      "<CWD>",
    );

    checkDuplicatedNodes(babel, result.ast);
    if (
      !expected.code &&
      expectedCode &&
      !opts.throws &&
      fs.statSync(path.dirname(expected.loc)).isDirectory() &&
      !process.env.CI
    ) {
      const expectedFile = expected.loc.replace(
        /\.m?js$/,
        result.sourceType === "module" ? ".mjs" : ".js",
      );

      console.log(`New test file created: ${expectedFile}`);
      fs.writeFileSync(expectedFile, `${expectedCode}\n`);

      if (expected.loc !== expectedFile) {
        try {
          fs.unlinkSync(expected.loc);
        } catch (e) {}
      }
    } else {
      actualCode = expectedCode.trim();
      try {
        expect(actualCode).toEqualFile({
          filename: expected.loc,
          code: expectCode,
        });
      } catch (e) {
        if (!process.env.OVERWRITE) throw e;

        console.log(`Updated test file: ${expected.loc}`);
        fs.writeFileSync(expected.loc, `${expectedCode}\n`);
      }

      if (actualCode) {
        expect(expected.loc).toMatch(
          result.sourceType === "module" ? /\.mjs$/ : /\.js$/,
        );
      }
    }
  }

  if (task.sourceMap) {
    expect(result.map).toEqual(task.sourceMap);
  }

  if (task.sourceMappings) {
    const consumer = new sourceMap.SourceMapConsumer(result.map);

    task.sourceMappings.forEach(function(mapping) {
      const actual = mapping.original;

      const expected = consumer.originalPositionFor(mapping.generated);
      expect({ line: expected.line, column: expected.column }).toEqual(actual);
    });
  }

  if (execCode && resultExec) {
    return resultExec;
  }
}

const toEqualFile = () => ({
  compare: (actual, { filename, code }) => {
    const pass = actual === code;
    return {
      pass,
      message: () => {
        const diffString = diff(code, actual, {
          expand: false,
        });
        return (
          `Expected ${filename} to match transform output.\n` +
          `To autogenerate a passing version of this file, delete the file and re-run the tests.\n\n` +
          `Diff:\n\n${diffString}`
        );
      },
    };
  },
  negativeCompare: () => {
    throw new Error("Negation unsupported");
  },
});

export default function(
  fixturesLoc: string,
  name: string,
  suiteOpts = {},
  taskOpts = {},
  dynamicOpts?: Function,
) {
  const suites = getFixtures(fixturesLoc);

  for (const testSuite of suites) {
    if (includes(suiteOpts.ignoreSuites, testSuite.title)) continue;

    describe(name + "/" + testSuite.title, function() {
      jest.addMatchers({
        toEqualFile,
      });

      for (const task of testSuite.tests) {
        if (
          includes(suiteOpts.ignoreTasks, task.title) ||
          includes(suiteOpts.ignoreTasks, testSuite.title + "/" + task.title)
        ) {
          continue;
        }

        const testFn = task.disabled ? it.skip : it;

        testFn(
          task.title,

          function() {
            function runTask() {
              run(task);
            }

            defaults(task.options, {
              sourceMap: !!(task.sourceMappings || task.sourceMap),
            });

            extend(task.options, taskOpts);

            if (dynamicOpts) dynamicOpts(task.options, task);

            const throwMsg = task.options.throws;
            if (throwMsg) {
              // internal api doesn't have this option but it's best not to pollute
              // the options object with useless options
              delete task.options.throws;

              assert.throws(runTask, function(err) {
                return throwMsg === true || err.message.indexOf(throwMsg) >= 0;
              });
            } else {
              if (task.exec.code) {
                const result = run(task);
                if (result && typeof result.then === "function") {
                  return result;
                }
              } else {
                runTask();
              }
            }
          },
        );
      }
    });
  }
}
