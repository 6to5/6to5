import fs from "fs";
import path from "path";
import { parseSync } from "../lib";

function fixture(...args) {
  return path.join(__dirname, "fixtures", "parse", ...args);
}

describe("parseSync", function () {
  it("should parse using configuration from .babelrc when a filename is provided", function () {
    const input = fs.readFileSync(fixture("input.js"), "utf8");
    const output = require(fixture("output"));

    const result = parseSync(input, {
      filename: fixture("input.js"),
      cwd: fixture(),
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(output);
  });

  it("should parse using passed in configuration", function () {
    const input = fs.readFileSync(fixture("input.js"), "utf8");
    const output = require(fixture("output.json"));

    const result = parseSync(input, {
      parserOpts: {
        plugins: [["decorators", { decoratorsBeforeExport: false }]],
      },
      cwd: fixture(),
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual(output);
  });
});
