import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import plumber from "gulp-plumber";
import through from "through2";
import chalk from "chalk";
import fancyLog from "fancy-log";
import filter from "gulp-filter";
import gulp from "gulp";
import { rollup } from "rollup";
import { babel as rollupBabel } from "@rollup/plugin-babel";
import rollupCommonJs from "@rollup/plugin-commonjs";
import rollupJson from "@rollup/plugin-json";
import rollupNodePolyfills from "rollup-plugin-node-polyfills";
import rollupNodeResolve from "@rollup/plugin-node-resolve";
import rollupReplace from "@rollup/plugin-replace";
import { terser as rollupTerser } from "rollup-plugin-terser";
import _rollupDts from "rollup-plugin-dts";
const { default: rollupDts } = _rollupDts;
import { Worker as JestWorker } from "jest-worker";
import glob from "glob";

import rollupBabelSource from "./scripts/rollup-plugin-babel-source.js";
import formatCode from "./scripts/utils/formatCode.js";

const require = createRequire(import.meta.url);
const monorepoRoot = path.dirname(fileURLToPath(import.meta.url));

const defaultPackagesGlob = "./@(codemods|packages|eslint)/*";
const defaultSourcesGlob = `${defaultPackagesGlob}/src/**/{*.js,*.cjs,!(*.d).ts}`;

const babelStandalonePluginConfigGlob =
  "./packages/babel-standalone/scripts/pluginConfig.json";

const buildTypingsWatchGlob = [
  "./packages/babel-types/lib/definitions/**/*.js",
  "./packages/babel-types/scripts/generators/*.js",
];

/**
 * map source code path to the generated artifacts path
 * @example
 * mapSrcToLib("packages/babel-core/src/index.js")
 * // returns "packages/babel-core/lib/index.js"
 * @example
 * mapSrcToLib("packages/babel-template/src/index.ts")
 * // returns "packages/babel-template/lib/index.js"
 * @example
 * mapSrcToLib("packages/babel-template/src/index.d.ts")
 * // returns "packages/babel-template/lib/index.d.ts"
 * @param {string} srcPath
 * @returns {string}
 */
function mapSrcToLib(srcPath) {
  const parts = srcPath.replace(/(?<!\.d)\.ts$/, ".js").split(path.sep);
  parts[2] = "lib";
  return parts.join(path.sep);
}

function mapToDts(packageName) {
  return packageName.replace(
    /(?<=\\|\/|^)(packages|eslint|codemods)(?=\\|\/)/,
    "dts"
  );
}

function getIndexFromPackage(name) {
  try {
    fs.statSync(`./${name}/src/index.ts`);
    return `${name}/src/index.ts`;
  } catch {
    return `${name}/src/index.js`;
  }
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

/**
 * @param {string} generator
 * @param {string} pkg
 * @param {string} filename
 * @param {string} message
 */
function generateHelpers(generator, dest, filename, message) {
  const stream = gulp
    .src(".", { base: monorepoRoot })
    .pipe(errorsLogger())
    .pipe(
      through.obj(async (file, enc, callback) => {
        const { default: generateCode } = await import(generator);

        file.path = filename;
        file.contents = Buffer.from(
          formatCode(await generateCode(filename), dest + file.path)
        );
        fancyLog(`${chalk.green("✔")} Generated ${message}`);
        callback(null, file);
      })
    )
    .pipe(gulp.dest(dest));

  return finish(stream);
}

/**
 *
 * @typedef {("asserts" | "builders" | "constants" | "validators")} TypesHelperKind
 * @param {TypesHelperKind} helperKind
 * @param {string} filename
 */
async function generateTypeHelpers(helperKind, filename = "index.ts") {
  return generateHelpers(
    `./packages/babel-types/scripts/generators/${helperKind}.js`,
    `./packages/babel-types/src/${helperKind}/generated/`,
    filename,
    `@babel/types -> ${helperKind}`
  );
}

/**
 *
 * @typedef {("asserts" | "validators" | "virtual-types")} TraverseHelperKind
 * @param {TraverseHelperKind} helperKind
 */
async function generateTraverseHelpers(helperKind) {
  return generateHelpers(
    `./packages/babel-traverse/scripts/generators/${helperKind}.js`,
    `./packages/babel-traverse/src/path/generated/`,
    `${helperKind}.ts`,
    `@babel/traverse -> ${helperKind}`
  );
}

async function generateRuntimeHelpers() {
  return generateHelpers(
    `./packages/babel-helpers/scripts/generate-helpers.js`,
    `./packages/babel-helpers/src/`,
    "helpers-generated.ts",
    "@babel/helpers"
  );
}

function generateStandalone() {
  const dest = "./packages/babel-standalone/src/generated/";
  return gulp
    .src(babelStandalonePluginConfigGlob, { base: monorepoRoot })
    .pipe(
      through.obj((file, enc, callback) => {
        fancyLog("Generating @babel/standalone files");
        const pluginConfig = JSON.parse(file.contents);
        let imports = "";
        let list = "";
        let allList = "";

        for (const plugin of pluginConfig) {
          const camelPlugin = plugin.replace(/-[a-z]/g, c =>
            c[1].toUpperCase()
          );
          imports += `import ${camelPlugin} from "@babel/plugin-${plugin}";`;
          list += `${camelPlugin},`;
          allList += `"${plugin}": ${camelPlugin},`;
        }

        const fileContents = `/*
 * This file is auto-generated! Do not modify it directly.
 * To re-generate run 'yarn gulp generate-standalone'
 */
${imports}
export {${list}};
export const all: { [k: string]: any } = {${allList}};`;
        file.path = "plugins.ts";
        file.contents = Buffer.from(formatCode(fileContents, dest));
        callback(null, file);
      })
    )
    .pipe(gulp.dest(dest));
}

function finish(stream) {
  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

function getFiles(glob, { include, exclude }) {
  let stream = gulp.src(glob, { base: monorepoRoot });

  if (exclude) {
    const filters = exclude.map(p => `!**/${p}/**`);
    filters.unshift("**");
    stream = stream.pipe(filter(filters));
  }
  if (include) {
    const filters = include.map(p => `**/${p}/**`);
    stream = stream.pipe(filter(filters));
  }

  return stream;
}

function createWorker(useWorker) {
  const numWorkers = require("os").cpus().length / 2 - 1;
  if (numWorkers === 0 || !useWorker) {
    return require("./babel-worker.cjs");
  }
  const worker = new JestWorker(require.resolve("./babel-worker.cjs"), {
    numWorkers,
    exposedMethods: ["transform"],
  });
  worker.getStdout().pipe(process.stdout);
  worker.getStderr().pipe(process.stderr);
  return worker;
}

async function buildBabel(useWorker, ignore = []) {
  const worker = createWorker(useWorker);
  const files = await new Promise((resolve, reject) => {
    glob(
      defaultSourcesGlob,
      {
        ignore: ignore.map(p => `./${p.src}/**`),
      },
      (err, files) => {
        if (err) reject(err);
        resolve(files);
      }
    );
  });

  const promises = [];
  for (const file of files) {
    // @example ./packages/babel-parser/src/index.js
    const dest = "./" + mapSrcToLib(file.slice(2));
    promises.push(worker.transform(file, dest));
  }
  return Promise.all(promises).finally(() => {
    if (worker.end !== undefined) {
      worker.end();
    }
  });
}

/**
 * Resolve a nested dependency starting from the given file
 */
function resolveChain(baseUrl, ...packages) {
  const require = createRequire(baseUrl);

  return packages.reduce(
    (base, pkg) =>
      path.dirname(require.resolve(pkg + "/package.json", { paths: [base] })),
    path.dirname(fileURLToPath(baseUrl))
  );
}

// If this build is part of a pull request, include the pull request number in
// the version number.
let versionSuffix = "";
if (process.env.CIRCLE_PR_NUMBER) {
  versionSuffix = "+pr." + process.env.CIRCLE_PR_NUMBER;
}

const babelVersion =
  require("./packages/babel-core/package.json").version + versionSuffix;
function buildRollup(packages, targetBrowsers) {
  const sourcemap = process.env.NODE_ENV === "production";
  return Promise.all(
    packages.map(
      async ({ src, format, dest, name, filename, envName = "rollup" }) => {
        const pkgJSON = require("./" + src + "/package.json");
        const version = pkgJSON.version + versionSuffix;
        const { dependencies = {}, peerDependencies = {} } = pkgJSON;
        const external = Object.keys(dependencies).concat(
          Object.keys(peerDependencies)
        );

        const input = getIndexFromPackage(src);
        fancyLog(`Compiling '${chalk.cyan(input)}' with rollup ...`);
        const bundle = await rollup({
          input,
          external,
          onwarn(warning, warn) {
            if (warning.code === "CIRCULAR_DEPENDENCY") return;
            if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
              warn(warning);
              return;
            }

            // Rollup warns about using babel.default at
            // https://github.com/babel/babel-polyfills/blob/4ac92be5b70b13e3d8a34614d8ecd900eb3f40e4/packages/babel-helper-define-polyfill-provider/src/types.js#L5
            // We can safely ignore this warning, and let Rollup replace it with undefined.
            if (
              warning.code === "MISSING_EXPORT" &&
              warning.exporter === "packages/babel-core/src/index.ts" &&
              warning.missing === "default" &&
              [
                "@babel/helper-define-polyfill-provider",
                "babel-plugin-polyfill-corejs2",
                "babel-plugin-polyfill-corejs3",
                "babel-plugin-polyfill-regenerator",
              ].some(pkg => warning.importer.includes(pkg))
            ) {
              return;
            }

            // We use console.warn here since it prints more info than just "warn",
            // in case we want to stop throwing for a specific message.
            console.warn(warning);

            // https://github.com/babel/babel/pull/12011#discussion_r540434534
            throw new Error("Rollup aborted due to warnings above");
          },
          plugins: [
            rollupBabelSource(),
            rollupReplace({
              preventAssignment: true,
              values: {
                "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
                BABEL_VERSION: JSON.stringify(babelVersion),
                VERSION: JSON.stringify(version),
              },
            }),
            rollupCommonJs({
              include: [
                /node_modules/,
                "packages/babel-runtime/regenerator/**",
                "packages/babel-preset-env/data/*.js",
                // Rollup doesn't read export maps, so it loads the cjs fallback
                "packages/babel-compat-data/*.js",
                "packages/*/src/**/*.cjs",
                // See the comment in this file for the reason to include it
                "packages/babel-standalone/src/dynamic-require-entrypoint.cjs",
              ],
              dynamicRequireTargets: [
                // https://github.com/mathiasbynens/regexpu-core/blob/ffd8fff2e31f4597f6fdfee75d5ac1c5c8111ec3/rewrite-pattern.js#L48
                resolveChain(
                  import.meta.url,
                  "./packages/babel-helper-create-regexp-features-plugin",
                  "regexpu-core",
                  "regenerate-unicode-properties"
                ) + "/**/*.js",
              ],
              // Never delegate to the native require()
              ignoreDynamicRequires: true,
              // Align with the Node.js behavior
              defaultIsModuleExports: true,
            }),
            rollupBabel({
              envName,
              babelrc: false,
              babelHelpers: "bundled",
              extends: "./babel.config.js",
              extensions: [".ts", ".js", ".mjs", ".cjs"],
            }),
            rollupNodeResolve({
              extensions: [".ts", ".js", ".mjs", ".cjs", ".json"],
              browser: targetBrowsers,
              exportConditions: targetBrowsers ? ["browser"] : [],
              // It needs to be set to 'false' when using rollupNodePolyfills
              // https://github.com/rollup/plugins/issues/772
              preferBuiltins: !targetBrowsers,
            }),
            rollupJson(),
            targetBrowsers &&
              rollupNodePolyfills({
                sourceMap: sourcemap,
                include: "**/*.{js,cjs,ts}",
              }),
          ].filter(Boolean),
        });

        const outputFile = path.join(src, dest, filename || "index.js");
        await bundle.write({
          file: outputFile,
          format,
          name,
          sourcemap: sourcemap,
          exports: "named",
        });

        if (!process.env.IS_PUBLISH) {
          fancyLog(
            chalk.yellow(
              `Skipped minification of '${chalk.cyan(
                outputFile
              )}' because not publishing`
            )
          );
          return undefined;
        }
        fancyLog(`Minifying '${chalk.cyan(outputFile)}'...`);

        await bundle.write({
          file: outputFile.replace(/\.js$/, ".min.js"),
          format,
          name,
          sourcemap: sourcemap,
          exports: "named",
          plugins: [
            rollupTerser({
              // workaround https://bugs.webkit.org/show_bug.cgi?id=212725
              output: {
                ascii_only: true,
              },
            }),
          ],
        });
      }
    )
  );
}

function buildRollupDts(packages) {
  const sourcemap = process.env.NODE_ENV === "production";
  return Promise.all(
    packages.map(async packageName => {
      const input = `${mapToDts(packageName)}/src/index.d.ts`;
      const output = `${packageName}/lib/index.d.ts`;
      fancyLog(`Bundling '${chalk.cyan(output)}' with rollup ...`);

      const bundle = await rollup({
        input,
        plugins: [rollupDts()],
        onwarn(warning, warn) {
          if (warning.code !== "CIRCULAR_DEPENDENCY") warn(warning);
        },
      });

      await bundle.write({
        file: output,
        format: "es",
        sourcemap: sourcemap,
        exports: "named",
      });
    })
  );
}

function copyDts(packages) {
  return getFiles(`${defaultPackagesGlob}/src/**/*.d.ts`, { include: packages })
    .pipe(rename(file => path.resolve(file.base, mapToDts(file.relative))))
    .pipe(gulp.dest(monorepoRoot));
}

const libBundles = [
  "packages/babel-parser",
  "packages/babel-plugin-proposal-optional-chaining",
  "packages/babel-preset-react",
  "packages/babel-preset-typescript",
  "packages/babel-helper-member-expression-to-functions",
  "packages/babel-plugin-bugfix-v8-spread-parameters-in-optional-chaining",
].map(src => ({
  src,
  format: "cjs",
  dest: "lib",
}));

const dtsBundles = ["packages/babel-types"];

const standaloneBundle = [
  {
    src: "packages/babel-standalone",
    format: "umd",
    name: "Babel",
    filename: "babel.js",
    dest: "",
    version: babelVersion,
    envName: "standalone",
  },
];

gulp.task("generate-type-helpers", () => {
  fancyLog("Generating @babel/types and @babel/traverse dynamic functions");

  return Promise.all([
    generateTypeHelpers("asserts"),
    generateTypeHelpers("builders"),
    generateTypeHelpers("builders", "uppercase.js"),
    generateTypeHelpers("constants"),
    generateTypeHelpers("validators"),
    generateTypeHelpers("ast-types"),
    generateTraverseHelpers("asserts"),
    generateTraverseHelpers("validators"),
    generateTraverseHelpers("virtual-types"),
  ]);
});

gulp.task("generate-runtime-helpers", () => {
  fancyLog("Generating @babel/helpers runtime helpers");

  return generateRuntimeHelpers();
});

gulp.task("generate-standalone", () => generateStandalone());

gulp.task("build-rollup", () => buildRollup(libBundles));
gulp.task("rollup-babel-standalone", () => buildRollup(standaloneBundle, true));
gulp.task(
  "build-babel-standalone",
  gulp.series("generate-standalone", "rollup-babel-standalone")
);

gulp.task("copy-dts", () => copyDts(dtsBundles));
gulp.task(
  "bundle-dts",
  gulp.series("copy-dts", () => buildRollupDts(dtsBundles))
);

gulp.task("build-babel", () => buildBabel(true, /* exclude */ libBundles));

gulp.task(
  "build",
  gulp.series(
    gulp.parallel("build-rollup", "build-babel", "generate-runtime-helpers"),
    gulp.parallel(
      "generate-standalone",
      gulp.series(
        "generate-type-helpers",
        // rebuild @babel/types since type-helpers may be changed
        "build-babel"
      )
    )
  )
);

gulp.task("default", gulp.series("build"));

// First build on worker processes for compilation speed
gulp.task("build-no-bundle", () => buildBabel(true));
// Incremental builds take place in main process
gulp.task("build-no-bundle-watch", () => buildBabel(false));

gulp.task(
  "build-dev",
  gulp.series(
    "build-no-bundle",
    gulp.parallel(
      "generate-standalone",
      gulp.series(
        "generate-type-helpers",
        // rebuild @babel/types since type-helpers may be changed
        "build-no-bundle"
      )
    )
  )
);

gulp.task(
  "watch",
  gulp.series("build-dev", function watch() {
    gulp.watch(defaultSourcesGlob, gulp.task("build-no-bundle-watch"));
    gulp.watch(
      babelStandalonePluginConfigGlob,
      gulp.task("generate-standalone")
    );
    gulp.watch(buildTypingsWatchGlob, gulp.task("generate-type-helpers"));
    gulp.watch(
      "./packages/babel-helpers/src/helpers/*.js",
      gulp.task("generate-runtime-helpers")
    );
  })
);
