"use strict";
const path = require("path");
const gulp = require("gulp");
const merge = require("merge-stream");
const filter = require("gulp-filter");
const babel = require("gulp-babel");
const newer = require("gulp-newer");
const log = require("fancy-log");
const chalk = require("chalk");
const through = require("through2");

const config = require("../config");

const root = path.join(__dirname, "../../..");

function rename(fn) {
  return through.obj(function(file, enc, callback) {
    file.path = fn(file);
    callback(null, file);
  });
}

function swapSrcWithLib(srcPath) {
  const parts = srcPath.split(path.sep);
  parts[1] = "lib";
  return parts.join(path.sep);
}

module.exports = function buildCommonJs(excludeBundles = true) {
  return merge(
    config.workspaces.map(source => {
      const base = path.join(root, source);

      let stream = gulp.src(`./${source}/*/src/**/*.js`, { base });

      if (excludeBundles) {
        const filters = config.rollupBundles.map(p => `!**/${p}/**`);
        filters.unshift("**");
        stream = stream.pipe(filter(filters));
      }

      return stream
        .on("error", err => {
          log.error(err);
        })
        .pipe(newer({ dest: base, map: swapSrcWithLib }))
        .on("data", file => {
          log(`Compiling '${chalk.cyan(file.relative)}'...`);
        })
        .pipe(babel())
        .pipe(
          // Passing 'file.relative' because newer() above uses a relative
          // path and this keeps it consistent.
          rename(file => path.resolve(file.base, swapSrcWithLib(file.relative)))
        )
        .pipe(gulp.dest(base));
    })
  );
};
