"use strict";

const fs = require("fs");
const path = require("path");

function relative(loc) {
  return path.join(__dirname, "..", loc);
}

const builtIns = require("babel-preset-env/data/built-ins.json");
const polyfills = Object.keys(builtIns);

polyfills
  .concat(["web.timers", "web.immediate", "web.dom.iterable"])
  .forEach(polyfill => {
    fs.writeFileSync(
      relative(`src/core-js/modules/${polyfill}.js`),
      `require("core-js/modules/${polyfill}");`,
    );
  });

fs.writeFileSync(
  relative("src/regenerator-runtime/runtime.js"),
  'require("regenerator-runtime/runtime");',
);
