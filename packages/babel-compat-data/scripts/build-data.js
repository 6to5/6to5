"use strict";

const path = require("path");
const compatData = require("@mdn/browser-compat-data").javascript;
const { process } = require("./build-modules-support");
const { generateData, environments, writeFile } = require("./utils-build-data");

const sources = new Map([
  ["plugin", "plugins"],
  ["corejs2-built-in", "corejs2-built-ins"],
  ["es", "es"],
]);

for (const [source, target] of sources) {
  const newData = generateData(
    environments,
    require(`./data/${source}-features`)
  );
  if (source === "plugin") {
    // add export-namespace-from from @mdn/browser-compat-data
    const exportNamespaceFromCompatData = process(
      compatData.statements.export.namespace
    );
    // the node.js compat data is 12.0, the first node version ships `export *` behind a flag
    // here we overwrite to 13.2 which is the first unflagged version
    exportNamespaceFromCompatData.node = "13.2";
    newData["proposal-export-namespace-from"] = exportNamespaceFromCompatData;
  }
  const dataPath = path.join(__dirname, `../data/${target}.json`);

  if (!writeFile(newData, dataPath, target)) {
    process.exitCode = 1;
    break;
  }
}
