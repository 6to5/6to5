import * as babel from "..";

function expectError(run) {
  try {
    run();
  } catch (e) {
    return expect(
      e.stack
        .split(process.cwd())
        .join("<CWD>")
        // Remove jest-related stack frames
        .replace(
          /(?:\n\s*at[^\n]+?node_modules\/jest[^\n]+)+/g,
          "\n    <internal jest frames>",
        ),
    );
  }
  throw new Error("It should have thrown an error.");
}

describe("@babel/core errors", function() {
  it("error inside config function", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/error-config-function",
      });
    }).toMatchInlineSnapshot(`
      "Error: Error inside config!
          at myConfig (<CWD>/packages/babel-core/test/fixtures/errors/error-config-function/babel.config.js:2:9)
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:24:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:23:5)
          <internal jest frames>
          at new Promise (<anonymous>)
          <internal jest frames>"
    `);
  });

  it("error inside config function with more frames", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/error-config-function-more-frames",
      });
    }).toMatchInlineSnapshot(`
      "Error: Error inside config!
          at f (<CWD>/packages/babel-core/test/fixtures/errors/error-config-function-more-frames/babel.config.js:6:9)
          at g (<CWD>/packages/babel-core/test/fixtures/errors/error-config-function-more-frames/babel.config.js:10:3)
          at myConfig (<CWD>/packages/babel-core/test/fixtures/errors/error-config-function-more-frames/babel.config.js:2:3)
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:42:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:41:5)
          <internal jest frames>
          at new Promise (<anonymous>)"
    `);
  });

  it("error inside config file", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/error-config-file",
      });
    }).toMatchInlineSnapshot(`
      "Error: Error inside config!
          at Object.<anonymous> (<CWD>/packages/babel-core/test/fixtures/errors/error-config-file/babel.config.js:4:7)
          <internal jest frames>
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:61:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:60:5)
          <internal jest frames>"
    `);
  });

  it("error inside config file with more frames", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/error-config-file-more-frames",
      });
    }).toMatchInlineSnapshot(`
      "Error: Error inside config!
          at f (<CWD>/packages/babel-core/test/fixtures/errors/error-config-file-more-frames/babel.config.js:7:9)
          at g (<CWD>/packages/babel-core/test/fixtures/errors/error-config-file-more-frames/babel.config.js:11:3)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/fixtures/errors/error-config-file-more-frames/babel.config.js:1:90)
          <internal jest frames>
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:78:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)"
    `);
  });

  it("invalid JSON config file", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/invalid-json",
      });
    }).toMatchInlineSnapshot(`
      "Error: Error while parsing config - JSON5: invalid character '}' at 3:1
          at <CWD>/packages/babel-core/test/fixtures/errors/invalid-json/babel.config.json
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:24:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:23:5)
          <internal jest frames>
          at new Promise (<anonymous>)
          <internal jest frames>"
    `);
  });

  it("use 'exclude' without filename", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/use-exclude",
      });
    }).toMatchInlineSnapshot(`
      "Error: Configuration contains string/RegExp pattern, but no filename was passed to Babel
          at <CWD>/packages/babel-core/test/fixtures/errors/use-exclude/babel.config.js
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:24:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:23:5)
          <internal jest frames>
          at new Promise (<anonymous>)
          <internal jest frames>"
    `);
  });

  it("invalid option", function() {
    expectError(() => {
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/invalid-option",
      });
    }).toMatchInlineSnapshot(`
      "Error: .sourceType must be \\"module\\", \\"script\\", \\"unambiguous\\", or undefined
          at <CWD>/packages/babel-core/test/fixtures/errors/invalid-option/babel.config.json
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:24:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:23:5)
          <internal jest frames>
          at new Promise (<anonymous>)
          <internal jest frames>"
    `);
  });

  it("invalid option in programmatic options", function() {
    expectError(() =>
      babel.parseSync("foo;", {
        root: __dirname + "/fixtures/errors/valid",
        sourceType: "foo",
      }),
    ).toMatchInlineSnapshot(`
      "Error: .sourceType must be \\"module\\", \\"script\\", \\"unambiguous\\", or undefined
          at Object.parseSync (<CWD>/packages/babel-core/lib/parse.js:53:54)
          at run (<CWD>/packages/babel-core/test/errors-stacks.js:24:13)
          at expectError (<CWD>/packages/babel-core/test/errors-stacks.js:5:5)
          at Object.<anonymous> (<CWD>/packages/babel-core/test/errors-stacks.js:23:5)
          <internal jest frames>
          at new Promise (<anonymous>)
          <internal jest frames>
          at processTicksAndRejections (internal/process/task_queues.js:97:5)"
    `);
  });
});
