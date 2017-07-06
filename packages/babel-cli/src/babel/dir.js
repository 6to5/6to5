import defaults from "lodash/defaults";
import outputFileSync from "output-file-sync";
import slash from "slash";
import path from "path";
import fs from "fs";

import * as util from "./util";

export default function(commander, filenames, opts) {
  function write(src, relative) {
    if (!util.isCompilableExtension(relative, commander.extensions)) {
      return false;
    }

    // remove extension and then append back on .js
    relative = relative.replace(/\.(\w*?)$/, "") + ".js";

    const dest = path.join(commander.outDir, relative);

    const data = util.compile(
      src,
      defaults(
        {
          sourceFileName: slash(path.relative(dest + "/..", src)),
          sourceMapTarget: path.basename(relative),
        },
        opts,
      ),
    );

    if (!data) return false;

    // we've requested explicit sourcemaps to be written to disk
    if (data.map && commander.sourceMaps && commander.sourceMaps !== "inline") {
      const mapLoc = dest + ".map";
      data.code = util.addSourceMappingUrl(data.code, mapLoc);
      outputFileSync(mapLoc, JSON.stringify(data.map));
    }

    outputFileSync(dest, data.code);
    util.chmod(src, dest);

    util.log(src + " -> " + dest);

    return true;
  }

  function handleFile(src, filename) {
    const didWrite = write(src, filename);

    if (!didWrite && commander.copyFiles) {
      const dest = path.join(commander.outDir, filename);
      outputFileSync(dest, fs.readFileSync(src));
      util.chmod(src, dest);
    }
  }

  function handle(filename) {
    if (!fs.existsSync(filename)) return;

    const stat = fs.statSync(filename);

    if (stat.isDirectory(filename)) {
      const dirname = filename;

      util.readdir(dirname).forEach(function(filename) {
        const src = path.join(dirname, filename);
        handleFile(src, filename);
      });
    } else {
      write(filename, filename);
    }
  }

  if (!commander.skipInitialBuild) {
    filenames.forEach(handle);
  }

  if (commander.watch) {
    const chokidar = util.requireChokidar();

    filenames.forEach(function(dirname) {
      const watcher = chokidar.watch(dirname, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 50,
          pollInterval: 10,
        },
      });

      ["add", "change"].forEach(function(type) {
        watcher.on(type, function(filename) {
          const relative = path.relative(dirname, filename) || filename;
          try {
            handleFile(filename, relative);
          } catch (err) {
            console.error(err.stack);
          }
        });
      });
    });
  }
}
