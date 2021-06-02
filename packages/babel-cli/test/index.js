import readdir from "fs-readdir-recursive";
import * as helper from "@babel/helper-fixtures";
import rimraf from "rimraf";
import { sync as makeDirSync } from "make-dir";
import child from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { jest } from "@jest/globals";

import { chmod } from "../lib/babel/util";

const require = createRequire(import.meta.url);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureLoc = path.join(dirname, "fixtures");
const tmpLoc = path.join(dirname, "tmp");
const rootDir = path.resolve(dirname, "../../..");

const fileFilter = function (x) {
  return x !== ".DS_Store";
};

const outputFileSync = function (filePath, data) {
  makeDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
};

const presetLocs = [path.join(rootDir, "./packages/babel-preset-react")];

const pluginLocs = [
  path.join(rootDir, "./packages/babel-plugin-transform-arrow-functions"),
  path.join(rootDir, "./packages/babel-plugin-transform-strict-mode"),
  path.join(rootDir, "./packages/babel-plugin-transform-modules-commonjs"),
].join(",");

const readDir = function (loc, filter) {
  const files = {};
  if (fs.existsSync(loc)) {
    readdir(loc, filter).forEach(function (filename) {
      files[filename] = helper.readFile(path.join(loc, filename));
    });
  }
  return files;
};

const saveInFiles = function (files) {
  // Place an empty .babelrc in each test so tests won't unexpectedly get to repo-level config.
  if (!fs.existsSync(".babelrc")) {
    outputFileSync(".babelrc", "{}");
  }

  Object.keys(files).forEach(function (filename) {
    const content = files[filename];
    outputFileSync(filename, content);
  });
};

function escapeRegExp(string) {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

const normalizeOutput = function (str, cwd) {
  let result = str
    .replace(/\(\d+ms\)/g, "(123ms)")
    .replace(new RegExp(escapeRegExp(cwd), "g"), "<CWD>")
    // (non-win32) /foo/babel/packages -> <CWD>/packages
    // (win32) C:\foo\babel\packages -> <CWD>\packages
    .replace(new RegExp(escapeRegExp(rootDir), "g"), "<ROOTDIR>");
  if (process.platform === "win32") {
    result = result
      // C:\\foo\\babel\\packages -> <CWD>\\packages (in js string literal)
      .replace(
        new RegExp(escapeRegExp(rootDir.replace(/\\/g, "\\\\")), "g"),
        "<ROOTDIR>",
      );
  }
  return result;
};

const assertTest = function (stdout, stderr, opts, cwd) {
  stdout = normalizeOutput(stdout, cwd);
  stderr = normalizeOutput(stderr, cwd);

  const expectStderr = opts.stderr.trim();
  stderr = stderr.trim();

  if (opts.stderr) {
    if (opts.stderrContains) {
      expect(stderr).toContain(expectStderr);
    } else {
      expect(stderr).toBe(expectStderr);
    }
  } else if (stderr) {
    throw new Error("stderr:\n" + stderr);
  }

  const expectStdout = opts.stdout.trim();
  stdout = stdout.trim();
  stdout = stdout.replace(/\\/g, "/");

  if (opts.stdout) {
    if (opts.stdoutContains) {
      expect(stdout).toContain(expectStdout);
    } else {
      fs.writeFileSync(opts.stdoutPath, stdout + "\n");
      expect(stdout).toBe(expectStdout);
    }
  } else if (stdout) {
    throw new Error("stdout:\n" + stdout);
  }

  if (opts.outFiles) {
    const actualFiles = readDir(tmpLoc, fileFilter);

    Object.keys(actualFiles).forEach(function (filename) {
      try {
        if (
          // saveInFiles always creates an empty .babelrc, so lets exclude for now
          filename !== ".babelrc" &&
          filename !== ".babelignore" &&
          !Object.prototype.hasOwnProperty.call(opts.inFiles, filename)
        ) {
          const expected = opts.outFiles[filename];
          const actual = actualFiles[filename];

          expect(actual).toBe(expected ?? "");
        }
      } catch (e) {
        e.message += "\n at " + filename;
        throw e;
      }
    });

    Object.keys(opts.outFiles).forEach(function (filename) {
      expect(actualFiles).toHaveProperty([filename]);
    });
  }
};

const buildTest = function (binName, testName, opts) {
  const binLoc = path.join(dirname, "../lib", binName);

  return function (callback) {
    saveInFiles(opts.inFiles);

    let args = [binLoc];

    if (binName !== "babel-external-helpers") {
      args.push("--presets", presetLocs, "--plugins", pluginLocs);
    }

    args = args.concat(opts.args);
    const env = { ...process.env, ...opts.env };

    const spawn = child.spawn(process.execPath, args, { env });

    let stderr = "";
    let stdout = "";

    spawn.stderr.on("data", function (chunk) {
      stderr += chunk;
    });

    spawn.stdout.on("data", function (chunk) {
      stdout += chunk;
    });

    spawn.on("close", function () {
      let err;

      try {
        assertTest(stdout, stderr, opts, tmpLoc);
      } catch (e) {
        err = e;
      }

      if (err) {
        err.message =
          args.map(arg => `"${arg}"`).join(" ") + ": " + err.message;
      }

      callback(err);
    });

    if (opts.stdin) {
      spawn.stdin.write(opts.stdin);
      spawn.stdin.end();
    }
  };
};

fs.readdirSync(fixtureLoc).forEach(function (binName) {
  if (binName.startsWith(".")) return;

  const suiteLoc = path.join(fixtureLoc, binName);
  describe("bin/" + binName, function () {
    let cwd;

    beforeEach(() => {
      cwd = process.cwd();

      if (fs.existsSync(tmpLoc)) {
        for (const child of fs.readdirSync(tmpLoc)) {
          rimraf.sync(path.join(tmpLoc, child));
        }
      } else {
        fs.mkdirSync(tmpLoc);
      }

      process.chdir(tmpLoc);
    });

    afterEach(() => {
      process.chdir(cwd);
    });

    fs.readdirSync(suiteLoc).forEach(function (testName) {
      if (testName.startsWith(".")) return;

      const testLoc = path.join(suiteLoc, testName);

      let opts = {
        args: [],
      };

      const optionsLoc = path.join(testLoc, "options.json");
      if (fs.existsSync(optionsLoc)) {
        const taskOpts = require(optionsLoc);
        if (taskOpts.os) {
          let os = taskOpts.os;

          if (!Array.isArray(os) && typeof os !== "string") {
            throw new Error(
              `'os' should be either string or string array: ${taskOpts.os}`,
            );
          }

          if (typeof os === "string") {
            os = [os];
          }

          if (!os.includes(process.platform)) {
            return;
          }

          delete taskOpts.os;
        }
        opts = { args: [], ...taskOpts };
      }

      ["stdout", "stdin", "stderr"].forEach(function (key) {
        const loc = path.join(testLoc, key + ".txt");
        opts[key + "Path"] = loc;
        if (fs.existsSync(loc)) {
          opts[key] = helper.readFile(loc);
        } else {
          opts[key] = opts[key] || "";
        }
      });

      opts.outFiles = readDir(path.join(testLoc, "out-files"), fileFilter);
      opts.inFiles = readDir(path.join(testLoc, "in-files"), fileFilter);

      const babelrcLoc = path.join(testLoc, ".babelrc");
      const babelIgnoreLoc = path.join(testLoc, ".babelignore");
      if (fs.existsSync(babelrcLoc)) {
        // copy .babelrc file to tmp directory
        opts.inFiles[".babelrc"] = helper.readFile(babelrcLoc);
        opts.inFiles[".babelignore"] = helper.readFile(babelIgnoreLoc);
      }
      if (fs.existsSync(babelIgnoreLoc)) {
        // copy .babelignore file to tmp directory
        opts.inFiles[".babelignore"] = helper.readFile(babelIgnoreLoc);
      }

      it(testName, buildTest(binName, testName, opts), 20000);
    });
  });
});

describe("util.js", () => {
  describe("chmod", () => {
    it("should warn the user if chmod fails", () => {
      const spyConsoleWarn = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // The first argument should be a string.
      // The real reason chmod will fail is due to wrong permissions,
      // but this is enough to cause a failure.
      chmod(100, "file.js");

      expect(spyConsoleWarn).toHaveBeenCalledTimes(1);
      expect(spyConsoleWarn).toHaveBeenCalledWith(
        "Cannot change permissions of file.js",
      );

      spyConsoleWarn.mockRestore();
    });
  });
});
