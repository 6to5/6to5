"use strict";

const plumber = require("gulp-plumber");
const through = require("through2");
const chalk = require("chalk");
const newer = require("gulp-newer");
const babel = require("gulp-babel");
const fancyLog = require("fancy-log");
const filter = require("gulp-filter");
const gulp = require("gulp");
const path = require("path");
const rollup = require("rollup");
const rollupBabel = require("rollup-plugin-babel");
const rollupBabelSource = require("./scripts/rollup-plugin-babel-source");
const rollupCommonJs = require("rollup-plugin-commonjs");
const rollupJson = require("@rollup/plugin-json");
const rollupNodeBuiltins = require("rollup-plugin-node-builtins");
const rollupNodeGlobals = require("rollup-plugin-node-globals");
const rollupNodeResolve = require("rollup-plugin-node-resolve");
const rollupReplace = require("rollup-plugin-replace");
const { terser: rollupTerser } = require("rollup-plugin-terser");

const defaultSourcesGlob = "./@(codemods|packages|eslint)/*/src/**/*.js";

function swapSrcWithLib(srcPath) {
  const parts = srcPath.split(path.sep);
  parts[2] = "lib";
  return parts.join(path.sep);
}

function swapJsWithMjs(srcPath) {
  if (srcPath.slice(-3) === ".js") {
    return srcPath.slice(0, -3) + ".module.js";
  } else {
    return srcPath;
  }
}

function getIndexFromPackage(name) {
  return `${name}/src/index.js`;
}

function compilationLogger() {
  return through.obj(function (file, enc, callback) {
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

function rename(fn) {
  return through.obj(function (file, enc, callback) {
    file.path = fn(file);
    callback(null, file);
  });
}

function buildBabel(exclude, sourcesGlob = defaultSourcesGlob) {
  const base = __dirname;

  let stream = gulp.src(sourcesGlob, { base: __dirname });

  if (exclude) {
    const filters = exclude.map(p => `!**/${p.src}/**`);
    filters.unshift("**");
    stream = stream.pipe(filter(filters));
  }

  return stream
    .pipe(errorsLogger())
    .pipe(newer({ dest: base, map: swapSrcWithLib }))
    .pipe(compilationLogger())
    .pipe(
      babel({
        caller: {
          // We have wrapped packages/babel-core/src/config/files/configuration.js with feature detection
          supportsDynamicImport: true,
        },
      })
    )
    .pipe(
      // Passing 'file.relative' because newer() above uses a relative
      // path and this keeps it consistent.
      rename(file => path.resolve(file.base, swapSrcWithLib(file.relative)))
    )
    .pipe(gulp.dest(base));
}

function buildBabelEsm(exclude, sourcesGlob = defaultSourcesGlob) {
  const base = __dirname;

  let stream = gulp.src(sourcesGlob, { base: __dirname });

  if (exclude) {
    const filters = exclude.map(p => `!**/${p.src}/**`);
    filters.unshift("**");
    stream = stream.pipe(filter(filters));
  }

  return stream
    .pipe(errorsLogger())
    .pipe(
      newer({
        dest: base,
        map: srcPath => {
          return swapJsWithMjs(swapSrcWithLib(srcPath));
        },
      })
    )
    .pipe(compilationLogger())
    .pipe(babel({ envName: "esm" }))
    .pipe(
      // Passing 'file.relative' because newer() above uses a relative
      // path and this keeps it consistent.
      rename(file =>
        path.resolve(file.base, swapJsWithMjs(swapSrcWithLib(file.relative)))
      )
    )
    .pipe(gulp.dest(base));
}

let babelVersion = require("./packages/babel-core/package.json").version;
function buildRollup(packages) {
  const sourcemap = process.env.NODE_ENV === "production";
  const minify = !!process.env.IS_PUBLISH;
  return Promise.all(
    packages.map(
      ({ src, format, dest, name, filename, version = babelVersion }) => {
        const extraPlugins = [];
        let nodeResolveBrowser = false,
          babelEnvName = "rollup";
        switch (src) {
          case "packages/babel-standalone":
            nodeResolveBrowser = true;
            babelEnvName = "standalone";
            if (minify) {
              extraPlugins.push(
                rollupTerser({
                  include: /^.+\.min\.js$/,
                  // workaround https://bugs.webkit.org/show_bug.cgi?id=212725
                  output: {
                    ascii_only: true,
                  },
                })
              );
            }
            break;
        }
        // If this build is part of a pull request, include the pull request number in
        // the version number.
        if (process.env.CIRCLE_PR_NUMBER) {
          const prVersion = "+pr." + process.env.CIRCLE_PR_NUMBER;
          babelVersion += prVersion;
          version += prVersion;
        }
        const input = getIndexFromPackage(src);
        fancyLog(`Compiling '${chalk.cyan(input)}' with rollup ...`);
        return rollup
          .rollup({
            input,
            plugins: [
              ...extraPlugins,
              rollupBabelSource(),
              rollupReplace({
                "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
                BABEL_VERSION: JSON.stringify(babelVersion),
                VERSION: JSON.stringify(version),
              }),
              rollupBabel({
                envName: babelEnvName,
                babelrc: false,
                extends: "./babel.config.js",
              }),
              rollupNodeResolve({
                browser: nodeResolveBrowser,
                preferBuiltins: true,
                //todo: When Yarn workspaces is enabled, remove `dedupe` option
                dedupe(importee) {
                  return (
                    importee.startsWith("lodash/") ||
                    [
                      "babel-plugin-dynamic-import-node/utils",
                      "esutils",
                      "semver",
                      "source-map",
                    ].includes(importee)
                  );
                },
              }),
              rollupCommonJs({
                include: [
                  /node_modules/,
                  "packages/babel-runtime/regenerator/**",
                  "packages/babel-preset-env/data/*.js",
                  // Rollup doesn't read export maps, so it loads the cjs fallback
                  "packages/babel-compat-data/*.js",
                ],
                namedExports: {
                  "babel-plugin-dynamic-import-node/utils.js": [
                    "createDynamicImportTransform",
                    "getImportSource",
                  ],
                  "@babel/standalone": ["availablePlugins", "registerPlugin"],
                },
              }),
              rollupJson(),
              rollupNodeBuiltins(),
              rollupNodeGlobals({ sourceMap: sourcemap }),
            ],
          })
          .then(bundle => {
            const outputFile = path.resolve(src, dest, filename || "index.js");
            return bundle
              .write({
                file: outputFile,
                format,
                name,
                sourcemap: sourcemap,
              })
              .then(() => {
                if (!process.env.IS_PUBLISH) {
                  fancyLog(
                    chalk.yellow(
                      `Skipped minification of '${chalk.cyan(
                        path.relative(path.join(__dirname, ".."), outputFile)
                      )}' because not publishing`
                    )
                  );
                  return undefined;
                }
                fancyLog(
                  `Minifying '${chalk.cyan(
                    path.relative(path.join(__dirname, ".."), outputFile)
                  )}'...`
                );

                return bundle.write({
                  file: outputFile.replace(/\.js$/, ".min.js"),
                  format,
                  name,
                  sourcemap: sourcemap,
                });
              });
          });
      }
    )
  );
}

const libBundles = [
  {
    src: "packages/babel-parser",
    format: "cjs",
    dest: "lib",
    version: require("./packages/babel-parser/package").version,
  },
];

const standaloneBundle = [
  {
    src: "packages/babel-standalone",
    format: "umd",
    name: "Babel",
    filename: "babel.js",
    dest: "",
    version: require("./packages/babel-core/package").version,
  },
];

gulp.task("build-rollup", () => buildRollup(libBundles));
gulp.task("build-babel-standalone", () => buildRollup(standaloneBundle));

gulp.task("build-babel", () => buildBabel(/* exclude */ libBundles));
gulp.task("build-babel-esm", () =>
  buildBabelEsm(/* exclude */ libBundles, defaultSourcesGlob)
);
gulp.task(
  "build",
  gulp.parallel("build-rollup", "build-babel", "build-babel-esm")
);

gulp.task("default", gulp.series("build"));

gulp.task("build-no-bundle", () => buildBabel());

gulp.task(
  "watch",
  gulp.series("build-no-bundle", function watch() {
    gulp.watch(defaultSourcesGlob, gulp.task("build-no-bundle"));
  })
);
