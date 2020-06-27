// @flow

import readdirRecursive from "fs-readdir-recursive";
import * as babel from "@babel/core";
import includes from "lodash/includes";
import path from "path";
import fs from "fs";

/**
 * Set the file permissions of dest to the file permissions
 * of src.
 */
export function chmod(src: string, dest: string): void {
  fs.chmodSync(dest, fs.statSync(src).mode);
}

type ReaddirFilter = (filename: string) => boolean;

export function readdir(
  dirname: string,
  includeDotfiles: boolean,
  filter?: ReaddirFilter,
): Array<string> {
  return readdirRecursive(dirname, (filename, _index, currentDirectory) => {
    const stat = fs.statSync(path.join(currentDirectory, filename));

    if (stat.isDirectory()) return true;

    return (
      (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename))
    );
  });
}

export function readdirForCompilable(
  dirname: string,
  includeDotfiles: boolean,
  altExts?: Array<string>,
): Array<string> {
  return readdir(dirname, includeDotfiles, function (filename) {
    return isCompilableExtension(filename, altExts);
  });
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

export function addSourceMappingUrl(code: string, loc: string): string {
  return code + "\n//# sourceMappingURL=" + path.basename(loc);
}

const CALLER = {
  name: "@babel/cli",
};

export async function transform(
  filename: string,
  code: string,
  opts: Object,
): Promise<Object> {
  opts = {
    ...opts,
    caller: CALLER,
    filename,
  };

  const result = await babel.transformAsync(code, opts);
  if (isWatchMode) watchNewExternalDependencies(filename);
  return result;
}

export async function compile(
  filename: string,
  opts: Object | Function,
): Promise<Object> {
  opts = {
    ...opts,
    caller: CALLER,
  };

  const result = await babel.transformFileAsync(filename, opts);
  if (isWatchMode) watchNewExternalDependencies(filename);
  return result;
}

let isWatchMode = false;

export function watchMode() {
  isWatchMode = true;
}

/**
 * Check if @param child is a child of @param parent
 * Both paths must be absolute/resolved. (No "..")
 */
export function isChildPath(child: string, parent: string): boolean {
  return (
    child.length > parent.length + 1 && child.startsWith(parent + path.sep)
  );
}

function subtract(minuend: Set<string>, subtrahend: Set<string>): string[] {
  const diff = [];
  for (const e of minuend) {
    if (!subtrahend.has(e)) diff.push(e);
  }
  return diff;
}

const watchNewExternalDependencies = (() => {
  let prevDeps = null;
  return (filePath: string) => {
    // make the file path absolute because
    // dependencies are registered with absolute file paths
    filePath = path.resolve(filePath);
    const prevDepsForFile =
      prevDeps === null ? new Set() : prevDeps.get(filePath) || new Set();
    const newDeps = babel.getDependencies();
    const newDepsForFile = newDeps.get(filePath) || new Set();
    const unwatchedDepsForFile = subtract(newDepsForFile, prevDepsForFile);
    for (const dep of unwatchedDepsForFile) {
      watchFiles(dep);
    }
    prevDeps = newDeps;
  };
})();

const getWatcher = (() => {
  // Use a closure to ensure the file watcher is only created once
  // and never re-assigned. A const global variable isn't sufficient
  // because we only want to create the file watcher if the user passes
  // the --watch option, and a const variable must always be initialized.
  let watcher = undefined;
  return () => {
    if (watcher) return watcher;
    const { FSWatcher } = requireChokidar();
    watcher = new FSWatcher({
      disableGlobbing: true,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 50,
        pollInterval: 10,
      },
    });
    return watcher;
  };
})();

export function onDependencyFileChanged(
  callback: (filename_: string | null) => Promise<void>,
  sourceFilesAreCompiledIntoASingleFile: boolean,
): void {
  /**
   *
   * @param filePath The path of a file that has changed.
   * It will never be a path to a directory.
   * */
  async function onFileChanged(filePath: string) {
    // see corresponding line in registerNewExternalDependencies
    filePath = path.resolve(filePath);
    const externalFileDeps = babel.getExternalDependencies();
    if (externalFileDeps.has(filePath)) {
      if (sourceFilesAreCompiledIntoASingleFile) {
        // When using --out-file, Babel traverses all the files every time
        // so there's no point in calling the callback multiple times. The callback
        // for --out-file knows to recompile no matter what if it receives null.
        return await callback(null);
      } else {
        for (const dependent of externalFileDeps.get(filePath)) {
          await callback(dependent);
        }
        await callback(filePath);
      }
    } else {
      await callback(filePath);
    }
  }
  ["add", "change"].forEach(type => getWatcher().on(type, onFileChanged));
}

export function watchFiles(filenameOrFilenames: string | string[]): void {
  getWatcher().add(filenameOrFilenames);
}

export function deleteDir(path: string): void {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
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

process.on("uncaughtException", function (err) {
  console.error(err);
  process.exitCode = 1;
});

export function requireChokidar(): Object {
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

export function withExtension(filename: string, ext: string = ".js") {
  const newBasename = path.basename(filename, path.extname(filename)) + ext;
  return path.join(path.dirname(filename), newBasename);
}
