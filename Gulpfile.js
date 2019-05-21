"use strict";
const gulp = require("gulp");

const tasks = require("./scripts/gulp/tasks");

tasks.build = gulp.parallel(tasks.bundle, tasks.buildCommonJs);
tasks.default = tasks.build;

module.exports = tasks;

//gulp.task("build-no-bundle", () => buildBabel());

/*gulp.task(
  "watch",
  gulp.series("build-no-bundle", function watch() {
    gulpWatch(
      sources.map(getGlobFromSource),
      { debounceDelay: 200 },
      gulp.task("build-no-bundle")
    );
  })
);

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
*/
