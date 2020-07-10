"use strict";

const path = require("path");
const fs = require("fs");
const helpers = require("@babel/helpers");
const babel = require("@babel/core");
const template = require("@babel/template");
const t = require("@babel/types");

const transformRuntime = require("../");

const runtimeVersion = require("@babel/runtime/package.json").version;
const outputFileSync = function (filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data);
};

writeHelpers("@babel/runtime");
writeHelpers("@babel/runtime-corejs3", {
  corejs: { version: 3, proposals: true },
});

function writeHelpers(runtimeName, { corejs } = {}) {
  writeHelperFiles(runtimeName, { corejs, esm: false });
  writeHelperFiles(runtimeName, { corejs, esm: true });
}

function writeHelperFiles(runtimeName, { esm, corejs }) {
  const pkgDirname = getRuntimeRoot(runtimeName);

  for (const helperName of helpers.list) {
    const helperFilename = path.join(
      pkgDirname,
      "helpers",
      esm ? "esm" : "",
      `${helperName}.js`
    );

    outputFileSync(
      helperFilename,
      buildHelper(runtimeName, pkgDirname, helperFilename, helperName, {
        esm,
        corejs,
      })
    );
  }
}

function getRuntimeRoot(runtimeName) {
  return path.resolve(
    __dirname,
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
        var ${id} = require("${`./${dep}`}");
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
      [
        transformRuntime,
        { corejs, useESModules: esm, version: runtimeVersion },
      ],
      buildRuntimeRewritePlugin(
        runtimeName,
        path.relative(path.dirname(helperFilename), pkgDirname),
        helperName
      ),
    ],
    overrides: [
      {
        exclude: /typeof/,
        plugins: ["@babel/plugin-transform-typeof-symbol"],
      },
    ],
  }).code;
}

function buildRuntimeRewritePlugin(runtimeName, relativePath, helperName) {
  function adjustImportPath(node, relativePath) {
    node.value =
      helpers.list.indexOf(node.value) !== -1
        ? `./${node.value}`
        : node.value.replace(runtimeName + "/", relativePath + "/");
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
        adjustImportPath(path.get("source").node, relativePath);
      },
      CallExpression(path) {
        if (
          !path.get("callee").isIdentifier({ name: "require" }) ||
          path.get("arguments").length !== 1 ||
          !path.get("arguments")[0].isStringLiteral()
        ) {
          return;
        }

        // replace any reference to @babel/runtime and other helpers
        // with a relative path
        adjustImportPath(path.get("arguments")[0].node, relativePath);
      },
    },
  };
}
