import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

import plumber from "gulp-plumber";
import through from "through2";
import chalk from "chalk";
import newer from "gulp-newer";
import babel from "gulp-babel";
import camelCase from "lodash/camelCase.js";
import fancyLog from "fancy-log";
import filter from "gulp-filter";
import revertPath from "gulp-revert-path";
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

import rollupBabelSource from "./scripts/rollup-plugin-babel-source.js";
import formatCode from "./scripts/utils/formatCode.js";

const require = createRequire(import.meta.url);
const monorepoRoot = path.dirname(fileURLToPath(import.meta.url));

const defaultPackagesGlob = "./@(codemods|packages|eslint)/*";
const defaultSourcesGlob = `${defaultPackagesGlob}/src/**/{*.js,*.cjs,!(*.d).ts}`;
const defaultDtsGlob = `${defaultPackagesGlob}/lib/**/*.d.ts{,.map}`;

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

function getIndexFromPackage(name) {
  try {
    fs.statSync(`./${name}/src/index.ts`);
    return `${name}/src/index.ts`;
  } catch {
    return `${name}/src/index.js`;
  }
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
          formatCode(generateCode(filename), dest + file.path)
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
          const camelPlugin = camelCase(plugin);
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
export const all = {${allList}};`;
        file.path = "plugins.js";
        file.contents = Buffer.from(formatCode(fileContents, dest));
        callback(null, file);
      })
    )
    .pipe(gulp.dest(dest));
}

function unlink() {
  return through.obj(function (file, enc, callback) {
    fs.unlink(file.path, () => callback());
  });
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

function buildBabel(exclude) {
  const base = monorepoRoot;

  return getFiles(defaultSourcesGlob, {
    exclude: exclude && exclude.map(p => p.src),
  })
    .pipe(errorsLogger())
    .pipe(newer({ dest: base, map: mapSrcToLib }))
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
      // gulp-babel always converts the extension to .js, but we want to keep the original one
      revertPath()
    )
    .pipe(
      // Passing 'file.relative' because newer() above uses a relative
      // path and this keeps it consistent.
      rename(file => path.resolve(file.base, mapSrcToLib(file.relative)))
    )
    .pipe(gulp.dest(base));
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
    packages.map(async ({ src, format, dest, name, filename }) => {
      const pkgJSON = require("./" + src + "/package.json");
      const version = pkgJSON.version + versionSuffix;
      const { dependencies = {}, peerDependencies = {} } = pkgJSON;
      const external = Object.keys(dependencies).concat(
        Object.keys(peerDependencies)
      );
      let nodeResolveBrowser = false,
        babelEnvName = "rollup";
      switch (src) {
        case "packages/babel-standalone":
          nodeResolveBrowser = true;
          babelEnvName = "standalone";
          break;
      }
      const input = getIndexFromPackage(src);
      fancyLog(`Compiling '${chalk.cyan(input)}' with rollup ...`);
      const bundle = await rollup({
        input,
        external,
        onwarn(warning, warn) {
          if (warning.code !== "CIRCULAR_DEPENDENCY") {
            warn(warning);
            // https://github.com/babel/babel/pull/12011#discussion_r540434534
            throw new Error("Rollup aborted due to warnings above");
          }
        },
        plugins: [
          rollupBabelSource(),
          rollupReplace({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
            BABEL_VERSION: JSON.stringify(babelVersion),
            VERSION: JSON.stringify(version),
          }),
          rollupCommonJs({
            include: [
              /node_modules/,
              "packages/babel-runtime/regenerator/**",
              "packages/babel-preset-env/data/*.js",
              // Rollup doesn't read export maps, so it loads the cjs fallback
              "packages/babel-compat-data/*.js",
              "packages/*/src/**/*.cjs",
            ],
          }),
          rollupBabel({
            envName: babelEnvName,
            babelrc: false,
            babelHelpers: "bundled",
            extends: "./babel.config.js",
            extensions: [".mjs", ".cjs", ".ts", ".js"],
          }),
          rollupNodeResolve({
            extensions: [".mjs", ".cjs", ".ts", ".js", ".json"],
            browser: nodeResolveBrowser,
            preferBuiltins: true,
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
    })
  );
}

function buildRollupDts(packages) {
  const sourcemap = process.env.NODE_ENV === "production";
  return Promise.all(
    packages.map(async packageName => {
      const input = `${packageName}/lib/index.d.ts`;
      fancyLog(`Bundling '${chalk.cyan(input)}' with rollup ...`);
      const bundle = await rollup({
        input,
        plugins: [rollupDts()],
      });

      await finish(
        gulp.src(`${packageName}/lib/**/*.d.ts{,.map}`).pipe(unlink())
      );

      await bundle.write({
        file: `${packageName}/lib/index.d.ts`,
        format: "es",
        sourcemap: sourcemap,
        exports: "named",
      });
    })
  );
}

function removeDts(exclude) {
  return getFiles(defaultDtsGlob, { exclude }).pipe(unlink());
}

function copyDts(packages) {
  return getFiles(`${defaultPackagesGlob}/src/**/*.d.ts`, { include: packages })
    .pipe(rename(file => path.resolve(file.base, mapSrcToLib(file.relative))))
    .pipe(gulp.dest(monorepoRoot));
}

const libBundles = [
  "packages/babel-parser",
  "packages/babel-plugin-proposal-optional-chaining",
  "packages/babel-preset-typescript",
  "packages/babel-helper-member-expression-to-functions",
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
gulp.task("clean-dts", () => removeDts(/* exclude */ dtsBundles));

gulp.task("build-babel", () => buildBabel(/* exclude */ libBundles));

gulp.task(
  "build",
  gulp.series(
    gulp.parallel("build-rollup", "build-babel"),
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

gulp.task("build-no-bundle", () => buildBabel());

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
    gulp.watch(defaultSourcesGlob, gulp.task("build-no-bundle"));
    gulp.watch(
      babelStandalonePluginConfigGlob,
      gulp.task("generate-standalone")
    );
    gulp.watch(buildTypingsWatchGlob, gulp.task("generate-type-helpers"));
  })
);
