"use strict";
const path = require("path");
const rollup = require("rollup");
const rollupBabel = require("rollup-plugin-babel");
const rollupNodeResolve = require("rollup-plugin-node-resolve");
const log = require("fancy-log");
const chalk = require("chalk");

const config = require("../config");

module.exports = function bundle() {
  return Promise.all(
    config.rollupBundles.map(pkg => {
      const input = `${pkg}/src/index.js`;
      log(`Compiling '${chalk.cyan(input)}' with rollup ...`);
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
};
