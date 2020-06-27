// @flow

import defaults from "lodash/defaults";
import debounce from "lodash/debounce";
import { sync as makeDirSync } from "make-dir";
import slash from "slash";
import path from "path";
import fs from "fs";

import * as util from "./util";
import { type CmdOptions } from "./options";

const FILE_TYPE = Object.freeze({
  NON_COMPILABLE: "NON_COMPILABLE",
  COMPILED: "COMPILED",
  IGNORED: "IGNORED",
  ERR_COMPILATION: "ERR_COMPILATION",
});

function outputFileSync(filePath: string, data: string | Buffer): void {
  makeDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
}

export default async function ({
  cliOptions,
  babelOptions,
}: CmdOptions): Promise<void> {
  const absoluteFilePaths = cliOptions.filenames.map(name =>
    path.resolve(name),
  );

  async function write(
    src: string,
    base: string,
  ): Promise<$Keys<typeof FILE_TYPE>> {
    let relative = path.relative(base, src);

    if (!util.isCompilableExtension(relative, cliOptions.extensions)) {
      return FILE_TYPE.NON_COMPILABLE;
    }

    relative = util.withExtension(
      relative,
      cliOptions.keepFileExtension
        ? path.extname(relative)
        : cliOptions.outFileExtension,
    );

    const dest = getDest(relative, base);

    try {
      const res = await util.compile(
        src,
        defaults(
          {
            sourceFileName: slash(path.relative(dest + "/..", src)),
          },
          babelOptions,
        ),
      );

      if (!res) return FILE_TYPE.IGNORED;

      // we've requested explicit sourcemaps to be written to disk
      if (
        res.map &&
        babelOptions.sourceMaps &&
        babelOptions.sourceMaps !== "inline"
      ) {
        const mapLoc = dest + ".map";
        res.code = util.addSourceMappingUrl(res.code, mapLoc);
        res.map.file = path.basename(relative);
        outputFileSync(mapLoc, JSON.stringify(res.map));
      }

      outputFileSync(dest, res.code);
      util.chmod(src, dest);

      if (cliOptions.verbose) {
        console.log(src + " -> " + dest);
      }

      return FILE_TYPE.COMPILED;
    } catch (err) {
      if (cliOptions.watch) {
        console.error(err);
        return FILE_TYPE.ERR_COMPILATION;
      }

      throw err;
    }
  }

  function getDest(filename: string, base: string): string {
    if (cliOptions.relative) {
      return path.join(base, cliOptions.outDir, filename);
    }
    return path.join(cliOptions.outDir, filename);
  }

  async function handleFile(src: string, base: string): Promise<boolean> {
    const written = await write(src, base);

    if (
      (cliOptions.copyFiles && written === FILE_TYPE.NON_COMPILABLE) ||
      (cliOptions.copyIgnored && written === FILE_TYPE.IGNORED)
    ) {
      const filename = path.relative(base, src);
      const dest = getDest(filename, base);
      outputFileSync(dest, fs.readFileSync(src));
      util.chmod(src, dest);
    }
    return written === FILE_TYPE.COMPILED;
  }

  async function handle(filenameOrDir: string): Promise<number> {
    if (!fs.existsSync(filenameOrDir)) return 0;

    const stat = fs.statSync(filenameOrDir);

    if (stat.isDirectory()) {
      const dirname = filenameOrDir;

      let count = 0;

      const files = util.readdir(dirname, cliOptions.includeDotfiles);
      for (const filename of files) {
        const src = path.join(dirname, filename);

        const written = await handleFile(src, dirname);
        if (written) count += 1;
      }

      return count;
    } else {
      const filename = filenameOrDir;
      const written = await handleFile(filename, path.dirname(filename));

      return written ? 1 : 0;
    }
  }

  let compiledFiles = 0;
  let startTime = null;

  const logSuccess = debounce(
    function () {
      if (startTime === null) {
        // This should never happen, but just in case it's better
        // to ignore the log message rather than making @babel/cli crash.
        return;
      }

      const diff = process.hrtime(startTime);

      console.log(
        `Successfully compiled ${compiledFiles} ${
          compiledFiles !== 1 ? "files" : "file"
        } with Babel (${diff[0] * 1e3 + Math.round(diff[1] / 1e6)}ms).`,
      );
      compiledFiles = 0;
      startTime = null;
    },
    100,
    { trailing: true },
  );

  // Look at corresponding comment in file.js
  if (cliOptions.watch) util.watchMode();

  if (!cliOptions.skipInitialBuild) {
    if (cliOptions.deleteDirOnStart) {
      util.deleteDir(cliOptions.outDir);
    }

    makeDirSync(cliOptions.outDir);

    startTime = process.hrtime();

    for (const filename of cliOptions.filenames) {
      // compiledFiles is just incremented without reading its value, so we
      // don't risk race conditions.
      // eslint-disable-next-line require-atomic-updates
      compiledFiles += await handle(filename);
    }

    if (!cliOptions.quiet) {
      logSuccess();
      logSuccess.flush();
    }
  }

  if (cliOptions.watch) {
    let processing = 0;

    util.onDependencyFileChanged(async (changedFilePath: string) => {
      if (
        !util.isCompilableExtension(changedFilePath, cliOptions.extensions) &&
        // See comment on corresponding code in file.js
        !absoluteFilePaths.includes(changedFilePath)
      ) {
        return;
      }
      processing++;
      if (startTime === null) startTime = process.hrtime();

      /**
       * The relative path from @var base to @var changedFilePath
       * will be path of @var changedFilePath in the output directory.
       */
      let base = null;
      for (const filePath of absoluteFilePaths) {
        if (changedFilePath === filePath) {
          // Case: "babel --watch src/bar/foo.js --out-dir dist"
          // We want src/bar/foo.js --> dist/foo.js
          base = path.dirname(changedFilePath);
          break;
        } else if (util.isChildPath(changedFilePath, filePath)) {
          // Case: "babel --watch src/ --out-dir dist"
          // src/foo/bar.js changes
          // We want src/foo/bar.js --> dist/foo/bar.js
          base = filePath;
          break;
        }
      }

      if (base === null) {
        throw new Error(
          `path: ${changedFilePath} was not equal to/a child path of any of these paths: ${absoluteFilePaths}`,
        );
      }

      try {
        await handleFile(changedFilePath, base);
        compiledFiles++;
      } catch (err) {
        console.error(err);
      }

      processing--;
      if (processing === 0 && !cliOptions.quiet) logSuccess();
    }, false);
    util.watchFiles(absoluteFilePaths);
  }
}
