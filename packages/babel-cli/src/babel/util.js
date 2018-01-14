import commander from "commander";
import readdirRecursive from "fs-readdir-recursive";
import * as babel from "@babel/core";
import includes from "lodash/includes";
import path from "path";
import fs from "fs";
import child from "child_process";

export function chmod(src, dest) {
  fs.chmodSync(dest, fs.statSync(src).mode);
}

type ReaddirFilter = (filename: string) => boolean;

export function readdir(
  dirname: string,
  includeDotfiles: boolean,
  filter: ReaddirFilter,
) {
  return readdirRecursive(
    dirname,
    filename =>
      (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename)),
  );
}

export function readdirForCompilable(
  dirname: string,
  includeDotfiles: boolean,
) {
  return readdir(dirname, includeDotfiles, isCompilableExtension);
}

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

export function transform(filename, code, opts, callback) {
  opts = Object.assign({}, opts, {
    filename,
  });

  babel.transform(code, opts, callback);
}

export function compile(filename, opts, callback) {
  babel.transformFile(filename, opts, function(err, res) {
    if (err) {
      if (commander.watch) {
        console.error(err);
        return callback(null, { ignored: true });
      } else {
        return callback(err);
      }
    }
    return callback(null, res);
  });
}

export function deleteDir(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file) {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

process.on("uncaughtException", function(err) {
  console.error(err);
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

export function adjustRelative(relative, keepFileExtension) {
  if (keepFileExtension) {
    return relative;
  }
  return relative.replace(/\.(\w*?)$/, "") + ".js";
}

export function printSettings() {
  const hasYarn = cwd =>
    fs.existsSync(path.resolve(cwd || process.cwd(), "yarn.lock"));
  const indent = str =>
    `\n ${str
      .trim()
      .split("\n")
      .join("\n")}`;
  const log = [];
  log.push("Babel Settings :- ");
  log.push(`Node version: ${indent(process.versions.node)}`);
  log.push(`Npm version: ${indent(child.execSync("npm -v").toString())}`);

  if (hasYarn()) {
    log.push(`Yarn version: ${indent(child.execSync("yarn -v").toString())}`);
  }
  log.push("Babel packages :- ");
  const packages = child
    .execSync("npm list --silent | grep babel")
    .toString()
    .split("\n");
  for (let i = 0; i < packages.length; i++) {
    if (packages[i].substring(0, 2) == "├─") {
      log.push(packages[i]);
    }
  }
  log.push("Babel presets :- ");
  const babelrc = babel.findBabelrc();
  const presets = babelrc.options.presets;
  for (let i = 0; i < presets.length; i++) {
    if (Array.isArray(presets[i])) {
      log.push(presets[i][0]);
    } else {
      log.push(presets[i]);
    }
  }

  log.push("Babel plugins :- ");
  const plugins = babelrc.options.plugins;
  for (let i = 0; i < plugins.length; i++) {
    if (Array.isArray(plugins[i])) {
      log.push(plugins[i][0]);
    } else {
      log.push(plugins[i]);
    }
  }
  console.log(log.join("\n") + "\n");
}
