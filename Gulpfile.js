"use strict";

const plumber = require("gulp-plumber");
const through = require("through2");
const chalk = require("chalk");
const newer = require("gulp-newer");
const babel = require("gulp-babel");
const gulpWatch = require("gulp-watch");
const rename = require("gulp-rename");
const pump = require("pump");
const gutil = require("gulp-util");
const fancyLog = require("fancy-log");
const filter = require("gulp-filter");
const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const merge = require("merge-stream");
const rollup = require("rollup");
const rollupBabel = require("rollup-plugin-babel");
const rollupReplace = require("rollup-plugin-replace");
const rollupCommonJs = require("rollup-plugin-commonjs");
const rollupNodeResolve = require("rollup-plugin-node-resolve");
const rollupNodeGlobals = require("rollup-plugin-node-globals");
const rollupNodeBuiltins = require("rollup-plugin-node-builtins");
const uglify = require("gulp-uglify");
const rollupJson = require("rollup-plugin-json");
const registerStandalonePackageTask = require("./scripts/gulp-tasks")
  .registerStandalonePackageTask;
const { registerStandalonePackageTask } = require("./scripts/gulp-tasks")

const sources = ["codemods", "packages"];

function swapSrcWithLib(srcPath) {
  const parts = srcPath.split(path.sep);
  parts[1] = "lib";
  return parts.join(path.sep);
}

function getGlobFromSource(source) {
  return `./${source}/*/src/**/*.js`;
}

function getIndexFromPackage(name) {
  return `${name}/src/index.js`;
}


function compilationLogger(name, rollup) {
  return through.obj(function(file, enc, callback) {

    gutil.log(
      `Compiling '${chalk.cyan(name || file.relative)}'${

    fancyLog(
      `Compiling '${chalk.cyan(file.relative)}'${

        rollup ? " with rollup " : ""
      }...`
    );

function compilationLogger() {
  return through.obj(function(file, enc, callback) {
    fancyLog(`Compiling '${chalk.cyan(file.relative)}'...`);

    callback(null, file);
  });
}

function errorsLogger() {
  return plumber({
    errorHandler(err) {
      fancyLog(err.stack);
    },
  });
}

function buildBabel(exclude) {
  return merge(
    sources.map(source => {
      const base = path.join(__dirname, source);

      let stream = gulp.src(getGlobFromSource(source), { base: base });

      if (exclude) {
        const filters = exclude.map(p => `!**/${p}/**`);
        filters.unshift("**");
        stream = stream.pipe(filter(filters));
      }

      return stream
        .pipe(errorsLogger())
        .pipe(newer({ dest: base, map: swapSrcWithLib }))
        .pipe(compilationLogger())
        .pipe(babel())
        .pipe(
          // Passing 'file.relative' because newer() above uses a relative
          // path and this keeps it consistent.
          rename(relativePath => {
            relativePath.dirname = swapSrcWithLib(relativePath.dirname);
          })
        )
        .pipe(gulp.dest(base));
    })
  );
}
let babelVersion = require("./packages/babel-core/package.json").version;
function buildRollup(packages) {

  return merge(
    packages.map(
      ({
        src,
        format,
        dest,
        name,
        filename,
        minify,
        version = babelVersion,
      }) => {
        // If this build is part of a pull request, include the pull request number in
        // the version number.
        if (process.env.CIRCLE_PR_NUMBER) {
          const prVersion = "+pr." + process.env.CIRCLE_PR_NUMBER;
          babelVersion += prVersion;
          version += prVersion;
        }

        let letMinifyArgs = [];
        if (minify) {
          letMinifyArgs = [
            rename({ extname: ".min.js" }),
            gulp.dest(path.join(src, dest)),
          ];
          if (!process.env.CI) {
            letMinifyArgs.unshift(uglify());
          }
        }
        return pump(
          rollup({
            rollup: require("rollup"),
            input: getIndexFromPackage(src),
            output: {
              format,
              name,
              globals: {
                "@babel/standalone": "Babel",
              },
            },
            external: ["@babel/standalone"],
            plugins: [
              {
                name: "babel-source",
                load(id) {
                  const matches = id.match(/packages\/(babel-[^/]+)\/src\//);
                  if (matches) {
                    // check if browser field exists for this file and replace
                    const packageFolder = path.join(
                      __dirname,
                      "packages",
                      matches[1]
                    );
                    const packageJson = require(path.join(
                      packageFolder,
                      "package.json"
                    ));

                    if (
                      packageJson["browser"] &&
                      typeof packageJson["browser"] === "object"
                    ) {
                      for (let nodeFile in packageJson["browser"]) {
                        const browserFile = packageJson["browser"][
                          nodeFile
                        ].replace(/^(\.\/)?lib\//, "src/");
                        nodeFile = nodeFile.replace(/^(\.\/)?lib\//, "src/");
                        if (id.endsWith(nodeFile)) {
                          if (browserFile === false) {
                            return "";
                          }
                          return fs.readFileSync(
                            path.join(packageFolder, browserFile),
                            "UTF-8"
                          );
                        }
                      }
                    }
                  }
                  return null;
                },
                resolveId(importee) {
                  let packageFolderName;
                  const matches = importee.match(/^@babel\/([^/]+)$/);
                  if (matches) {
                    packageFolderName = `babel-${matches[1]}`;
                  }

                  if (packageFolderName) {
                    // resolve babel package names to their src index file
                    const packageFolder = path.join(
                      __dirname,
                      "packages",
                      packageFolderName
                    );
                    const packageJson = require(path.join(
                      packageFolder,
                      "package.json"
                    ));

                    const filename =
                      typeof packageJson["browser"] === "string"
                        ? packageJson["browser"]
                        : packageJson["main"];

                    return path.join(
                      packageFolder,
                      // replace lib with src in the pkg.json entry
                      filename.replace(/^(\.\/)?lib\//, "src/")
                    );
                  }

                  return null;
                },
              },
              rollupJson(),
              rollupNodeResolve({
                browser: true,
                jsnext: true,
                preferBuiltins: true,
              }),
              rollupReplace({
                "process.env.NODE_ENV": '"production"',
                "process.env.BABEL_ENV": '""',
                "process.env.TERM": '""',
                "process.platform": '""',
                "process.env": JSON.stringify({}),
                BABEL_VERSION: JSON.stringify(babelVersion),
                VERSION: JSON.stringify(version),
              }),
              rollupBabel({
                envName: "rollup",
                babelrc: false,
                extends: "./babel.config.js",
              }),
              rollupCommonJs(),
              rollupNodeGlobals({ sourceMap: false }),
              rollupNodeBuiltins(),
            ],
          }),
          source("index.js"),
          buffer(),
          errorsLogger(),
          compilationLogger(src, /* rollup */ true),
          rename(path => {
            path.basename = filename || path.basename;
          }),
          gulp.dest(path.join(src, dest)),
          ...letMinifyArgs,
          function(err) {
            if (err) throw err;
          }
        );
      }
    )
  );
}

// These are bundles which are placed in lib and
// serve as the commonjs npm package source
const libBundles = [
  {
    src: "packages/babel-parser",
    format: "cjs",
    dest: "lib",
    version: require("./packages/babel-parser/package.json").version,
  },
];

const bundles = [
  {
    src: "packages/babel-standalone",
    format: "umd",
    name: "Babel",
    filename: "babel",
    dest: "",
    minify: true,
  },
  {
    src: "packages/babel-preset-env-standalone",
    format: "umd",
    name: "babelPresetEnv",
    filename: "babel-preset-env",
    dest: "",
    minify: true,
  },
];

gulp.task("build", function() {
  return merge(
    buildBabel([
      ...libBundles.map(entry => entry.src),
      ...bundles.map(entry => entry.src),
    ]),
    buildRollup(libBundles)
  );
});

  return Promise.all(
    packages.map(pkg => {
      const input = getIndexFromPackage(pkg);
      fancyLog(`Compiling '${chalk.cyan(input)}' with rollup ...`);
      return rollup
        .rollup({
          input,
          plugins: [
            rollupBabel({
              envName: "babel-parser",
            }),
            rollupNodeResolve(),
          ],
        })
        .then(bundle => {
          return bundle.write({
            file: path.join(pkg, "lib/index.js"),
            format: "cjs",
            name: "babel-parser",
          });
        });
    })
  );
}

const bundles = ["packages/babel-parser"];

gulp.task("build-rollup", () => buildRollup(bundles));
gulp.task("build-babel", () => buildBabel(/* exclude */ bundles));
gulp.task("build", gulp.parallel("build-rollup", "build-babel"));


gulp.task("bundle", function() {
  return buildRollup(bundles);
});

gulp.task("build-no-bundle", () => buildBabel(bundles.map(entry => entry.src)));

gulp.task(
  "watch",
  gulp.series("build-no-bundle", function watch() {
    gulpWatch(
      sources.map(getGlobFromSource),
      { debounceDelay: 200 },
      gulp.task("build-no-bundle")
    );
  })
);

gulp.task("default", gulp.series("build"));

registerStandalonePackageTask(
  gulp,
  "babel",
  "Babel",
  path.join(__dirname, "packages"),
  require("./packages/babel-standalone/package.json").version
);

const presetEnvWebpackPlugins = [
  new webpack.NormalModuleReplacementPlugin(
    /\.\/available-plugins/,
    require.resolve(
      path.join(
        __dirname,
        "./packages/babel-preset-env-standalone/src/available-plugins"
      )
    )
  ),
  new webpack.NormalModuleReplacementPlugin(
    /caniuse-lite\/data\/regions\/.+/,
    require.resolve(
      path.join(
        __dirname,
        "./packages/babel-preset-env-standalone/src/caniuse-lite-regions"
      )
    )
  ),
];

registerStandalonePackageTask(
  gulp,
  "babel-preset-env",
  "babelPresetEnv",
  path.join(__dirname, "packages"),
  require("./packages/babel-preset-env-standalone/package.json").version,
  presetEnvWebpackPlugins
);
