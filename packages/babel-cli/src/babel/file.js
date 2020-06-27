// @flow

import convertSourceMap from "convert-source-map";
import defaults from "lodash/defaults";
import sourceMap from "source-map";
import slash from "slash";
import { sync as makeDirSync } from "make-dir";
import path from "path";
import fs from "fs";

import * as util from "./util";
import { type CmdOptions } from "./options";

type CompilationOutput = {
  code: string,
  map: Object,
};

export default async function ({
  cliOptions,
  babelOptions,
}: CmdOptions): Promise<void> {
  function buildResult(fileResults: Array<Object>): CompilationOutput {
    const map = new sourceMap.SourceMapGenerator({
      file:
        cliOptions.sourceMapTarget ||
        path.basename(cliOptions.outFile || "") ||
        "stdout",
      sourceRoot: babelOptions.sourceRoot,
    });

    let code = "";
    let offset = 0;

    for (const result of fileResults) {
      if (!result) continue;

      code += result.code + "\n";

      if (result.map) {
        const consumer = new sourceMap.SourceMapConsumer(result.map);
        const sources = new Set();

        consumer.eachMapping(function (mapping) {
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
    }

    // add the inline sourcemap comment if we've either explicitly asked for inline source
    // maps, or we've requested them without any output file
    if (
      babelOptions.sourceMaps === "inline" ||
      (!cliOptions.outFile && babelOptions.sourceMaps)
    ) {
      code += "\n" + convertSourceMap.fromObject(map).toComment();
    }

    return {
      map: map,
      code: code,
    };
  }

  function output(fileResults: Array<string>): void {
    const result = buildResult(fileResults);

    if (cliOptions.outFile) {
      makeDirSync(path.dirname(cliOptions.outFile));

      // we've requested for a sourcemap to be written to disk
      if (babelOptions.sourceMaps && babelOptions.sourceMaps !== "inline") {
        const mapLoc = cliOptions.outFile + ".map";
        result.code = util.addSourceMappingUrl(result.code, mapLoc);
        fs.writeFileSync(mapLoc, JSON.stringify(result.map));
      }

      fs.writeFileSync(cliOptions.outFile, result.code);
    } else {
      process.stdout.write(result.code + "\n");
    }
  }

  function readStdin(): Promise<string> {
    return new Promise((resolve: Function, reject: Function): void => {
      let code = "";

      process.stdin.setEncoding("utf8");

      process.stdin.on("readable", function () {
        const chunk = process.stdin.read();
        // $FlowIgnore
        if (chunk !== null) code += chunk;
      });

      process.stdin.on("end", function () {
        resolve(code);
      });
      process.stdin.on("error", reject);
    });
  }

  async function stdin(): Promise<void> {
    const code = await readStdin();

    const res = await util.transform(
      cliOptions.filename,
      code,
      defaults(
        {
          sourceFileName: "stdin",
        },
        babelOptions,
      ),
    );

    output([res]);
  }

  async function walk(filenames: Array<string>): Promise<void> {
    const _filenames = [];

    filenames.forEach(function (filename) {
      if (!fs.existsSync(filename)) return;

      const stat = fs.statSync(filename);
      if (stat.isDirectory()) {
        const dirname = filename;

        util
          .readdirForCompilable(
            filename,
            cliOptions.includeDotfiles,
            cliOptions.extensions,
          )
          .forEach(function (filename) {
            _filenames.push(path.join(dirname, filename));
          });
      } else {
        _filenames.push(filename);
      }
    });

    const results = await Promise.all(
      _filenames.map(async function (filename: string): Promise<Object> {
        let sourceFilename = filename;
        if (cliOptions.outFile) {
          sourceFilename = path.relative(
            path.dirname(cliOptions.outFile),
            sourceFilename,
          );
        }
        sourceFilename = slash(sourceFilename);

        try {
          return await util.compile(
            filename,
            defaults(
              {
                sourceFileName: sourceFilename,
                // Since we're compiling everything to be merged together,
                // "inline" applies to the final output file, but not to the individual
                // files being concatenated.
                sourceMaps:
                  babelOptions.sourceMaps === "inline"
                    ? true
                    : babelOptions.sourceMaps,
              },
              babelOptions,
            ),
          );
        } catch (err) {
          if (!cliOptions.watch) {
            throw err;
          }

          console.error(err);
          return null;
        }
      }),
    );

    output(results);
  }

  async function files(filenames: Array<string>): Promise<void> {
    // We need to set watch mode before the initial compilation
    // so external dependencies are registered during the first compilation pass.
    if (cliOptions.watch) util.watchMode();
    if (!cliOptions.skipInitialBuild) {
      await walk(filenames);
    }

    if (cliOptions.watch) {
      util.onDependencyFileChanged((filename: string | null) => {
        if (
          filename !== null &&
          !util.isCompilableExtension(filename, cliOptions.extensions) &&
          // Used in the case: babel --watch foo.ts --out-file compiled.js
          // In this, case ".ts" is not a compilable extension (since the user didn't pass
          // the --extensions flag), but, we still want to watch "foo.ts" anyway.
          !filenames.includes(filename)
        ) {
          return;
        }

        if (cliOptions.verbose) {
          if (filename === null) {
            console.log(`recompiling: external dependency changed`);
          } else console.log(`compiling: ${filename}`);
        }

        walk(filenames).catch(err => {
          console.error(err);
        });
      }, true);
      util.watchFiles(filenames);
    }
  }

  if (cliOptions.filenames.length) {
    await files(cliOptions.filenames);
  } else {
    await stdin();
  }
}
