import convertSourceMap from "convert-source-map";
import defaults from "lodash/defaults";
import sourceMap from "source-map";
import slash from "slash";
import path from "path";
import fs from "fs";

import * as util from "./util";

export default function(commander, filenames, opts) {
  if (commander.sourceMaps === "inline") {
    opts.sourceMaps = true;
  }

  let results = [];

  const buildResult = function() {
    const map = new sourceMap.SourceMapGenerator({
      file: path.basename(commander.outFile || "") || "stdout",
      sourceRoot: opts.sourceRoot,
    });

    let code = "";
    let offset = 0;

    results.forEach(function(result) {
      code += result.code + "\n";

      if (result.map) {
        const consumer = new sourceMap.SourceMapConsumer(result.map);
        const sources = new Set();

        consumer.eachMapping(function(mapping) {
          if (mapping.source != null) sources.add(mapping.source);

          map.addMapping({
            generated: {
              line: mapping.generatedLine + offset,
              column: mapping.generatedColumn,
            },
            source: mapping.source,
            original:
              mapping.source == null
                ? null
                : {
                    line: mapping.originalLine,
                    column: mapping.originalColumn,
                  },
          });
        });

        sources.forEach(source => {
          const content = consumer.sourceContentFor(source, true);
          if (content !== null) {
            map.setSourceContent(source, content);
          }
        });

        offset = code.split("\n").length - 1;
      }
    });

    // add the inline sourcemap comment if we've either explicitly asked for inline source
    // maps, or we've requested them without any output file
    if (
      commander.sourceMaps === "inline" ||
      (!commander.outFile && commander.sourceMaps)
    ) {
      code += "\n" + convertSourceMap.fromObject(map).toComment();
    }

    return {
      map: map,
      code: code,
    };
  };

  const output = function() {
    const result = buildResult();

    if (commander.outFile) {
      // we've requested for a sourcemap to be written to disk
      if (commander.sourceMaps && commander.sourceMaps !== "inline") {
        const mapLoc = commander.outFile + ".map";
        result.code = util.addSourceMappingUrl(result.code, mapLoc);
        fs.writeFileSync(mapLoc, JSON.stringify(result.map));
      }

      fs.writeFileSync(commander.outFile, result.code);
    } else {
      process.stdout.write(result.code + "\n");
    }
  };

  const stdin = function() {
    let code = "";

    process.stdin.setEncoding("utf8");

    process.stdin.on("readable", function() {
      const chunk = process.stdin.read();
      if (chunk !== null) code += chunk;
    });

    process.stdin.on("end", function() {
      results.push(
        util.transform(
          commander.filename,
          code,
          defaults(
            {
              sourceFileName: "stdin",
            },
            opts,
          ),
        ),
      );
      output();
    });
  };

  const walk = function() {
    const _filenames = [];
    results = [];

    filenames.forEach(function(filename) {
      if (!fs.existsSync(filename)) return;

      const stat = fs.statSync(filename);
      if (stat.isDirectory()) {
        const dirname = filename;

        util.readdirFilter(filename).forEach(function(filename) {
          _filenames.push(path.join(dirname, filename));
        });
      } else {
        _filenames.push(filename);
      }
    });

    _filenames.forEach(function(filename) {
      let sourceFilename = filename;
      if (commander.outFile) {
        sourceFilename = path.relative(
          path.dirname(commander.outFile),
          sourceFilename,
        );
      }
      sourceFilename = slash(sourceFilename);

      const data = util.compile(
        filename,
        defaults(
          {
            sourceFileName: sourceFilename,
          },
          opts,
        ),
      );

      if (!data) return;

      results.push(data);
    });

    output();
  };

  const files = function() {
    if (!commander.skipInitialBuild) {
      walk();
    }

    if (commander.watch) {
      const chokidar = util.requireChokidar();
      chokidar
        .watch(filenames, {
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 50,
            pollInterval: 10,
          },
        })
        .on("all", function(type, filename) {
          if (!util.isCompilableExtension(filename, commander.extensions)) {
            return;
          }

          if (type === "add" || type === "change") {
            util.log(type + " " + filename);
            try {
              walk();
            } catch (err) {
              console.error(err.stack);
            }
          }
        });
    }
  };

  if (filenames.length) {
    files();
  } else {
    stdin();
  }
}
