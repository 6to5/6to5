const readdir = require("fs-readdir-recursive");
const helper = require("@babel/helper-fixtures");
const rimraf = require("rimraf");
const { sync: makeDirSync } = require("make-dir");
const child = require("child_process");
const merge = require("lodash/merge");
const path = require("path");
const fs = require("fs");

const fixtureLoc = path.join(__dirname, "fixtures");
const tmpLoc = path.join(__dirname, "tmp");

const fileFilter = function(x) {
  return x !== ".DS_Store";
};

const outputFileSync = function(filePath, data) {
  makeDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
};

const presetLocs = [path.join(__dirname, "../../babel-preset-react")];

const pluginLocs = [
  path.join(__dirname, "/../../babel-plugin-transform-arrow-functions"),
  path.join(__dirname, "/../../babel-plugin-transform-strict-mode"),
  path.join(__dirname, "/../../babel-plugin-transform-modules-commonjs"),
].join(",");

const readDir = function(loc, filter) {
  const files = {};
  if (fs.existsSync(loc)) {
    readdir(loc, filter).forEach(function(filename) {
      files[filename] = helper.readFile(path.join(loc, filename));
    });
  }
  return files;
};

const saveInFiles = function(files) {
  // Place an empty .babelrc in each test so tests won't unexpectedly get to repo-level config.
  if (!fs.existsSync(".babelrc")) {
    outputFileSync(".babelrc", "{}");
  }

  Object.keys(files).forEach(function(filename) {
    const content = files[filename];
    outputFileSync(filename, content);
  });
};

const replacePaths = function(str, cwd) {
  let prev;
  do {
    prev = str;
    str = str.replace(cwd, "<CWD>");
  } while (str !== prev);

  return str;
};

const assertTest = function(stdout, stderr, opts, cwd) {
  stdout = replacePaths(stdout, cwd);
  stderr = replacePaths(stderr, cwd);

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
      expect(stdout).toBe(expectStdout);
    }
  } else if (stdout) {
    throw new Error("stdout:\n" + stdout);
  }

  if (opts.outFiles) {
    const actualFiles = readDir(tmpLoc, fileFilter);

    Object.keys(actualFiles).forEach(function(filename) {
      if (
        // saveInFiles always creates an empty .babelrc, so lets exclude for now
        filename !== ".babelrc" &&
        filename !== ".babelignore" &&
        !Object.prototype.hasOwnProperty.call(opts.inFiles, filename)
      ) {
        const expected = opts.outFiles[filename];
        const actual = actualFiles[filename];

        expect(expected).not.toBeUndefined();

        if (expected) {
          try {
            expect(actual).toBe(expected);
          } catch (e) {
            if (!process.env.OVERWRITE) throw e;

            const fullFileName = path.join(opts.testLoc, "out-files", filename);
            console.log(`Updated test file: ${fullFileName}`);
            fs.writeFileSync(fullFileName, `${actual}\n`);
          }
        }
      }
    });

    Object.keys(opts.outFiles).forEach(function(filename) {
      expect(actualFiles).toHaveProperty([filename]);
    });
  }
};

const buildTest = function(binName, testName, opts) {
  const binLoc = path.join(__dirname, "../lib", binName);

  return function(callback) {
    saveInFiles(opts.inFiles);

    let args = [binLoc];

    if (binName !== "babel-external-helpers") {
      args.push("--presets", presetLocs, "--plugins", pluginLocs);
    }

    args = args.concat(opts.args);

    const spawn = child.spawn(process.execPath, args);

    let stderr = "";
    let stdout = "";

    spawn.stderr.on("data", function(chunk) {
      stderr += chunk;
    });

    spawn.stdout.on("data", function(chunk) {
      stdout += chunk;
    });

    spawn.on("close", function() {
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

fs.readdirSync(fixtureLoc).forEach(function(binName) {
  if (binName.startsWith(".")) return;

  const suiteLoc = path.join(fixtureLoc, binName);
  describe("bin/" + binName, function() {
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

    fs.readdirSync(suiteLoc).forEach(function(testName) {
      if (testName.startsWith(".")) return;

      const testLoc = path.join(suiteLoc, testName);

      const opts = {
        testLoc,
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
        merge(opts, taskOpts);
      }

      ["stdout", "stdin", "stderr"].forEach(function(key) {
        const loc = path.join(testLoc, key + ".txt");
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
