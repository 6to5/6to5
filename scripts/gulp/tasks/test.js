"use strict";
const { spawn } = require("child_process");

module.exports = function test() {
  const nodeArgs = [];
  const jestArgs = [];

  if (process.env.CI) {
    jestArgs.push("--maxWorkers=4");
    jestArgs.push("--ci");
  } else {
    if (process.env.TEST_DEBUG) {
      nodeArgs.push("--inspect-brk");
      jestArgs.push("--runInBand");
    }

    if (process.env.TEST_GREP) {
      jestArgs.push("-t");
      jestArgs.push(`"process.env.TEST_GREP"`);
    }

    if (process.env.TEST_ONLY) {
      jestArgs.push(`"(packages|codemods)/.*${process.env.TEST_ONLY}.*/test"`);
    }
  }

  const child = spawn(
    "node",
    [...nodeArgs, "node_modules/jest/bin/jest.js", ...jestArgs],
    { stdio: "inherit" }
  );

  return child;
};
