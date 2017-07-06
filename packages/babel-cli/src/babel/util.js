import commander from "commander";
import readdir from "fs-readdir-recursive";
import * as babel from "babel-core";
import includes from "lodash/includes";
import path from "path";
import fs from "fs";

export function chmod(src, dest) {
  fs.chmodSync(dest, fs.statSync(src).mode);
}

export function readdirFilter(filename) {
  return readdir(filename).filter(function(filename) {
    return isCompilableExtension(filename);
  });
}

export { readdir };

/**
 * Test if a filename ends with a compilable extension.
 */
export function isCompilableExtension(
  filename: string,
  altExts?: Array<string>,
): boolean {
  const exts = altExts || babel.DEFAULT_EXTENSIONS;
  const ext = path.extname(filename);
  return includes(exts, ext);
}

export function addSourceMappingUrl(code, loc) {
  return code + "\n//# sourceMappingURL=" + path.basename(loc);
}

export function log(msg) {
  if (!commander.quiet) console.log(msg);
}

export function transform(filename, code, opts) {
  opts = Object.assign({}, opts, {
    filename,
  });

  return babel.transform(code, opts);
}

export function compile(filename, opts) {
  try {
    return babel.transformFileSync(filename, opts);
  } catch (err) {
    if (commander.watch) {
      console.error(toErrorStack(err));
      return { ignored: true };
    } else {
      throw err;
    }
  }
}

function toErrorStack(err) {
  if (err._babel && err instanceof SyntaxError) {
    return `${err.name}: ${err.message}\n${err.codeFrame}`;
  } else {
    return err.stack;
  }
}

process.on("uncaughtException", function(err) {
  console.error(toErrorStack(err));
  process.exit(1);
});

export function requireChokidar() {
  try {
    return require("chokidar");
  } catch (err) {
    console.error(
      "The optional dependency chokidar failed to install and is required for " +
        "--watch. Chokidar is likely not supported on your platform.",
    );
    throw err;
  }
}
