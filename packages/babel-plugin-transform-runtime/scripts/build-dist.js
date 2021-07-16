import path from "path";
import fs from "fs";
import { createRequire } from "module";
import helpers from "@babel/helpers";
import babel from "@babel/core";
import template from "@babel/template";
import t from "@babel/types";
import { fileURLToPath } from "url";

import transformRuntime from "../lib/index.js";
import corejs2Definitions from "./runtime-corejs2-definitions.js";
import corejs3Definitions from "./runtime-corejs3-definitions.js";

const require = createRequire(import.meta.url);
const runtimeVersion = require("@babel/runtime/package.json").version;

function outputFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data);
}

writeHelpers("@babel/runtime");
writeHelpers("@babel/runtime-corejs2", { corejs: 2 });
writeHelpers("@babel/runtime-corejs3", {
  corejs: { version: 3, proposals: true },
});

writeCoreJS({
  corejs: 2,
  proposals: true,
  definitions: corejs2Definitions,
  paths: [
    "is-iterable",
    "get-iterator",
    // This was previously in definitions, but was removed to work around
    // zloirock/core-js#262. We need to keep it in @babel/runtime-corejs2 to
    // avoid a breaking change there.
    "symbol/async-iterator",
  ],
  corejsRoot: "core-js/library/fn",
});
writeCoreJS({
  corejs: 3,
  proposals: false,
  definitions: corejs3Definitions,
  paths: [],
  corejsRoot: "core-js-pure/stable",
});
writeCoreJS({
  corejs: 3,
  proposals: true,
  definitions: corejs3Definitions,
  paths: ["is-iterable", "get-iterator", "get-iterator-method"],
  corejsRoot: "core-js-pure/features",
});

function writeCoreJS({
  corejs,
  proposals,
  definitions: { BuiltIns, StaticProperties, InstanceProperties },
  paths,
  corejsRoot,
}) {
  const pkgDirname = getRuntimeRoot(`@babel/runtime-corejs${corejs}`);

  Object.keys(BuiltIns).forEach(name => {
    const { stable, path } = BuiltIns[name];
    if (stable || proposals) paths.push(path);
  });

  Object.keys(StaticProperties).forEach(builtin => {
    const props = StaticProperties[builtin];
    Object.keys(props).forEach(name => {
      const { stable, path } = props[name];
      if (stable || proposals) paths.push(path);
    });
  });

  if (InstanceProperties) {
    Object.keys(InstanceProperties).forEach(name => {
      const { stable, path } = InstanceProperties[name];
      if (stable || proposals) paths.push(`instance/${path}`);
    });
  }

  const runtimeRoot = proposals ? "core-js" : "core-js-stable";
  paths.forEach(function (corejsPath) {
    outputFile(
      path.join(pkgDirname, runtimeRoot, `${corejsPath}.js`),
      `module.exports = require("${corejsRoot}/${corejsPath}");`
    );
  });

  writeCorejsExports(pkgDirname, runtimeRoot, paths);
}

function writeCorejsExports(pkgDirname, runtimeRoot, paths) {
  const pkgJsonPath = require.resolve(`${pkgDirname}/package.json`);
  const pkgJson = require(pkgJsonPath);
  const exports = pkgJson.exports;
  // Export `./core-js/` so `import "@babel/runtime-corejs3/core-js/some-feature.js"` works
  exports[`./${runtimeRoot}/`] = `./${runtimeRoot}/`;
  for (const corejsPath of paths) {
    // Export `./core-js/some-feature` so `import "@babel/runtime-corejs3/core-js/some-feature"` also works
    const corejsExportPath = `./${runtimeRoot}/${corejsPath}`;
    exports[corejsExportPath] = corejsExportPath + ".js";
  }
  pkgJson.exports = exports;
  outputFile(pkgJsonPath, JSON.stringify(pkgJson, undefined, 2) + "\n");
}

function writeHelperFile(
  runtimeName,
  pkgDirname,
  helperPath,
  helperName,
  { esm, corejs }
) {
  const fileName = `${helperName}.js`;
  const filePath = esm
    ? path.join("helpers", "esm", fileName)
    : path.join("helpers", fileName);
  const fullPath = path.join(pkgDirname, filePath);

  outputFile(
    fullPath,
    buildHelper(runtimeName, pkgDirname, fullPath, helperName, { esm, corejs })
  );

  return esm ? `./helpers/esm/${fileName}` : `./helpers/${fileName}`;
}

function writeHelpers(runtimeName, { corejs } = {}) {
  const pkgDirname = getRuntimeRoot(runtimeName);
  const helperSubExports = {};
  for (const helperName of helpers.list) {
    const helperPath = path.join("helpers", helperName);
    const cjs = writeHelperFile(
      runtimeName,
      pkgDirname,
      helperPath,
      helperName,
      { esm: false, corejs }
    );
    const esm = writeHelperFile(
      runtimeName,
      pkgDirname,
      helperPath,
      helperName,
      { esm: true, corejs }
    );

    // Node.js versions >=13.0.0, <13.7.0 support the `exports` field but
    // not conditional exports (`require`/`node`/`default`)
    // We can specify exports with an array of fallbacks:
    // - Node.js >=13.7.0 and bundlers will succesfully load the first
    //   array entry:
    //    * Node.js will always load the CJS file
    //    * Modern tools when using "import" will load the ESM file
    //    * Everything else (old tools, or requrie() in tools) will
    //      load the CJS file
    // - Node.js 13.2-13.7 will ignore the "node" and "import" conditions,
    //   will fallback to "default" and load the CJS file
    // - Node.js <13.2.0 will fail resolving the first array entry, and will
    //   fallback to the second entry (the CJS file)
    // In Babel 8 we can simplify this.
    helperSubExports[`./${path.posix.join("helpers", helperName)}`] = [
      { node: cjs, import: esm, default: cjs },
      cjs,
    ];
    // For backward compatibility. We can remove this in Babel 8.
    helperSubExports[`./${path.posix.join("helpers", "esm", helperName)}`] =
      esm;
  }

  writeHelperExports(runtimeName, helperSubExports);
}

function writeHelperExports(runtimeName, helperSubExports) {
  const exports = {
    ...helperSubExports,
    "./package": "./package.json",
    "./package.json": "./package.json",
    "./regenerator": "./regenerator/index.js",
    "./regenerator/*.js": "./regenerator/*.js",
    // These patterns are deprecated, but since patterns
    // containing * are not supported in every Node.js
    // version we keep them for better compatibility.
    "./regenerator/": "./regenerator/",
  };
  const pkgDirname = getRuntimeRoot(runtimeName);
  const pkgJsonPath = require.resolve(`${pkgDirname}/package.json`);
  const pkgJson = require(pkgJsonPath);
  pkgJson.exports = exports;
  outputFile(pkgJsonPath, JSON.stringify(pkgJson, undefined, 2) + "\n");
}

function getRuntimeRoot(runtimeName) {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    runtimeName.replace(/^@babel\//, "babel-")
  );
}

function buildHelper(
  runtimeName,
  pkgDirname,
  helperFilename,
  helperName,
  { esm, corejs }
) {
  const tree = t.program([], [], esm ? "module" : "script");
  const dependencies = {};
  let bindings = null;

  if (!esm) {
    bindings = [];
    helpers.ensure(helperName, babel.File);
    for (const dep of helpers.getDependencies(helperName)) {
      const id = (dependencies[dep] = t.identifier(t.toIdentifier(dep)));
      tree.body.push(template.statement.ast`
        var ${id} = require("${dep}");
      `);
      bindings.push(id.name);
    }
  }

  const helper = helpers.get(
    helperName,
    dep => dependencies[dep],
    esm ? null : template.expression.ast`module.exports`,
    bindings
  );
  tree.body.push(...helper.nodes);

  return babel.transformFromAst(tree, null, {
    filename: helperFilename,
    presets: [
      [
        "@babel/preset-env",
        { modules: false, exclude: ["@babel/plugin-transform-typeof-symbol"] },
      ],
    ],
    plugins: [
      [transformRuntime, { corejs, version: runtimeVersion }],
      buildRuntimeRewritePlugin(runtimeName, helperName),
      esm ? null : addDefaultCJSExport,
    ].filter(Boolean),
    overrides: [
      {
        exclude: /typeof/,
        plugins: ["@babel/plugin-transform-typeof-symbol"],
      },
    ],
  }).code;
}

function buildRuntimeRewritePlugin(runtimeName, helperName) {
  /**
   * rewrite helpers imports to runtime imports
   * @example
   * adjustImportPath(ast`"setPrototypeOf"`)
   * // returns ast`"@babel/runtime/helpers/esm/setPrototypeOf"`
   * @param {*} node The string literal contains import path
   */
  function adjustImportPath(node) {
    if (helpers.list.includes(node.value)) {
      node.value = `./${node.value}.js`;
    }
  }

  return {
    pre(file) {
      const original = file.get("helperGenerator");
      file.set("helperGenerator", name => {
        // make sure that helpers won't insert circular references to themselves
        if (name === helperName) return false;

        return original(name);
      });
    },
    visitor: {
      ImportDeclaration(path) {
        adjustImportPath(path.get("source").node);
      },
      CallExpression(path) {
        if (
          !path.get("callee").isIdentifier({ name: "require" }) ||
          path.get("arguments").length !== 1 ||
          !path.get("arguments")[0].isStringLiteral()
        ) {
          return;
        }

        // replace reference to internal helpers with @babel/runtime import path
        adjustImportPath(path.get("arguments")[0].node);
      },
    },
  };
}

function addDefaultCJSExport({ template }) {
  return {
    visitor: {
      AssignmentExpression: {
        exit(path) {
          if (path.get("left").matchesPattern("module.exports")) {
            path.insertAfter(template.expression.ast`
              module.exports.default = module.exports,
              module.exports.__esModule = true
            `);
          }
        },
      },
    },
  };
}
