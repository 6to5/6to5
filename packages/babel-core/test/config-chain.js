import cp from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import util from "util";
import escapeRegExp from "lodash/escapeRegExp";
import * as babel from "../lib";

// "minNodeVersion": "10.0.0" <-- For Ctrl+F when dropping node 10
const supportsESM = parseInt(process.versions.node) >= 12;

const isMJS = file => path.extname(file) === ".mjs";

const skipUnsupportedESM = (esm, name) => {
  if (esm && !supportsESM) {
    console.warn(
      `Skipping "${name}" because native ECMAScript modules are not supported.`,
    );
    return true;
  }
  // This can be removed when loadOptionsAsyncInSpawedProcess is removed.
  if (esm && process.platform === "win32") {
    console.warn(
      `Skipping "${name}" because the ESM runner cannot be spawned on Windows.`,
    );
    return true;
  }
  return false;
};

// TODO: In Babel 8, we can directly uses fs.promises which is supported by
// node 8+
const pfs =
  fs.promises ??
  new Proxy(fs, {
    get(target, name) {
      if (name === "copyFile") {
        // fs.copyFile is only supported since node 8.5
        // https://stackoverflow.com/a/30405105/2359289
        return function copyFile(source, target) {
          const rd = fs.createReadStream(source);
          const wr = fs.createWriteStream(target);
          return new Promise(function (resolve, reject) {
            rd.on("error", reject);
            wr.on("error", reject);
            wr.on("finish", resolve);
            rd.pipe(wr);
          }).catch(function (error) {
            rd.destroy();
            wr.end();
            throw error;
          });
        };
      }

      return (...args) =>
        new Promise((resolve, reject) =>
          target[name](...args, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }),
        );
    },
  });

function fixture(...args) {
  return path.join(__dirname, "fixtures", "config", ...args);
}

function loadOptions(opts) {
  return babel.loadOptions({ cwd: __dirname, ...opts });
}

function loadOptionsAsync({ filename, cwd = __dirname }, mjs) {
  if (mjs) {
    // import() crashes with jest
    return loadOptionsAsyncInSpawedProcess({ filename, cwd });
  }

  return babel.loadOptionsAsync({ filename, cwd });
}

// !!!! hack is coming !!!!
// Remove this function when https://github.com/nodejs/node/issues/35889 is resolved.
// Jest supports dynamic import(), but Node.js segfaults when using it in our tests.
async function loadOptionsAsyncInSpawedProcess({ filename, cwd }) {
  const { stdout, stderr } = await util.promisify(cp.execFile)(
    require.resolve("./fixtures/babel-load-options-async.mjs"),
    // pass `cwd` as params as `process.cwd()` will normalize `cwd` on macOS
    [filename, cwd],
    {
      cwd,
      env: process.env,
    },
  );

  const EXPERIMENTAL_WARNING = /\(node:\d+\) ExperimentalWarning: The ESM module loader is experimental\./;

  if (stderr.replace(EXPERIMENTAL_WARNING, "").trim()) {
    throw new Error(
      "error is thrown in babel-load-options-async.mjs: stdout\n" +
        stdout +
        "\nstderr:\n" +
        stderr,
    );
  }
  return JSON.parse(stdout);
}

function pairs(items) {
  const pairs = [];
  for (let i = 0; i < items.length - 1; i++) {
    for (let j = i + 1; j < items.length; j++) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}

async function getTemp(name) {
  const cwd = await pfs.mkdtemp(os.tmpdir() + path.sep + name);
  const tmp = name => path.join(cwd, name);
  const config = name =>
    pfs.copyFile(fixture("config-files-templates", name), tmp(name));
  return { cwd, tmp, config };
}

describe("buildConfigChain", function () {
  describe("test", () => {
    describe("single", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: fixture("nonexistant-fake"),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: new RegExp(escapeRegExp(fixture("nonexistant-fake"))),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: p => p.indexOf(fixture("nonexistant-fake")) === 0,
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: fixture("nonexistant-fake-unknown"),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: new RegExp(escapeRegExp(fixture("nonexistant-unknown"))),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: p => p.indexOf(fixture("nonexistant-unknown")) === 0,
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });
    });

    describe("array", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [fixture("nonexistant-fake")],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [new RegExp(escapeRegExp(fixture("nonexistant-fake")))],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [p => p.indexOf(fixture("nonexistant-fake")) === 0],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [fixture("nonexistant-fake-unknown")],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [new RegExp(escapeRegExp(fixture("nonexistant-unknown")))],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          test: [p => p.indexOf(fixture("nonexistant-unknown")) === 0],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });
    });
  });

  describe("include", () => {
    describe("single", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: fixture("nonexistant-fake"),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: new RegExp(escapeRegExp(fixture("nonexistant-fake"))),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: p => p.indexOf(fixture("nonexistant-fake")) === 0,
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: fixture("nonexistant-fake-unknown"),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: new RegExp(escapeRegExp(fixture("nonexistant-unknown"))),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: p => p.indexOf(fixture("nonexistant-unknown")) === 0,
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });
    });

    describe("array", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [fixture("nonexistant-fake")],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [new RegExp(escapeRegExp(fixture("nonexistant-fake")))],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [p => p.indexOf(fixture("nonexistant-fake")) === 0],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [fixture("nonexistant-fake-unknown")],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [new RegExp(escapeRegExp(fixture("nonexistant-unknown")))],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          include: [p => p.indexOf(fixture("nonexistant-unknown")) === 0],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });
    });
  });

  describe("exclude", () => {
    describe("single", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: fixture("nonexistant-fake"),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: new RegExp(escapeRegExp(fixture("nonexistant-fake"))),
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: p => p.indexOf(fixture("nonexistant-fake")) === 0,
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: fixture("nonexistant-fake-unknown"),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: new RegExp(escapeRegExp(fixture("nonexistant-unknown"))),
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: p => p.indexOf(fixture("nonexistant-unknown")) === 0,
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });
    });

    describe("array", () => {
      it("should process matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [fixture("nonexistant-fake")],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [new RegExp(escapeRegExp(fixture("nonexistant-fake")))],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [p => p.indexOf(fixture("nonexistant-fake")) === 0],
          comments: true,
        });

        expect(opts.comments).toBeUndefined();
      });

      it("should process non-matching string values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [fixture("nonexistant-fake-unknown")],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching RegExp values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [new RegExp(escapeRegExp(fixture("nonexistant-unknown")))],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });

      it("should process non-matching function values", () => {
        const opts = loadOptions({
          cwd: fixture("nonexistant-fake"),
          filename: fixture("nonexistant-fake", "src.js"),
          babelrc: false,
          exclude: [p => p.indexOf(fixture("nonexistant-unknown")) === 0],
          comments: true,
        });

        expect(opts.comments).toBe(true);
      });
    });
  });

  describe("ignore", () => {
    it("should ignore files that match", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
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

      expect(opts).toBeNull();
    });

    it("should not ignore files that don't match", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        ignore: [
          fixture("nonexistant-fake", "other.js"),
          fixture("nonexistant-fake", "misc.js"),
        ],
      });

      expect(opts).not.toBeNull();
    });
  });

  describe("only", () => {
    it("should ignore files that don't match", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        only: [
          fixture("nonexistant-fake", "other.js"),
          fixture("nonexistant-fake", "misc.js"),
        ],
      });

      expect(opts).toBeNull();
    });

    it("should not ignore files that match", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        only: [
          fixture("nonexistant-fake", "src.js"),
          fixture("nonexistant-fake", "misc.js"),
        ],
      });

      expect(opts).not.toBeNull();
    });
  });

  describe("ignore/only", () => {
    it("should ignore files that match ignore and don't match only", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        ignore: [fixture("nonexistant-fake", "src.js")],
        only: [],
      });

      expect(opts).toBeNull();
    });

    it("should ignore files that match ignore and also only", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        ignore: [fixture("nonexistant-fake", "src.js")],
        only: [fixture("nonexistant-fake", "src.js")],
      });

      expect(opts).toBeNull();
    });

    it("should not ignore files that match only and not ignore", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        only: [fixture("nonexistant-fake", "src.js")],
      });

      expect(opts).not.toBeNull();
    });

    it("should not ignore files when no ignore/only are specified", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
      });

      expect(opts).not.toBeNull();
    });

    it("should allow negation of only", () => {
      const opts1 = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        only: [
          "!" + fixture("nonexistant-fake"),
          fixture("nonexistant-fake", "other.js"),
        ],
      });
      expect(opts1).toBeNull();

      const opts2 = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        only: [
          "!" + fixture("nonexistant-fake"),
          fixture("nonexistant-fake", "src.js"),
        ],
      });
      expect(opts2).not.toBeNull();

      const opts3 = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "folder", "src.js"),
        babelrc: false,
        only: [
          "!" + fixture("nonexistant-fake"),
          fixture("nonexistant-fake", "folder"),
        ],
      });
      expect(opts3).not.toBeNull();
    });

    it("should allow negation of ignore", () => {
      const opts1 = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        ignore: [
          "!" + fixture("nonexistant-fake", "other.js"),
          fixture("nonexistant-fake"),
        ],
      });
      expect(opts1).toBeNull();

      // Tests disabled pending https://github.com/babel/babel/issues/6907
      // const opts2 = loadOptions({
      //   cwd: fixture("nonexistant-fake"),
      //   filename: fixture("nonexistant-fake", "src.js"),
      //   babelrc: false,
      //   ignore: [
      //     "!" + fixture("nonexistant-fake", "src.js"),
      //     fixture("nonexistant-fake"),
      //   ],
      // });
      // expect(opts2).not.toBeNull();
      //
      // const opts3 = loadOptions({
      //   cwd: fixture("nonexistant-fake"),
      //   filename: fixture("nonexistant-fake", "folder", "src.js"),
      //   babelrc: false,
      //   ignore: [
      //     "!" + fixture("nonexistant-fake", "folder"),
      //     fixture("nonexistant-fake"),
      //   ],
      // });
      // expect(opts3).not.toBeNull();
    });
  });

  describe("caching", function () {
    describe("programmatic options", function () {
      const plugins1 = [() => ({})];
      const plugins2 = [() => ({})];

      it("should not cache the input options by identity", () => {
        const inputOpts = { plugins: plugins1 };

        const opts1 = loadOptions(inputOpts);

        inputOpts.plugins = plugins2;
        const opts2 = loadOptions(inputOpts);

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).not.toBe(opts2.plugins[1]);
      });

      it("should cache the env plugins by identity", () => {
        const plugins = [() => ({})];

        const opts1 = loadOptions({
          envName: "foo",
          env: {
            foo: {
              plugins,
            },
          },
        });
        const opts2 = loadOptions({
          envName: "foo",
          env: {
            foo: {
              plugins,
            },
          },
        });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);
      });

      it("should cache the env presets by identity", () => {
        const presets = [() => ({ plugins: [() => ({})] })];

        const opts1 = loadOptions({
          envName: "foo",
          env: {
            foo: {
              presets,
            },
          },
        });
        const opts2 = loadOptions({
          envName: "foo",
          env: {
            foo: {
              presets,
            },
          },
        });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);
      });

      it("should cache the plugin options by identity", () => {
        const plugins = [() => ({})];

        const opts1 = loadOptions({ plugins });
        const opts2 = loadOptions({ plugins });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);
      });

      it("should cache the presets options by identity", () => {
        const presets = [() => ({ plugins: [() => ({})] })];

        const opts1 = loadOptions({ presets });
        const opts2 = loadOptions({ presets });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);
      });

      it("should not cache the presets options with passPerPreset", () => {
        const presets = [() => ({ plugins: [() => ({})] })];

        const opts1 = loadOptions({ presets });
        const opts2 = loadOptions({ presets, passPerPreset: true });
        const opts3 = loadOptions({ presets, passPerPreset: false });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(0);
        expect(opts3.plugins).toHaveLength(1);

        expect(opts1.plugins[0]).toBe(opts3.plugins[0]);
      });
    });

    describe("config file options", function () {
      function touch(filepath) {
        const s = fs.statSync(filepath);
        fs.utimesSync(
          filepath,
          s.atime,
          s.mtime + Math.random() > 0.5 ? 1 : -1,
        );
      }

      it("should cache package.json files by mtime", () => {
        const filename = fixture(
          "complex-plugin-config",
          "config-identity",
          "pkg",
          "src.js",
        );
        const pkgJSON = fixture(
          "complex-plugin-config",
          "config-identity",
          "pkg",
          "package.json",
        );

        const opts1 = loadOptions({ filename, cwd: path.dirname(filename) });
        const opts2 = loadOptions({ filename, cwd: path.dirname(filename) });

        touch(pkgJSON);

        const opts3 = loadOptions({ filename, cwd: path.dirname(filename) });
        const opts4 = loadOptions({ filename, cwd: path.dirname(filename) });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts3.plugins[0]).toBe(opts4.plugins[0]);

        // Identity changed after touch().
        expect(opts1.plugins[0]).not.toBe(opts3.plugins[0]);
      });

      it("should cache .babelrc files by mtime", () => {
        const filename = fixture(
          "complex-plugin-config",
          "config-identity",
          "babelrc",
          "src.js",
        );
        const babelrcFile = fixture(
          "complex-plugin-config",
          "config-identity",
          "babelrc",
          ".babelrc",
        );

        const opts1 = loadOptions({ filename, cwd: path.dirname(filename) });
        const opts2 = loadOptions({ filename, cwd: path.dirname(filename) });

        touch(babelrcFile);

        const opts3 = loadOptions({ filename, cwd: path.dirname(filename) });
        const opts4 = loadOptions({ filename, cwd: path.dirname(filename) });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);

        expect(opts3.plugins).toHaveLength(1);
        expect(opts4.plugins).toHaveLength(1);
        expect(opts3.plugins[0]).toBe(opts4.plugins[0]);

        // Identity changed after touch().
        expect(opts1.plugins[0]).not.toBe(opts3.plugins[0]);
      });

      it("should cache .babelrc.js files programmable behavior", () => {
        const filename = fixture(
          "complex-plugin-config",
          "config-identity",
          "babelrc-js",
          "src.js",
        );

        const opts1 = loadOptions({ filename, cwd: path.dirname(filename) });
        const opts2 = loadOptions({ filename, cwd: path.dirname(filename) });

        const opts3 = loadOptions({
          filename,
          envName: "new-env",
          cwd: path.dirname(filename),
        });
        const opts4 = loadOptions({
          filename,
          envName: "new-env",
          cwd: path.dirname(filename),
        });

        expect(opts1.plugins).toHaveLength(1);
        expect(opts2.plugins).toHaveLength(1);
        expect(opts1.plugins[0]).toBe(opts2.plugins[0]);

        expect(opts3.plugins).toHaveLength(1);
        expect(opts4.plugins).toHaveLength(1);
        expect(opts3.plugins[0]).toBe(opts4.plugins[0]);

        // Identity changed with different .env
        expect(opts1.plugins[0]).not.toBe(opts3.plugins[0]);
      });
    });
  });

  describe("overrides merging", () => {
    it("should apply matching overrides over base configs", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        comments: true,
        overrides: [
          {
            test: fixture("nonexistant-fake"),
            comments: false,
          },
        ],
      });

      expect(opts.comments).toBe(false);
    });

    it("should not apply non-matching overrides over base configs", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        comments: true,
        overrides: [
          {
            test: fixture("nonexistant-unknown"),
            comments: false,
          },
        ],
      });

      expect(opts.comments).toBe(true);
    });

    it("should remove the overrides and filtering fields from the options", () => {
      const opts = loadOptions({
        cwd: fixture("nonexistant-fake"),
        filename: fixture("nonexistant-fake", "src.js"),
        babelrc: false,
        overrides: [],
        test: /^/,
        include: /^/,
        exclude: [],
      });

      expect(opts.overrides).toBeUndefined();
      expect(opts.test).toBeUndefined();
      expect(opts.include).toBeUndefined();
      expect(opts.exclude).toBeUndefined();
    });
  });

  describe("config files", () => {
    const getDefaults = () => ({
      babelrc: false,
      configFile: false,
      cwd: process.cwd(),
      root: process.cwd(),
      envName: "development",
      passPerPreset: false,
      plugins: [],
      presets: [],
      cloneInputAst: true,
      extensions: ["*"],
    });
    const realEnv = process.env.NODE_ENV;
    const realBabelEnv = process.env.BABEL_ENV;

    beforeAll(() => {
      delete process.env.NODE_ENV;
      delete process.env.BABEL_ENV;
    });
    afterAll(() => {
      if (realEnv) {
        process.env.NODE_ENV = realEnv;
        process.env.NODE_ENV = realBabelEnv;
      }
    });

    describe("root", () => {
      test.each(["babel.config.json", "babel.config.js", "babel.config.cjs"])(
        "should load %s synchronously",
        async name => {
          const { cwd, tmp, config } = await getTemp(
            `babel-test-load-config-sync-${name}`,
          );
          const filename = tmp("src.js");

          await config(name);

          expect(loadOptions({ filename, cwd })).toEqual({
            ...getDefaults(),
            filename,
            cwd,
            root: cwd,
            comments: true,
          });
        },
      );

      test("should not load babel.config.mjs synchronously", async () => {
        const { cwd, tmp, config } = await getTemp(
          "babel-test-load-config-sync-babel.config.mjs",
        );
        const filename = tmp("src.js");

        await config("babel.config.mjs");

        expect(() => loadOptions({ filename, cwd })).toThrow(
          /is only supported when running Babel asynchronously/,
        );
      });

      test.each([
        "babel.config.json",
        "babel.config.js",
        "babel.config.cjs",
        "babel.config.mjs",
      ])("should load %s asynchronously", async name => {
        const esm = isMJS(name);
        if (skipUnsupportedESM(esm, `should load ${name} asynchronously`)) {
          return;
        }

        const { cwd, tmp, config } = await getTemp(
          `babel-test-load-config-async-${name}`,
        );
        const filename = tmp("src.js");

        await config(name);

        await expect(loadOptionsAsync({ filename, cwd }, esm)).resolves.toEqual(
          {
            ...getDefaults(),
            filename,
            cwd,
            root: cwd,
            comments: true,
          },
        );
      });

      test.each(
        pairs([
          "babel.config.json",
          "babel.config.js",
          "babel.config.cjs",
          "babel.config.mjs",
        ]),
      )("should throw if both %s and %s are used", async (name1, name2) => {
        const esm = isMJS(name1) || isMJS(name2);
        if (
          skipUnsupportedESM(
            esm,
            `should throw if both ${name1} and ${name2} are used`,
          )
        ) {
          return;
        }

        const { cwd, tmp, config } = await getTemp(
          `babel-test-dup-config-${name1}-${name2}`,
        );

        await Promise.all([config(name1), config(name2)]);

        await expect(
          loadOptionsAsync({ filename: tmp("src.js"), cwd }, esm),
        ).rejects.toThrow(/Multiple configuration files found/);
      });
    });

    describe("relative", () => {
      test.each([
        "package.json",
        ".babelrc",
        ".babelrc.js",
        ".babelrc.cjs",
        ".babelrc.json",
      ])("should load %s synchronously", async name => {
        const { cwd, tmp, config } = await getTemp(
          `babel-test-load-config-${name}`,
        );
        const filename = tmp("src.js");

        await config(name);

        expect(loadOptions({ filename, cwd })).toEqual({
          ...getDefaults(),
          filename,
          cwd,
          root: cwd,
          comments: true,
        });
      });

      test("should not load .babelrc.mjs synchronously", async () => {
        const { cwd, tmp, config } = await getTemp(
          "babel-test-load-config-sync-.babelrc.mjs",
        );
        const filename = tmp("src.js");

        await config(".babelrc.mjs");

        expect(() => loadOptions({ filename, cwd })).toThrow(
          /is only supported when running Babel asynchronously/,
        );
      });

      test.each(
        [
          "package.json",
          ".babelrc",
          ".babelrc.js",
          ".babelrc.cjs",
          ".babelrc.mjs",
        ].filter(Boolean),
      )("should load %s asynchronously", async name => {
        const esm = isMJS(name);
        if (skipUnsupportedESM(esm, `should load ${name} asynchronously`)) {
          return;
        }

        const { cwd, tmp, config } = await getTemp(
          `babel-test-load-config-${name}`,
        );
        const filename = tmp("src.js");

        await config(name);

        await expect(loadOptionsAsync({ filename, cwd }, esm)).resolves.toEqual(
          {
            ...getDefaults(),
            filename,
            cwd,
            root: cwd,
            comments: true,
          },
        );
      });

      it("should load .babelignore", () => {
        const filename = fixture("config-files", "babelignore", "src.js");

        expect(
          loadOptions({ filename, cwd: path.dirname(filename) }),
        ).toBeNull();
      });

      test.each(
        pairs([
          "package.json",
          ".babelrc",
          ".babelrc.js",
          ".babelrc.cjs",
          ".babelrc.mjs",
          ".babelrc.json",
        ]),
      )("should throw if both %s and %s are used", async (name1, name2) => {
        const esm = isMJS(name1) || isMJS(name2);
        if (
          skipUnsupportedESM(
            esm,
            `should throw if both ${name1} and ${name2} are used`,
          )
        ) {
          return;
        }

        const { cwd, tmp, config } = await getTemp(
          `babel-test-dup-config-${name1}-${name2}`,
        );

        await Promise.all([config(name1), config(name2)]);

        await expect(
          loadOptionsAsync({ filename: tmp("src.js"), cwd }, esm),
        ).rejects.toThrow(/Multiple configuration files found/);
      });

      it("should ignore package.json without a 'babel' property", () => {
        const filename = fixture("config-files", "pkg-ignored", "src.js");

        expect(loadOptions({ filename, cwd: path.dirname(filename) })).toEqual({
          ...getDefaults(),
          filename: filename,
          cwd: path.dirname(filename),
          root: path.dirname(filename),
          comments: true,
        });
      });

      test.each`
        config             | dir                     | error
        ${".babelrc"}      | ${"babelrc-error"}      | ${/Error while parsing config - /}
        ${".babelrc.json"} | ${"babelrc-json-error"} | ${/Error while parsing config - /}
        ${".babelrc.js"}   | ${"babelrc-js-error"}   | ${/Babelrc threw an error/}
        ${".babelrc.cjs"}  | ${"babelrc-cjs-error"}  | ${/Babelrc threw an error/}
        ${".babelrc.mjs"}  | ${"babelrc-mjs-error"}  | ${/Babelrc threw an error/}
        ${"package.json"}  | ${"pkg-error"}          | ${/Error while parsing JSON - /}
      `(
        "should show helpful errors for $config",
        async ({ config, dir, error }) => {
          const esm = isMJS(config);
          if (
            skipUnsupportedESM(esm, `should show helpful errors for ${config}`)
          ) {
            return;
          }

          const filename = fixture("config-files", dir, "src.js");

          await expect(
            loadOptionsAsync({ filename, cwd: path.dirname(filename) }, esm),
          ).rejects.toThrow(error);
        },
      );

      it("loadPartialConfig should return a list of files that were extended", () => {
        const filename = fixture("config-files", "babelrc-extended", "src.js");

        expect(
          babel.loadPartialConfig({ filename, cwd: path.dirname(filename) }),
        ).toEqual({
          babelignore: fixture("config-files", ".babelignore"),
          babelrc: fixture("config-files", "babelrc-extended", ".babelrc"),
          config: undefined,
          fileHandling: "transpile",
          options: {
            ...getDefaults(),
            filename: filename,
            cwd: path.dirname(filename),
            root: path.dirname(filename),
            comments: true,
          },
          files: new Set([
            fixture("config-files", ".babelignore"),
            fixture("config-files", "babelrc-extended", ".babelrc-extended"),
            fixture("config-files", "babelrc-extended", ".babelrc"),
          ]),
        });
      });

      it("loadPartialConfig should return null when ignored", () => {
        const filename = fixture("config-files", "babelignore", "src.js");

        expect(
          babel.loadPartialConfig({ filename, cwd: path.dirname(filename) }),
        ).toBeNull();
      });

      it("loadPartialConfig should return a list of files when ignored with showIgnoredFiles option", () => {
        const filename = fixture("config-files", "babelignore", "src.js");

        expect(
          babel.loadPartialConfig({
            filename,
            cwd: path.dirname(filename),
            showIgnoredFiles: true,
          }),
        ).toEqual({
          babelignore: fixture("config-files", "babelignore", ".babelignore"),
          babelrc: undefined,
          config: undefined,
          fileHandling: "ignored",
          options: {
            ...getDefaults(),
            filename: filename,
            cwd: path.dirname(filename),
            root: path.dirname(filename),
          },
          files: new Set([
            fixture("config-files", "babelignore", ".babelignore"),
          ]),
        });
      });

      it("loadPartialConfig can be called with no arguments", () => {
        const cwd = process.cwd();

        try {
          process.chdir(fixture("config-files", "babelrc-extended"));
          expect(() => babel.loadPartialConfig()).not.toThrow();
        } finally {
          process.chdir(cwd);
        }
      });
    });

    it("should throw when `test` presents but `filename` is not passed", () => {
      expect(() => loadOptions({ test: /\.ts$/, plugins: [] })).toThrow(
        /Configuration contains string\/RegExp pattern/,
      );
    });

    it("should throw when `preset` requires `filename` but it was not passed", () => {
      expect(() => {
        loadOptions({
          presets: [require("./fixtures/config-loading/preset4")],
        });
      }).toThrow(/Preset \/\* your preset \*\/ requires a filename/);
    });

    it("should throw when `preset.overrides` requires `filename` but it was not passed", () => {
      expect(() => {
        loadOptions({
          presets: [require("./fixtures/config-loading/preset5")],
        });
      }).toThrow(/Preset \/\* your preset \*\/ requires a filename/);
    });
  });
});
